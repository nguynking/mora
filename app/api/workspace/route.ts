import { chatAction } from '@/lib/chat';
import { database, identity, ensureWorkspace, json, failure, clean, sameOrigin, roomExists, HttpError, runtime, generate } from '@/lib/mora';
export const dynamic='force-dynamic';
async function snapshotFor(room:string,context:Record<string,unknown>){const db=database();const [messages,work]=await Promise.all([db.prepare('SELECT author,text FROM messages WHERE room_id=? ORDER BY created DESC LIMIT 50').bind(room).all(),db.prepare('SELECT title,output FROM tasks WHERE room_id=? AND output IS NOT NULL ORDER BY updated DESC LIMIT 3').bind(room).all()]);return {...context,conversation:messages.results.reverse(),previousOutputs:work.results};}
export async function GET(){try{
 const user=await identity();await ensureWorkspace(user);const db=database();
 await db.prepare("UPDATE tasks SET status='failed',error='Tác vụ bị gián đoạn. Vui lòng thử lại.',updated=? WHERE status='generating' AND updated<?").bind(Date.now(),Date.now()-120000).run();
 const visible='SELECT id FROM rooms WHERE restricted=0 OR EXISTS (SELECT 1 FROM room_members WHERE room_id=rooms.id AND member_id=?)';
 const queries=[`SELECT * FROM rooms WHERE id IN (${visible}) ORDER BY created`,`SELECT * FROM (SELECT * FROM messages WHERE room_id IN (${visible}) ORDER BY created DESC LIMIT 1500) ORDER BY created`,`SELECT * FROM contexts WHERE room_id IN (${visible})`,`SELECT * FROM tasks WHERE room_id IN (${visible}) ORDER BY created DESC LIMIT 100`,`SELECT * FROM reactions WHERE message_id IN (SELECT id FROM messages WHERE room_id IN (${visible}))`,`SELECT * FROM files WHERE room_id IN (${visible}) ORDER BY created DESC`,`SELECT * FROM room_members WHERE room_id IN (${visible})`];
 const [rooms,messages,contexts,tasks,reactions,files,roomMembers]=await Promise.all(queries.map(sql=>db.prepare(sql).bind(user.userId).all()));
 const [members,bots]=await Promise.all([db.prepare('SELECT id,name,joined FROM members ORDER BY joined').all(),db.prepare('SELECT * FROM bots ORDER BY created').all()]);
 return json({user:{id:user.userId,name:user.displayName},rooms:rooms.results,messages:messages.results,contexts:contexts.results,tasks:tasks.results,members:members.results,bots:bots.results,roomMembers:roomMembers.results,reactions:reactions.results,files:files.results,aiConnected:!!runtime().OPENAI_API_KEY});
 }catch(e){return failure(e)}}

export async function POST(request:Request){try{
 sameOrigin(request);const user=await identity();const body=await request.json() as Record<string,unknown>;const db=database();const now=Date.now();const action=clean(body.action,30);const room=typeof body.room==='string'?body.room:'product';await ensureWorkspace(user);
 const chatResult=await chatAction(action,body,room,user,now);if(chatResult)return chatResult;
 await roomExists(room);
 const addMessage=(text:string,kind='system',author=user.displayName,id=crypto.randomUUID(),parent:string|null=null)=>db.prepare('INSERT INTO messages(id,room_id,author_id,author,text,kind,created,parent_id) VALUES(?,?,?,?,?,?,?,?)').bind(id,room,kind==='agent'?'mora':user.userId,author,text,kind,now,parent);
 if(action==='message'){
  const text=clean(body.text);const id=clean(body.id,80);let parent=null;if(body.parent){parent=clean(body.parent,80);if(!await db.prepare('SELECT id FROM messages WHERE id=? AND room_id=?').bind(parent,room).first())throw new HttpError(400,'Luồng trả lời không hợp lệ.');}
  await db.prepare('INSERT OR IGNORE INTO messages(id,room_id,author_id,author,text,kind,parent_id,created) VALUES(?,?,?,?,?,?,?,?)').bind(id,room,user.userId,user.displayName,text,'human',parent,now).run();return json({id});
 }
 if(action==='room'){
  const name=clean(body.name,50).replace(/\s+/g,'-').toLowerCase();const id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO rooms(id,name,description,created) VALUES(?,?,?,?)').bind(id,name,typeof body.description==='string'?body.description.slice(0,180):'',now),db.prepare('INSERT INTO contexts(room_id,goal,repo,decisions,editor,updated) VALUES(?,?,?,?,?,?)').bind(id,'Cùng nhóm hoàn thành dự án.','','',user.displayName,now)]);return json({id});
 }
 if(action==='context'){
  const goal=clean(body.goal,1500);const repo=typeof body.repo==='string'?body.repo.trim():'';if(repo&&!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new HttpError(400,'Nhập kho mã theo dạng owner/repository.');const decisions=typeof body.decisions==='string'?body.decisions.slice(0,5000):'';
  const result=await db.prepare('UPDATE contexts SET goal=?,repo=?,decisions=?,revision=revision+1,editor=?,updated=? WHERE room_id=? AND revision=?').bind(goal,repo,decisions,user.displayName,now,room,body.revision).run();if(!result.meta.changes)throw new HttpError(409,'Bối cảnh vừa được đồng đội cập nhật. Đóng và mở lại để xem phiên bản mới.');await addMessage('đã cập nhật bối cảnh chung.').run();return json({ok:true});
 }
 if(action==='react'){
  const message=clean(body.message,80);if(!await db.prepare('SELECT id FROM messages WHERE id=? AND room_id=?').bind(message,room).first())throw new HttpError(404,'Tin nhắn không tồn tại.');const emoji=body.emoji==='heart'?'heart':'thumb';const id=`${message}:${user.userId}:${emoji}`;
  const existing=await db.prepare('SELECT id FROM reactions WHERE id=?').bind(id).first();if(existing)await db.prepare('DELETE FROM reactions WHERE id=?').bind(id).run();else await db.prepare('INSERT OR IGNORE INTO reactions(id,message_id,user_id,emoji) VALUES(?,?,?,?)').bind(id,message,user.userId,emoji).run();return json({ok:true});
 }
 if(action==='propose'){
  const text=clean(body.text,3000);const context=await db.prepare('SELECT * FROM contexts WHERE room_id=?').bind(room).first<Record<string,unknown>>();if(!context)throw new HttpError(404,'Thiếu bối cảnh.');
  const parent=body.parent?clean(body.parent,80):null;if(parent&&!await db.prepare('SELECT id FROM messages WHERE id=? AND room_id=?').bind(parent,room).first())throw new HttpError(400,'Luồng không hợp lệ.');const snapshot={...await snapshotFor(room,context),parentId:parent};
  const mode=runtime().OPENAI_API_KEY?'live':'demo';let plan=['Làm rõ yêu cầu và các quyết định đã lưu trong bối cảnh chung.','Soạn phương án thực hiện, nêu rõ điểm cần xác nhận.','Chuẩn bị checklist và ghi chú bàn giao cho thành viên tiếp theo.'];
  if(mode==='live'){const answer=await generate(JSON.stringify({request:text,context:snapshot}),'Bạn là Mora, trợ lý cộng tác tiếng Việt. Chỉ tạo 3 bước kế hoạch khả thi để SOẠN TÀI LIỆU, không thực thi mã. Không tuyên bố đã đọc repo hoặc file. Trả về JSON array gồm đúng 3 string, không markdown.');try{const p=JSON.parse(answer);if(Array.isArray(p)&&p.length===3&&p.every(x=>typeof x==='string'))plan=p;else throw Error();}catch{throw new HttpError(502,'Chưa tạo được kế hoạch hợp lệ. Hãy thử lại.');}}
  const id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO tasks(id,room_id,title,request,plan,context_snapshot,context_revision,status,mode,requester,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,room,text.replace(/^@mora\s*/i,'').slice(0,90),text,JSON.stringify(plan),JSON.stringify(snapshot),context.revision,'pending',mode,user.displayName,now,now),addMessage(mode==='demo'?'Mình đã tạo kế hoạch mẫu từ yêu cầu của bạn. Duyệt để thử luồng bàn giao; bản này chưa thực thi mã.':'Mình đã đề xuất kế hoạch. Sau khi duyệt, mình sẽ soạn hướng dẫn và ghi chú bàn giao từ bối cảnh hiện có.','agent','Mora',crypto.randomUUID(),parent)]);return json({id});
 }
 if(['approve','run','stop','continue','revise'].includes(action)){
  const id=clean(body.id,80);const task=await db.prepare('SELECT * FROM tasks WHERE id=? AND room_id=?').bind(id,room).first<{id:string;room_id:string;title:string;request:string;plan:string;context_snapshot:string;context_revision:number;status:string;mode:string;updated:number}>();if(!task)throw new HttpError(404,'Không tìm thấy tác vụ.');
  if(action==='approve'){
   if(typeof body.expectedUpdated!=='number'||typeof body.expectedPlan!=='string')throw new HttpError(400,'Thiếu phiên bản kế hoạch đã xem.');if(task.updated!==body.expectedUpdated||task.plan!==body.expectedPlan)throw new HttpError(409,'Kế hoạch vừa được thay đổi. Hãy xem lại trước khi duyệt.');
   const current=await db.prepare('SELECT revision FROM contexts WHERE room_id=?').bind(room).first<{revision:number}>();if(current?.revision!==task.context_revision)throw new HttpError(409,'Bối cảnh đã thay đổi. Chọn Cập nhật kế hoạch trước khi duyệt.');
   const result=await db.prepare("UPDATE tasks SET status='running',approved_by=?,updated=? WHERE id=? AND updated=? AND plan=? AND status='pending' AND context_revision=(SELECT revision FROM contexts WHERE room_id=tasks.room_id)").bind(user.displayName,now,id,body.expectedUpdated,body.expectedPlan).run();if(!result.meta.changes)throw new HttpError(409,'Tác vụ đã thay đổi trạng thái.');await addMessage(`đã duyệt kế hoạch “${task.title}”.`).run();return json({ok:true});
  }
  if(action==='stop'){
   const result=await db.prepare("UPDATE tasks SET status='stopped',updated=? WHERE id=? AND status IN ('pending','running','generating')").bind(now,id).run();if(result.meta.changes)await addMessage(`đã dừng tác vụ “${task.title}”.`).run();return json({ok:true});
  }
  if(action==='revise'){
   if(['running','generating'].includes(task.status))throw new HttpError(409,'Dừng tác vụ trước khi chỉnh kế hoạch.');const context=await db.prepare('SELECT * FROM contexts WHERE room_id=?').bind(room).first<Record<string,unknown>>();
   const plan=typeof body.plan==='string'?body.plan.split('\n').map(x=>x.trim()).filter(Boolean):JSON.parse(task.plan);if(!plan.length||plan.length>8||plan.some((x:string)=>x.length>1000))throw new HttpError(400,'Kế hoạch cần từ 1 đến 8 bước.');
   const revised=await db.prepare("UPDATE tasks SET plan=?,context_snapshot=?,context_revision=?,status='pending',approved_by=NULL,output=NULL,error=NULL,updated=? WHERE id=? AND status NOT IN ('running','generating')").bind(JSON.stringify(plan),JSON.stringify(await snapshotFor(room,context!)),context?.revision,now,id).run();if(!revised.meta.changes)throw new HttpError(409,'Tác vụ đang chạy. Hãy dừng trước khi sửa kế hoạch.');return json({ok:true});
  }
  if(action==='continue'){await db.batch([db.prepare('UPDATE tasks SET continued_by=?,updated=? WHERE id=?').bind(user.displayName,now,id),addMessage(`tiếp nhận công việc “${task.title}”. Bối cảnh và kế hoạch đã được giữ lại.`)]);return json({ok:true});}
  if(action==='run'){
   const lock=await db.prepare("UPDATE tasks SET status='generating',updated=? WHERE id=? AND status='running'").bind(now,id).run();if(!lock.meta.changes)return json({ok:true});
   try{const context=JSON.parse(task.context_snapshot);const plan=JSON.parse(task.plan);const output=task.mode==='live'?await generate(JSON.stringify({request:task.request,context,plan}),'Bạn là Mora. Soạn bản hướng dẫn thực hiện chi tiết bằng tiếng Việt, kèm tiêu chí nghiệm thu, câu hỏi còn thiếu và bước tiếp theo cho đồng đội. Bạn KHÔNG có quyền đọc repo, thực thi mã, chạy test hoặc tạo PR. Không được tuyên bố đã thực hiện các việc đó. Chỉ dựa trên yêu cầu và bối cảnh được cung cấp. Trả về văn bản rõ ràng, không JSON.'):`BẢN BÀN GIAO MẪU\n\nYêu cầu\n${task.request}\n\nMục tiêu\n${context.goal||'Theo yêu cầu của nhóm.'}\n\nQuyết định cần giữ\n${context.decisions||'Chưa có quyết định nào được ghi lại.'}\n\nKế hoạch đã duyệt\n${plan.map((x:string,i:number)=>`${i+1}. ${x}`).join('\n')}\n\nBước tiếp theo\nĐồng đội xác nhận phạm vi, mở kho mã và thực hiện theo kế hoạch. Lưu kết quả kiểm tra vào cuộc trò chuyện này.\n\nTrạng thái thực tế\nĐây là kết quả mô phỏng để thử bàn giao. Chưa đọc hoặc sửa mã, chưa chạy kiểm thử, chưa tạo pull request.`;
    await db.prepare("UPDATE tasks SET status='done',output=?,updated=? WHERE id=? AND status='generating'").bind(output,Date.now(),id).run();return json({ok:true});
   }catch(error){await db.prepare("UPDATE tasks SET status='failed',error=?,updated=? WHERE id=? AND status='generating'").bind(error instanceof Error?error.message:'Không thể hoàn thành tác vụ.',Date.now(),id).run();throw error;}
  }
 }
 throw new HttpError(400,'Thao tác không hợp lệ.');
 }catch(e){return failure(e)}}
