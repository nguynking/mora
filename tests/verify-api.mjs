/** Local-only integration checks. Uses a disposable local Wrangler state directory.
 * Test identity headers are NEVER installed as a production auth fallback. */
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const state=mkdtempSync(join(tmpdir(),'mora-api-'));
const args=['--config','dist/server/wrangler.json','--local','--persist-to',state];
const run=(command,extra)=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js',command,...extra],{stdio:'pipe'});let logs='';p.stdout.on('data',d=>logs+=d);p.stderr.on('data',d=>logs+=d);p.on('exit',code=>code?reject(Error(logs)):resolve(logs));});
await run('d1',['execute','DB',...args,'--file','drizzle/0000_warm_meltdown.sql']);
const server=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev',...args,'--ip','127.0.0.1','--port','8789','--inspector-port','0'],{stdio:'pipe'});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
const base='http://127.0.0.1:8789';
const auth={a:{'oai-authenticated-user-id':'test-minh','oai-authenticated-user-email':'minh@example.test'},b:{'oai-authenticated-user-id':'test-linh','oai-authenticated-user-email':'linh@example.test'}};
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
 const html=await request('/');assert.equal(html.status,200);assert.match(html.data,/Mora Studio/);console.log('PASS server rendering and application title');
 console.log('All integration checks passed.');
}finally{server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));rmSync(state,{recursive:true,force:true});}
