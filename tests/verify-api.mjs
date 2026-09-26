/** Local-only integration checks. Uses a disposable local Wrangler state directory.
 * Test identity headers are NEVER installed as a production auth fallback. */
import { spawn } from 'node:child_process';
import { readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const state=mkdtempSync(join(tmpdir(),'mora-api-'));
const args=['--config','dist/server/wrangler.json','--local','--persist-to',state];
const run=(command,extra)=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js',command,...extra],{stdio:'pipe'});let logs='';p.stdout.on('data',d=>logs+=d);p.stderr.on('data',d=>logs+=d);p.on('exit',code=>code?reject(Error(logs)):resolve(logs));});
for (const migration of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort()) await run('d1',['execute','DB',...args,'--file','drizzle/'+migration]);
const server=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev',...args,'--ip','127.0.0.1','--port','8789','--inspector-port','0'],{stdio:'pipe'});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
const base='http://127.0.0.1:8789';
const auth={a:{'oai-authenticated-user-id':'test-minh','oai-authenticated-user-email':'minh@example.test'},b:{'oai-authenticated-user-id':'test-linh','oai-authenticated-user-email':'linh@example.test'},c:{'oai-authenticated-user-id':'test-an','oai-authenticated-user-email':'an@example.test'}};
async function request(path='/api/workspace',{user='a',method='GET',body,headers={}}={}){const r=await fetch(base+path,{method,headers:{...(auth[user]||{}),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...headers},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return {status:r.status,data,headers:r.headers};}
let room='product';const post=async(action,body={},user='a')=>{if(action==='approve'&&!('expectedUpdated' in body)){const t=(await request()).data.tasks.find(t=>t.id===body.id);body={...body,expectedUpdated:t.updated,expectedPlan:t.plan};}return request('/api/workspace',{method:'POST',user,body:{action,room,...body}});};
try{
 for(let i=0;i<50;i++){try{await fetch(base);break}catch{await new Promise(r=>setTimeout(r,200));if(i===49)throw Error(logs)}}
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
 const uploaded=await request('/api/files',{method:'POST',body:form});assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));const download=await request('/api/files?id='+uploaded.data.id,{user:'b'});assert.equal(download.data,'mora integration file');assert.equal(download.headers.get('x-content-type-options'),'nosniff');assert.equal((await request('/api/files?id='+uploaded.data.id,{user:'none'})).status,401);console.log('PASS file upload, cross-user download, and file authentication');
 const html=await request('/');assert.equal(html.status,200);assert.match(html.data,/Tìm cuộc trò chuyện/);console.log('PASS server rendering and application title');

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
 assert.equal((await request('/api/files?id='+fileId,{user:'b'})).status,200);
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
}finally{server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));rmSync(state,{recursive:true,force:true});}
