import { getDatabase } from './database';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export const database = getDatabase;
export async function identity() { const user=await getChatGPTUser(); if(!user) throw new HttpError(401,'Vui lòng đăng nhập để mở không gian làm việc.'); return user; }
export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export function failure(e:unknown){console.error('Mora request failed', e instanceof Error?e.message:'Unknown');return json({error:e instanceof HttpError?e.message:'Chưa thể lưu thay đổi. Vui lòng thử lại.'},e instanceof HttpError?e.status:503)}
export function clean(value:unknown,max=6000){if(typeof value!=='string'||!value.trim()||value.length>max)throw new HttpError(400,'Nội dung không hợp lệ hoặc quá dài.');return value.trim()}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new HttpError(403,'Yêu cầu không hợp lệ.');}
export function runtime(){return process.env}
export async function roomExists(id:string){const user=await identity();if(!await database().prepare('SELECT id FROM rooms WHERE id=? AND (restricted=0 OR EXISTS (SELECT 1 FROM room_members WHERE room_id=rooms.id AND member_id=?))').bind(id,user.userId).first())throw new HttpError(404,'Không tìm thấy cuộc trò chuyện.');}
export async function ensureWorkspace(user:{userId:string;displayName:string;email:string}){
 const db=database();const now=Date.now();
 await db.prepare('INSERT INTO members(id,name,email,joined) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email').bind(user.userId,user.displayName,user.email,now).run();
 await db.prepare('INSERT OR IGNORE INTO bots(id,name,role,creator_id,created) VALUES(?,?,?,?,?)').bind('mora','Mora','Hỗ trợ công việc hằng ngày, làm rõ ý tưởng và soạn nội dung.','system',now).run();
 if(await db.prepare('SELECT id FROM rooms LIMIT 1').first())return;
 const context={goal:'Ra mắt trải nghiệm mobile gọn gàng, dễ dùng cho Mora.',repo:'nguynking/mora',decisions:'Giữ nguyên API hiện tại.\nƯu tiên trải nghiệm trên màn hình 375px.\nMọi thay đổi cần được duyệt trước khi thực hiện.'};
 await db.batch([
 ...[{id:'product',name:'san-pham',description:'Xây dựng Mora, từ ý tưởng đến sản phẩm.'},{id:'general',name:'chung',description:'Thông báo và những câu chuyện của cả nhóm.'},{id:'ideas',name:'y-tuong',description:'Một chỗ cho những ý tưởng đang lớn dần.'}].map((r,i)=>db.prepare('INSERT OR IGNORE INTO rooms(id,name,description,created) VALUES(?,?,?,?)').bind(r.id,r.name,r.description,now+i)),
 ...['product','general','ideas'].map(id=>db.prepare('INSERT OR IGNORE INTO room_members(id,room_id,member_id,joined) VALUES(?,?,?,?)').bind(id+':mora',id,'mora',now)),
 ...['product','general','ideas'].map(id=>db.prepare('INSERT OR IGNORE INTO contexts(room_id,goal,repo,decisions,revision,editor,updated) VALUES(?,?,?,?,1,?,?)').bind(id,id==='product'?context.goal:'Cùng nhóm trao đổi và lưu lại quyết định.',id==='product'?context.repo:'',id==='product'?context.decisions:'','Mora',now)),
 ...[{id:'welcome-minh',room:'product',uid:'sample-minh',name:'Minh Nguyễn',text:'Mình tạo phòng này để cùng làm phiên bản mobile nhé. Menu đang bị tràn ở màn hình nhỏ. @Mora giúp nhóm lên kế hoạch sửa lỗi này.',kind:'sample',offset:9},{id:'welcome-linh',room:'product',uid:'sample-linh',name:'Linh Trần',text:'Giữ nguyên API hiện tại nha. Mình đã thêm yêu cầu vào bối cảnh chung để ai vào sau cũng nắm được.',kind:'sample',offset:8},{id:'welcome-mora',room:'product',uid:'mora',name:'Mora',text:'Mình đã chuẩn bị kế hoạch mẫu bên dưới. Cả nhóm có thể chỉnh bối cảnh, duyệt kế hoạch và thử bàn giao ngay trong phòng này.',kind:'agent',offset:7},{id:'welcome-general',room:'general',uid:'mora',name:'Mora',text:'Chào mừng đến không gian chung. Gửi tin nhắn cho nhóm, hoặc gọi @Mora để tạo kế hoạch làm việc.',kind:'agent',offset:0}].map(m=>db.prepare('INSERT OR IGNORE INTO messages(id,room_id,author_id,author,text,kind,created) VALUES(?,?,?,?,?,?,?)').bind(m.id,m.room,m.uid,m.name,m.text,m.kind,now-m.offset*60000)),
 db.prepare('INSERT OR IGNORE INTO tasks(id,room_id,title,request,plan,context_snapshot,context_revision,status,mode,requester,created,updated) VALUES(?,?,?,?,?,?,1,?,?,?,?,?)').bind('welcome-task','product','Sửa lỗi menu trên mobile','Menu bị tràn trên màn hình nhỏ. Giữ nguyên API hiện tại.',JSON.stringify(['Xác định menu bị tràn và các kích thước màn hình cần kiểm tra.','Đề xuất cách điều chỉnh bố cục, giữ nguyên API hiện tại.','Chuẩn bị checklist kiểm tra và ghi chú để đồng đội tiếp tục.']),JSON.stringify(context),'pending','demo','Minh Nguyễn',now-6*60000,now-6*60000)
 ]);
}
export async function generate(prompt:string,instructions:string){
 const config=runtime();if(!config.OPENAI_API_KEY)throw new HttpError(503,'Chưa kết nối dịch vụ AI.');
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${config.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:config.OPENAI_MODEL||'gpt-4.1-mini',instructions,input:prompt,max_output_tokens:1800,store:false}),signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new HttpError(502,'AI chưa phản hồi. Bạn có thể thử lại; chưa có thay đổi nào được thực thi.');
 const result=await response.json() as {output?:{content?:{type:string;text?:string}[]}[]};const text=result.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text||'').join('\n');if(!text)throw new HttpError(502,'AI trả về nội dung trống.');return text;
}
