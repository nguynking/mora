import { it, vi, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { Database, postgresStatement } from '../lib/database-adapter';
const state = await vi.hoisted(async () => { const { AsyncLocalStorage } = await import('node:async_hooks'); return { identity: new AsyncLocalStorage(), db: null, objects: new Map() }; });
vi.mock('server-only', () => ({}));
vi.mock('../lib/database', () => ({ getDatabase: () => state.db }));
vi.mock('../lib/supabase', () => ({
  FILE_BUCKET: 'mora-files', FILE_LIMIT: 5242880,
  allowedEmail: email => email.endsWith('@example.test'),
  sessionClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.identity.getStore() }, error: null }) } }),
  adminClient: () => ({ storage: { from: () => ({
    createSignedUploadUrl: async id => ({ data: { token: id }, error: null }),
    info: async id => ({ data: state.objects.has(id) ? { metadata: { size: state.objects.get(id).size } } : null, error: null }),
    remove: async ids => { ids.forEach(id => state.objects.delete(id)); return { error: null }; },
    createSignedUrl: async id => ({ data: { signedUrl: `https://storage.example.test/signed-download/${id}` }, error: null }),
  }) } }),
}));
import * as workspace from '../app/api/workspace/route';
import * as files from '../app/api/files/route';
const pg = new PGlite({ parsers: { 20: Number } });
beforeAll(async () => {
  delete process.env.OPENAI_API_KEY;
  await pg.exec('CREATE SCHEMA mora; SET search_path TO mora,public;');
  await pg.exec(readFileSync('db/postgres/0001_workspace.sql', 'utf8'));
  state.db = new Database(async (sql, values) => { const r = await pg.query(sql, values); return { rows: r.rows, count: r.affectedRows }; }, async statements => pg.transaction(async tx => {
    for (const s of statements) await tx.query(postgresStatement(s.sql), s.values);
  }));
});
afterAll(async () => { await pg.close(); });
const users = { a: ['test-minh','minh'], b: ['test-linh','linh'], c: ['test-an','an'] };
async function request(path='/api/workspace', {user='a', method='GET', body, headers={}}={}) {
  const person = users[user];
  const identity = person ? { id: person[0], email: person[1]+'@example.test', email_confirmed_at: '2026-01-01', user_metadata: {} } : null;
  return state.identity.run(identity, async () => {
  let response;
  if (body instanceof FormData) {
    const file = body.get('file');
    const prepared = await request('/api/files', {user,method:'POST',body:{action:'prepare',room:body.get('room'),name:file.name,size:file.size,mime:file.type}});
    if (prepared.status !== 200) return prepared;
    state.objects.set(prepared.data.id, file);
    return request('/api/files', {user,method:'POST',body:{action:'complete',id:prepared.data.id}});
  }
  const req = new Request('https://mora.example.test'+path, {method,headers:{'Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined});
  const route = path.startsWith('/api/files') ? files : workspace;
  response = await route[method](req);
  const text = await response.text(); let data; try { data=JSON.parse(text); } catch { data=text; }
  return {status:response.status, data, headers:response.headers};
  });
}
let room='product';const post=async(action,body={},user='a')=>{if(action==='approve'&&!('expectedUpdated' in body)){const t=(await request()).data.tasks.find(t=>t.id===body.id);body={...body,expectedUpdated:t.updated,expectedPlan:t.plan};}return request('/api/workspace',{method:'POST',user,body:{action,room,...body}});};
it('preserves existing messaging and collaboration behavior on PostgreSQL', async () => {
 assert.equal((await request('/api/workspace',{user:'none'})).status,401);console.log('PASS unauthenticated access rejected');
 let res=await request();assert.equal(res.status,200,JSON.stringify(res.data));assert.equal(res.data.rooms.length,3);assert.equal(res.data.tasks[0].mode,'demo');
 res=await post('room',{name:'api-test',description:'Local automated checks'});assert.equal(res.status,200);room=res.data.id;
 const messageId=crypto.randomUUID();assert.equal((await post('message',{id:messageId,text:'@Mora Giữ nguyên API.'})).status,200);await post('message',{id:messageId,text:'@Mora Giữ nguyên API.'});
 res=await request('/api/workspace',{user:'b'});assert.equal(res.data.messages.filter(m=>m.id===messageId).length,1);console.log('PASS cross-user shared chat and idempotent send');
 assert.equal((await post('message',{id:crypto.randomUUID(),text:'Đã xem.',parent:messageId},'b')).status,200);
 assert.equal((await post('message',{id:crypto.randomUUID(),text:'Bad thread.',parent:'welcome-minh'})).status,400);console.log('PASS thread reply and room validation');
 assert.equal((await request('/api/workspace',{method:'POST',body:{action:'message',room,text:'invalid',id:crypto.randomUUID()},headers:{origin:'https://evil.invalid'}})).status,403);console.log('PASS cross-origin writes rejected');
 const task=(await post('propose',{text:'@Mora Kiểm tra bàn giao'})).data.id;
 let context=(await request()).data.contexts.find(c=>c.room_id===room);
 assert.equal((await post('context',{goal:'Mục tiêu đã cập nhật',repo:'nguynking/mora',decisions:'Giữ nguyên API.',revision:context.revision})).status,200);
 assert.equal((await post('context',{goal:'Stale',repo:'',decisions:'',revision:context.revision})).status,409);
 assert.equal((await post('approve',{id:task})).status,409);console.log('PASS optimistic context edits and stale-plan approval blocked');
 const oldPlan=(await request()).data.tasks.find(t=>t.id===task);
 assert.equal((await post('revise',{id:task,plan:'Đọc yêu cầu\nSoạn hướng dẫn\nBàn giao'})).status,200);
 assert.equal((await post('approve',{id:task,expectedUpdated:oldPlan.updated,expectedPlan:oldPlan.plan})).status,409);
 assert.equal((await post('approve',{id:task})).status,200);assert.equal((await post('approve',{id:task})).status,409);
 assert.equal((await post('stop',{id:task},'b')).status,200);await post('run',{id:task});assert.equal((await request()).data.tasks.find(t=>t.id===task).status,'stopped');console.log('PASS duplicate approval rejected; stopped work stays stopped');
 const task2=(await post('propose',{text:'Lập checklist cho đồng đội'})).data.id;
 await post('approve',{id:task2});assert.equal((await post('run',{id:task2})).status,200);
 await post('continue',{id:task2},'b');const done=(await request()).data.tasks.find(t=>t.id===task2);assert.equal(done.status,'done');assert.match(done.output,/Chưa đọc hoặc sửa mã/);assert.equal(done.continued_by,'linh@example.test');console.log('PASS durable, honestly labelled handoff and second-person continuation');
 const form=new FormData();form.append('room',room);form.append('file',new File(['mora integration file'],'test.txt',{type:'text/plain'}));
 const uploaded=await request('/api/files',{method:'POST',body:form});assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));const download=await request('/api/files?id='+uploaded.data.id,{user:'b'});assert.equal(download.status,302);assert.match(download.headers.get('location'), /signed-download/);assert.equal((await request('/api/files?id='+uploaded.data.id,{user:'none'})).status,401);console.log('PASS file upload, cross-user download, and file authentication');


 // New messenger model: direct conversations and explicit group membership.
 await request('/api/workspace',{user:'c'});
 const direct=(await post('direct',{memberId:'test-linh'})).data.id;
 assert.ok(direct.startsWith('dm-'));
 const parallel=await Promise.all([post('direct',{memberId:'test-linh'}),post('direct',{memberId:'test-minh'},'b')]);
 assert.ok(parallel.every(result=>result.data.id===direct));
 room=direct;
 const privateMessage=crypto.randomUUID();
 assert.equal((await post('message',{text:'Tin nhắn riêng',id:privateMessage})).status,200);
 assert.ok((await request('/api/workspace',{user:'b'})).data.messages.some(message=>message.id===privateMessage));
 let stranger=(await request('/api/workspace',{user:'c'})).data;
 assert.ok(!stranger.rooms.some(item=>item.id===direct));
 assert.ok(!stranger.messages.some(item=>item.id===privateMessage));
 assert.ok(!stranger.contexts.some(item=>item.room_id===direct));
 assert.equal((await post('message',{text:'Không được gửi',id:crypto.randomUUID()},'c')).status,404);
 assert.equal((await post('add-members',{members:['test-an']})).status,400);
 const privateFile=new FormData();privateFile.append('room',room);privateFile.append('file',new File(['private'],'private.txt'));
 const fileId=(await request('/api/files',{method:'POST',body:privateFile})).data.id;
 assert.equal((await request('/api/files?id='+fileId,{user:'c'})).status,404);
 assert.equal((await request('/api/files?id='+fileId,{user:'b'})).status,302);
 const blockedUpload=new FormData();blockedUpload.append('room',room);blockedUpload.append('file',new File(['blocked'],'blocked.txt'));
 assert.equal((await request('/api/files',{method:'POST',user:'c',body:blockedUpload})).status,404);
 console.log('PASS private DM membership, concurrent deduplication, private file read/write isolation');
 const created=await post('bot',{name:'An bán hàng',role:'Tư vấn sản phẩm và soạn tin nhắn cho khách.'});
 assert.equal(created.status,200,JSON.stringify(created.data));
 const botId=created.data.botId;room=created.data.id;
 let saved=(await request()).data;
 assert.equal(saved.bots.find(bot=>bot.id===botId).role,'Tư vấn sản phẩm và soạn tin nhắn cho khách.');
 assert.equal(saved.rooms.find(item=>item.id===room).kind,'direct');
 const botMessage=crypto.randomUUID();await post('message',{text:'Chào An',id:botMessage});
 assert.equal((await post('bot-reply',{botId,messageId:botMessage})).status,503);
 assert.ok(!(await request()).data.messages.some(message=>message.id===`reply:${botMessage}:${botId}`));
 assert.equal((await post('direct',{memberId:'missing-user'})).status,404);
 const group=await post('group',{name:'Nhóm kinh doanh',members:['test-linh',botId]});
 assert.equal(group.status,200);room=group.data.id;
 assert.ok((await request('/api/workspace',{user:'b'})).data.rooms.some(item=>item.id===room));
 assert.ok(!(await request('/api/workspace',{user:'c'})).data.rooms.some(item=>item.id===room));
 assert.equal((await post('add-members',{members:['test-an']})).status,200);
 assert.ok((await request('/api/workspace',{user:'c'})).data.rooms.some(item=>item.id===room));
 assert.equal((await post('add-members',{members:['missing-user']})).status,404);
 assert.equal((await post('group',{name:'Nhóm trống',members:[]})).status,400);
 console.log('PASS named bot role persistence, bot/group membership, missing AI honest failure, adding human members');
 console.log('All integration checks passed.');
});

it('rejects forged Sites identity headers and unverified identities', async () => {
  const forged = await request('/api/workspace', { user: 'none', headers: { 'oai-authenticated-user-id': 'test-minh', 'oai-authenticated-user-email': 'minh@example.test' } });
  assert.equal(forged.status, 401);
  const response = await state.identity.run({ id: 'unverified', email: 'minh@example.test', user_metadata: {} }, () => workspace.GET());
  assert.equal(response.status, 401);
  const stranger = await state.identity.run({ id: 'stranger', email: 'uninvited@other.test', email_confirmed_at: '2026-01-01' }, () => workspace.GET());
  assert.equal(stranger.status, 401);
});

it('preserves atomic batches and treats user text as SQL parameters', async () => {
  await assert.rejects(state.db.batch([
    state.db.prepare('INSERT INTO members(id,name,email,joined) VALUES(?,?,?,?)').bind('rollback','Before failure','rollback@example.test',1),
    state.db.prepare('INSERT INTO rooms(id,name,description,created) VALUES(?,?,?,?)').bind('product','Duplicate','',1),
  ]));
  assert.equal(await state.db.prepare('SELECT id FROM members WHERE id=?').bind('rollback').first(), null);
  const attack = "Robert'); DROP TABLE rooms; -- ?";
  const result = await post('message', { id: crypto.randomUUID(), text: attack });
  assert.equal(result.status, 200);
  assert.ok((await request()).data.messages.some(message => message.text === attack));
});

it('enforces the full 5 MB file limit, ownership, existence, expiry, and idempotent completion', async () => {
  const prepare = size => request('/api/files', {method:'POST',body:{action:'prepare',room,name:'file.bin',size,mime:'application/octet-stream'}});
  assert.equal((await prepare(0)).status,400);
  assert.equal((await prepare(5242881)).status,400);
  const intent = await prepare(5242880);
  assert.equal(intent.status,200);
  const complete = (user='a') => request('/api/files',{user,method:'POST',body:{action:'complete',id:intent.data.id}});
  assert.equal((await complete('b')).status,404);
  assert.equal((await complete()).status,409);
  state.objects.set(intent.data.id,{size:5242880});
  assert.equal((await complete()).status,200);
  assert.equal((await complete()).status,200);
  assert.equal((await request()).data.messages.filter(message=>message.file_id===intent.data.id).length,1);
  const mismatch = await prepare(10);
  state.objects.set(mismatch.data.id,{size:20});
  assert.equal((await request('/api/files',{method:'POST',body:{action:'complete',id:mismatch.data.id}})).status,400);
  assert.equal(state.objects.has(mismatch.data.id),false);
  const expired = await prepare(10);
  await state.db.prepare('UPDATE uploads SET expires=? WHERE id=?').bind(1,expired.data.id).run();
  assert.equal((await request('/api/files',{method:'POST',body:{action:'complete',id:expired.data.id}})).status,410);
});
