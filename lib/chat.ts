import { database, clean, generate, HttpError, json, roomExists, runtime } from './mora';

type User = { userId: string; displayName: string };
type Bot = { id: string; name: string; role: string };

// One conversation model for people and bots. Membership, not the client, controls access.
export async function chatAction(action: string, body: Record<string, unknown>, room: string, user: User, now: number): Promise<Response | null> {
  const db = database();
  const participant = async (id: string) => {
    const person = await db.prepare('SELECT id,name FROM members WHERE id=? UNION ALL SELECT id,name FROM bots WHERE id=?').bind(id,id).first<{id:string;name:string}>();
    if (!person) throw new HttpError(404,'Không tìm thấy thành viên.');
    return person;
  };
  const membership = (roomId: string, id: string) => db.prepare('INSERT OR IGNORE INTO room_members(id,room_id,member_id,joined) VALUES(?,?,?,?)').bind(`${roomId}:${id}`,roomId,id,now);
  const context = (id: string) => db.prepare('INSERT OR IGNORE INTO contexts(room_id,goal,repo,decisions,editor,updated) VALUES(?,?,?,?,?,?)').bind(id,'','','',user.displayName,now);
  const direct = async (memberId: string) => {
    if (memberId===user.userId) throw new HttpError(400,'Chọn một thành viên khác.');
    const other=await participant(memberId);
    const key=JSON.stringify([user.userId,memberId].sort());
    // Stable ID and unique key make simultaneous starts of the same DM idempotent.
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
    const id='dm-'+Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
    await db.batch([db.prepare("INSERT OR IGNORE INTO rooms(id,name,description,created,kind,restricted,direct_key) VALUES(?,?,?,?,'direct',1,?)").bind(id,other.name,'',now,key),membership(id,user.userId),membership(id,memberId),context(id)]);
    return id;
  };
  if(action==='direct')return json({id:await direct(clean(body.memberId,100))});
  if(action==='bot'){
    const name=clean(body.name,50),role=clean(body.role,2000),id=crypto.randomUUID();
    await db.prepare('INSERT INTO bots(id,name,role,creator_id,created) VALUES(?,?,?,?,?)').bind(id,name,role,user.userId,now).run();
    return json({id:await direct(id),botId:id});
  }
  if(action==='group'||action==='add-members'){
    if(!Array.isArray(body.members)||body.members.length>50)throw new HttpError(400,'Chọn tối đa 50 thành viên.');
    const ids=[...new Set(body.members.map(id=>clean(id,100)))].filter(id=>id!==user.userId);
    if(!ids.length)throw new HttpError(400,'Chọn ít nhất một thành viên.');
    await Promise.all(ids.map(participant));
    if(action==='group'){
      const id=crypto.randomUUID(),name=clean(body.name,60);
      await db.batch([db.prepare("INSERT INTO rooms(id,name,description,created,kind,restricted) VALUES(?,?,?,?,'group',1)").bind(id,name,'',now),context(id),membership(id,user.userId),...ids.map(member=>membership(id,member))]);
      return json({id});
    }
    await roomExists(room);
    const current=await db.prepare('SELECT kind FROM rooms WHERE id=?').bind(room).first<{kind:string}>();
    if(current?.kind!=='group')throw new HttpError(400,'Tạo nhóm mới để thêm thành viên.');
    await db.batch(ids.map(id=>membership(room,id)));
    return json({id:room});
  }
  if(action==='bot-reply'){
    await roomExists(room);
    const botId=clean(body.botId,100),messageId=clean(body.messageId,100);
    const bot=await db.prepare('SELECT bots.id,bots.name,bots.role FROM bots JOIN room_members ON member_id=bots.id WHERE room_id=? AND bots.id=?').bind(room,botId).first<Bot>();
    if(!bot)throw new HttpError(404,'Bot chưa có trong cuộc trò chuyện này.');
    const message=await db.prepare('SELECT id,author_id,parent_id FROM messages WHERE id=? AND room_id=?').bind(messageId,room).first<{id:string;author_id:string;parent_id:string|null}>();
    if(!message||message.author_id!==user.userId)throw new HttpError(400,'Không tìm thấy tin nhắn của bạn.');
    const id=`reply:${messageId}:${botId}`;
    if(await db.prepare('SELECT id FROM messages WHERE id=?').bind(id).first())return json({id});
    if(!runtime().OPENAI_API_KEY)throw new HttpError(503,'Bot chưa kết nối AI. Tin nhắn của bạn đã được lưu.');
    await db.prepare('INSERT OR IGNORE INTO bot_replies(id,room_id,status,updated) VALUES(?,?,?,?)').bind(id,room,'ready',now).run();
    const lock=await db.prepare("UPDATE bot_replies SET status='running',updated=? WHERE id=? AND (status IN ('ready','failed') OR (status='running' AND updated<?))").bind(now,id,now-90000).run();
    if(!lock.meta.changes)return json({id,pending:true});
    try{
      const history=await db.prepare('SELECT author,text FROM messages WHERE room_id=? ORDER BY created DESC LIMIT 40').bind(room).all();
      const answer=await generate(JSON.stringify({conversation:history.results.reverse()}),`Bạn là ${bot.name}, một đồng đội AI trong Mora. Vai trò: ${bot.role}. Trả lời tự nhiên bằng ngôn ngữ của người dùng, ngắn gọn và có ích, như trò chuyện với đồng nghiệp. Chỉ dựa trên lịch sử cuộc trò chuyện này. Không bịa thông tin hoặc tuyên bố đã thực hiện hành động bên ngoài. Bạn không có công cụ để gửi email, truy cập kho mã, chạy mã hay đọc nội dung tệp đính kèm. Nếu thiếu thông tin, hỏi cụ thể. Đây là hội thoại, không tự tạo kế hoạch phê duyệt.`);
      await db.batch([db.prepare('INSERT OR IGNORE INTO messages(id,room_id,author_id,author,text,kind,parent_id,created) VALUES(?,?,?,?,?,?,?,?)').bind(id,room,bot.id,bot.name,answer,'agent',message.parent_id,Date.now()),db.prepare("UPDATE bot_replies SET status='done',updated=? WHERE id=?").bind(Date.now(),id)]);
      return json({id});
    }catch(error){await db.prepare("UPDATE bot_replies SET status='failed',updated=? WHERE id=?").bind(Date.now(),id).run();throw error;}
  }
  return null;
}
