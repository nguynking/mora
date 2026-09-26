import { database, identity, sameOrigin, roomExists, json, failure, HttpError, clean } from '@/lib/mora';
import { adminClient, FILE_BUCKET, FILE_LIMIT } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type PendingFile = { id: string; room_id: string; user_id: string; name: string; size: number; mime: string; expires: number };

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await identity();
    const body = await request.json();
    const db = database();
    const storage = adminClient().storage.from(FILE_BUCKET);
    if (body.action === 'prepare') {
      const room = clean(body.room, 100), name = clean(body.name, 160);
      if (!Number.isInteger(body.size) || body.size < 1 || body.size > FILE_LIMIT) throw new HttpError(400, 'Chọn tệp từ 1 byte đến 5 MB.');
      await roomExists(room);
      const id = crypto.randomUUID();
      await db.prepare('INSERT INTO uploads(id,room_id,user_id,name,size,mime,expires) VALUES(?,?,?,?,?,?,?)').bind(id, room, user.userId, name, body.size, typeof body.mime === 'string' ? body.mime.slice(0, 200) : 'application/octet-stream', Date.now() + 2 * 60 * 60 * 1000).run();
      const { data, error } = await storage.createSignedUploadUrl(id);
      if (error || !data) throw new HttpError(503, 'Chưa thể tải tệp.');
      return json({ id, token: data.token });
    }
    if (body.action !== 'complete') throw new HttpError(400, 'Thao tác không hợp lệ.');
    const id = clean(body.id, 100);
    const pending = await db.prepare('SELECT * FROM uploads WHERE id=? AND user_id=?').bind(id, user.userId).first<PendingFile>();
    if (!pending) throw new HttpError(404, 'Không tìm thấy tệp.');
    await roomExists(pending.room_id);
    if (await db.prepare('SELECT id FROM files WHERE id=?').bind(id).first()) return json({ id });
    if (pending.expires < Date.now()) throw new HttpError(410, 'Lượt tải đã hết hạn. Vui lòng thử lại.');
    const { data: info, error } = await storage.info(id);
    if (error || !info) throw new HttpError(409, 'Tệp chưa tải xong. Vui lòng thử lại.');
    if (!info.metadata || Number(info.metadata.size) !== pending.size || Number(info.metadata.size) > FILE_LIMIT) {
      await storage.remove([id]);
      throw new HttpError(400, 'Tệp không đúng kích thước đã chọn.');
    }
    const now = Date.now();
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO files(id,room_id,name,size,mime,uploader,created) VALUES(?,?,?,?,?,?,?)').bind(id, pending.room_id, pending.name, pending.size, pending.mime, user.displayName, now),
      db.prepare('INSERT OR IGNORE INTO messages(id,room_id,author_id,author,text,kind,file_id,file_name,created) VALUES(?,?,?,?,?,?,?,?,?)').bind(`file:${id}`, pending.room_id, user.userId, user.displayName, 'Đã chia sẻ một tệp.', 'human', id, pending.name, now),
    ]);
    return json({ id });
  } catch (error) { return failure(error); }
}

export async function GET(request: Request) {
  try {
    await identity();
    const id = clean(new URL(request.url).searchParams.get('id'), 100);
    const file = await database().prepare('SELECT name,room_id FROM files WHERE id=?').bind(id).first<{ name: string; room_id: string }>();
    if (!file) throw new HttpError(404, 'Không tìm thấy tệp.');
    await roomExists(file.room_id);
    const { data, error } = await adminClient().storage.from(FILE_BUCKET).createSignedUrl(id, 60, { download: file.name });
    if (error || !data) throw new HttpError(404, 'Không tìm thấy tệp.');
    return new Response(null, { status: 302, headers: { Location: data.signedUrl, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch (error) { return failure(error); }
}
