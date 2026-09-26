'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, AtSign, Check, ChevronRight, Download, FileText, MessageCircle, MoreHorizontal, Paperclip, Plus, Search, ThumbsUp, UserPlus, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Room = { id: string; name: string; description: string; created: number; kind: 'direct' | 'group'; restricted: number };
type Person = { id: string; name: string; role?: string };
type Message = { id: string; room_id: string; author_id: string; author: string; text: string; kind: string; created: number; parent_id?: string; file_id?: string; file_name?: string };
type Context = { room_id: string; goal: string; repo: string; decisions: string; revision: number };
type Task = { id: string; room_id: string; title: string; plan: string; status: string; output?: string; error?: string; updated: number; mode: string };
type State = { user: Person; rooms: Room[]; messages: Message[]; members: Person[]; bots: Person[]; roomMembers: { room_id: string; member_id: string }[]; reactions: { message_id: string; user_id: string; emoji: string }[]; contexts: Context[]; tasks: Task[]; aiConnected: boolean };
type Modal = '' | 'new' | 'connect' | 'bot' | 'group' | 'members' | 'add' | 'thread' | 'work' | 'context' | 'plan' | 'mention';
const time = (value: number) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const initials = (name: string) => name.replace(/@.*/, '').split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase();
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const recentTime = (value: number) => new Date(value).toDateString() === new Date().toDateString() ? time(value) : new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
const statusText: Record<string, string> = { pending: 'Chờ duyệt', running: 'Đã duyệt', generating: 'Đang soạn', stopped: 'Đã dừng', done: 'Hoàn thành', failed: 'Cần thử lại' };

function Avatar({ name, group = false }: { name: string; group?: boolean }) {
  const tone = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;
  return <span className={`avatar tone-${tone}`} aria-hidden="true">{group ? <Users size={21} /> : initials(name)}</span>;
}

export default function Workspace() {
  const [data, setData] = useState<State | null>(null);
  const [loadError, setLoadError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<Modal>('');
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [thread, setThread] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [typing, setTyping] = useState<Record<string, string>>({});
  const [failedReply, setFailedReply] = useState<{ room: string; bot: Person; message: string } | null>(null);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [plan, setPlan] = useState('');
  const composer = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const modalTrigger = useRef<HTMLElement | null>(null);
  const pendingIds = useRef<Record<string, { text: string; id: string }>>({});
  const fetchSequence = useRef(0);
  const previousRoom = useRef('');
  const nearBottom = useRef(true);
  const runningTasks = useRef(new Set<string>());
  const dataRef = useRef<State | null>(null);

  const refresh = useCallback(async () => {
    const sequence = ++fetchSequence.current;
    try {
      const response = await fetch('/api/workspace', { cache: 'no-store' });
      const result = await response.json() as State & { error?: string };
      if (sequence !== fetchSequence.current) return;
      if (!response.ok) { setNeedsLogin(response.status === 401); throw Error(result.error || 'Không tải được tin nhắn.'); }
      setData(result); dataRef.current = result; setLoadError(''); setNeedsLogin(false);
      setRoomId(current => {
        if (current) return current;
        const activity = new Map(result.rooms.map(room => [room.id, room.created]));
        for (const message of result.messages) activity.set(message.room_id, Math.max(activity.get(message.room_id) || 0, message.created));
        return [...result.rooms].sort((a, b) => (activity.get(b.id) || 0) - (activity.get(a.id) || 0))[0]?.id || '';
      });
    } catch (error) { if (sequence === fetchSequence.current) setLoadError(error instanceof Error ? error.message : 'Mất kết nối.'); }
  }, []);
  useEffect(() => { const initial = setTimeout(() => void refresh(), 0); const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 4000); return () => { clearTimeout(initial); clearInterval(timer); }; }, [refresh]);
  const post = useCallback(async (action: string, values: Record<string, unknown> = {}, targetRoom = roomId) => {
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, room: targetRoom, ...values }) });
    const result = await response.json() as { id: string; error?: string };
    if (!response.ok) throw Error(result.error || 'Chưa lưu được thay đổi.');
    await refresh(); return result;
  }, [refresh, roomId]);
  async function act(action: string, values: Record<string, unknown> = {}, targetRoom = roomId) { try { return await post(action, values, targetRoom); } catch (error) { toast.error(error instanceof Error ? error.message : 'Vui lòng thử lại.', { duration: Infinity, closeButton: true }); } }

  const people = useMemo(() => [...(data?.members || []), ...(data?.bots || [])], [data?.members, data?.bots]);
  const roomPeople = (room: Room) => people.filter(person => data?.roomMembers.some(member => member.room_id === room.id && member.member_id === person.id) || (!room.restricted && data?.members.some(member => member.id === person.id)));
  const roomName = (room: Room) => room.kind === 'direct' ? roomPeople(room).find(person => person.id !== data?.user.id)?.name || room.name : ({ product: 'Nhóm sản phẩm', general: 'Nhóm chung', ideas: 'Ý tưởng' }[room.id] || room.name);
  const rooms = useMemo(() => {
    const latest = new Map<string, Message>();
    for (const message of data?.messages || []) latest.set(message.room_id, message);
    return (data?.rooms || []).map(room => ({ room, latest: latest.get(room.id) })).sort((a, b) => (b.latest?.created ?? b.room.created) - (a.latest?.created ?? a.room.created));
  }, [data?.rooms, data?.messages]);
  const activeRoom = data?.rooms.find(room => room.id === roomId) || rooms[0]?.room;
  const activeId = activeRoom?.id || '';
  const members = activeRoom ? roomPeople(activeRoom) : [];
  const chatBots = members.filter(person => person.role);
  const other = activeRoom?.kind === 'direct' ? members.find(person => person.id !== data?.user.id) : undefined;
  const messages = data?.messages.filter(message => message.room_id === activeId) || [];
  const tasks = data?.tasks.filter(task => task.room_id === activeId) || [];
  const draft = drafts[activeId] || '';
  const visibleRooms = rooms.filter(({ room, latest }) => normalize(`${roomName(room)} ${latest?.text || ''}`).includes(normalize(search)));
  const picker = people.filter(person => person.id !== data?.user.id && normalize(`${person.name} ${person.role || ''}`).includes(normalize(query)) && (modal !== 'add' || !members.some(member => member.id === person.id)));

  useEffect(() => {
    if (!scroll.current) return;
    if (previousRoom.current !== activeId || nearBottom.current) scroll.current.scrollTop = scroll.current.scrollHeight;
    previousRoom.current = activeId;
  }, [activeId, messages.length, typing]);
  useEffect(() => { if (composer.current) { composer.current.style.height = 'auto'; composer.current.style.height = `${Math.min(composer.current.scrollHeight, 160)}px`; } }, [draft, activeId]);
  useEffect(() => {
    for (const task of data?.tasks || []) if (task.status === 'running' && !runningTasks.current.has(task.id)) {
      runningTasks.current.add(task.id); void post('run', { id: task.id }, task.room_id).catch(error => toast.error(error.message)).finally(() => runningTasks.current.delete(task.id));
    }
  }, [data?.tasks, post]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: unknown) => Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: 'read_mora_room', title: 'Đọc cuộc trò chuyện Mora', description: 'Read an accessible conversation. Does not modify saved data.', inputSchema: { type: 'object', properties: { roomId: { type: 'string' } }, required: ['roomId'], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute: async (input: unknown) => {
      const id = (input as { roomId?: string }).roomId; const current = dataRef.current;
      if (!id || !current?.rooms.some(room => room.id === id)) throw Error('Unknown conversation');
      setRoomId(id); setMobileChat(true); return { room: current.rooms.find(room => room.id === id), messages: current.messages.filter(message => message.room_id === id).slice(-40) };
    } }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, []);
  function openModal(value: Modal) {
    if (!modal) modalTrigger.current = document.activeElement as HTMLElement;
    setModal(value); setFormError(''); setQuery(''); setSelected([]); setName(''); setRole('');
  }
  function selectRoom(id: string) { setRoomId(id); setMobileChat(true); setModal(''); nearBottom.current = true; if (window.innerWidth < 700) requestAnimationFrame(() => composer.current?.focus()); }
  const setDraft = (value: string) => setDrafts(current => ({ ...current, [activeId]: value }));
  async function botReply(bot: Person, message: string, targetRoom: string) {
    const key = `${targetRoom}:${bot.id}`; setTyping(current => ({ ...current, [key]: bot.name }));
    try { await post('bot-reply', { botId: bot.id, messageId: message }, targetRoom); setFailedReply(current => current?.message === message ? null : current); }
    catch (error) { setFailedReply({ bot, message, room: targetRoom }); toast.error(error instanceof Error ? error.message : 'Bot chưa phản hồi.', { duration: Infinity, closeButton: true }); }
    finally { setTyping(current => { const next = { ...current }; delete next[key]; return next; }); }
  }
  async function send(text = draft, parent?: string) {
    if (!text.trim() || busy || !activeId) return;
    const targetRoom = activeId, submitted = text.trim(), key = parent || targetRoom;
    setBusy(true);
    try {
      if (pendingIds.current[key]?.text !== submitted) pendingIds.current[key] = { text: submitted, id: crypto.randomUUID() };
      const id = pendingIds.current[key].id;
      await post('message', { text: submitted, id, ...(parent ? { parent } : {}) }, targetRoom);
      delete pendingIds.current[key];
      if (parent) setReply(''); else setDrafts(current => current[targetRoom]?.trim() === submitted ? { ...current, [targetRoom]: '' } : current);
      nearBottom.current = true;
      if (scroll.current && previousRoom.current === targetRoom) scroll.current.scrollTop = scroll.current.scrollHeight;
      const called = activeRoom?.kind === 'direct' ? chatBots : chatBots.filter(bot => new RegExp(`@${bot.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s.,!?;:])`, 'iu').test(submitted));
      for (const bot of called) void botReply(bot, id, targetRoom);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Chưa gửi được. Tin nhắn của bạn vẫn ở đây.', { duration: Infinity, closeButton: true }); }
    finally { setBusy(false); }
  }
  async function submitForm(event: React.FormEvent) {
    event.preventDefault(); if (saving) return; setSaving(true); setFormError('');
    try {
      if (modal === 'context' && editingContext) { await post('context', editingContext, activeId); setModal('work'); }
      else if (modal === 'plan' && editingTask) { await post('revise', { id: editingTask.id, plan }, activeId); setModal('work'); }
      else { const result = await post(modal === 'add' ? 'add-members' : modal, { name, role, members: selected }, activeId); selectRoom(result.id); }
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Vui lòng thử lại.'); }
    finally { setSaving(false); }
  }
  async function connect(person: Person) {
    if (saving) return; setSaving(true); setFormError('');
    try { selectRoom((await post('direct', { memberId: person.id }, activeId)).id); }
    catch (error) { setFormError(error instanceof Error ? error.message : 'Chưa mở được cuộc trò chuyện.'); }
    finally { setSaving(false); }
  }
  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error('Tệp tối đa 5 MB.'); return; }
    setBusy(true); const targetRoom = activeId;
    try { const form = new FormData(); form.append('file', file); form.append('room', targetRoom); const response = await fetch('/api/files', { method: 'POST', body: form }); const result = await response.json() as { error?: string }; if (!response.ok) throw Error(result.error); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Chưa tải được tệp.', { duration: Infinity, closeButton: true }); }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  function messageView(message: Message, inThread = false) {
    const own = message.author_id === data?.user.id;
    const replies = messages.filter(item => item.parent_id === message.id);
    const reactions = data?.reactions.filter(reaction => reaction.message_id === message.id) || [];
    if (message.kind === 'system') return <p className="system-message" key={message.id}>{message.author} {message.text}</p>;
    return <article className={`message ${own ? 'own' : ''}`} key={message.id}>
      {!own && <Avatar name={message.author} />}
      <div className="message-content">
        {!own && <div className="message-author">{message.author}{message.kind === 'agent' && <span className="ai-label">AI</span>}{message.kind === 'sample' && <span className="meta">Mẫu</span>}</div>}
        <div className="message-bubble"><p>{message.text}</p>{message.file_id && <a className="attachment" href={`/api/files?id=${message.file_id}`}><FileText size={20} /><span>{message.file_name}</span><Download size={16} /></a>}</div>
        <div className="message-meta"><time dateTime={new Date(message.created).toISOString()}>{time(message.created)}</time><div className="message-actions"><button aria-label={`Thích tin nhắn của ${message.author}`} aria-pressed={reactions.some(reaction => reaction.user_id === data?.user.id && reaction.emoji === 'thumb')} onClick={() => void act('react', { message: message.id, emoji: 'thumb' }, activeId)}><ThumbsUp size={14} />{reactions.filter(reaction => reaction.emoji === 'thumb').length || ''}</button>{!inThread && <button aria-label={`Trả lời tin nhắn của ${message.author}`} onClick={() => { setThread(message); setReply(''); openModal('thread'); }}><MessageCircle size={14} />{replies.length > 0 ? `${replies.length} trả lời` : ''}</button>}</div></div>
      </div>
    </article>;
  }
  const titles: Record<Exclude<Modal, ''>, string> = { new: 'Cuộc trò chuyện mới', connect: 'Tìm thành viên', bot: 'Tạo bot', group: 'Tạo nhóm', members: activeRoom ? roomName(activeRoom) : 'Thành viên', add: 'Thêm thành viên', thread: 'Trả lời', work: 'Bối cảnh và công việc', context: 'Chỉnh bối cảnh', plan: 'Chỉnh kế hoạch', mention: 'Nhắc đến bot' };

  return <>
    <Toaster position="bottom-center" />
    <a className="skip-link" href="#conversation" onClick={() => setMobileChat(true)}>Đến cuộc trò chuyện</a>
    <div className={`mora-app ${mobileChat ? 'show-chat' : ''}`}>
    <aside className="chat-list" aria-label="Cuộc trò chuyện">
      <header className="list-header"><button className="icon-button new-chat" aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" onClick={() => openModal('new')}><Plus size={22} /></button></header>
      <div className="search-field"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="chat-search">Tìm cuộc trò chuyện</label><input id="chat-search" type="search" placeholder="Tìm kiếm" value={search} onChange={event => setSearch(event.target.value)} /></div>
      {loadError && <div className="error-banner list-error" role="alert"><span>{loadError}</span>{needsLogin ? <button onClick={() => window.location.reload()}>Đăng nhập</button> : <button onClick={() => void refresh()}>Thử lại</button>}</div>}
      <nav className="conversation-list" aria-label="Tin nhắn gần đây">
        {!data && !loadError && <p className="list-empty" role="status">Đang tải tin nhắn…</p>}
        {visibleRooms.map(({ room, latest }) => <button className={`conversation-row ${activeId === room.id ? 'selected' : ''}`} key={room.id} onClick={() => selectRoom(room.id)} aria-current={activeId === room.id ? 'page' : undefined}>
          <Avatar name={roomName(room)} group={room.kind === 'group'} /><span className="conversation-copy"><span className="conversation-top"><strong>{roomName(room)}</strong><time>{recentTime(latest?.created || room.created)}</time></span><span className="conversation-preview">{latest ? `${latest.author_id === data?.user.id ? 'Bạn: ' : room.kind === 'group' ? latest.author.split(' ').slice(-2).join(' ') + ': ' : ''}${latest.file_name || latest.text}` : 'Chưa có tin nhắn'}</span></span>
        </button>)}
        {data && visibleRooms.length === 0 && <div className="list-empty"><p>{search ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện'}</p><button className="text-button" onClick={() => search ? setSearch('') : openModal('new')}>{search ? 'Xóa tìm kiếm' : 'Bắt đầu trò chuyện'}</button></div>}
      </nav>
    </aside>
    <main className="conversation" id="conversation" tabIndex={-1}>
      {activeRoom && <header className="chat-header"><button className="icon-button mobile-back" aria-label="Về danh sách trò chuyện" onClick={() => setMobileChat(false)}><ArrowLeft size={21} /></button><button className="chat-identity" onClick={() => openModal('members')}><Avatar name={roomName(activeRoom)} group={activeRoom.kind === 'group'} /><span className="chat-title"><h1>{roomName(activeRoom)}</h1>{other?.role && <span className="ai-label">AI</span>}</span></button><button className="icon-button" aria-label={activeRoom.kind === 'group' ? 'Thêm thành viên' : 'Thông tin cuộc trò chuyện'} title={activeRoom.kind === 'group' ? 'Thêm thành viên' : 'Thông tin cuộc trò chuyện'} onClick={() => openModal(activeRoom.kind === 'group' ? 'add' : 'members')}>{activeRoom.kind === 'group' ? <UserPlus size={20} /> : <MoreHorizontal size={22} />}</button></header>}
      {loadError && <div className="error-banner" role="alert"><span>{loadError}</span>{needsLogin ? <button onClick={() => window.location.reload()}>Đăng nhập</button> : <button onClick={() => void refresh()}>Thử lại</button>}</div>}
      {activeRoom ? <>
        <div className="chat-scroll" ref={scroll} onScroll={() => { const element = scroll.current; if (element) nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 160; }}>
          <div className="message-list" role="log" aria-label={`Tin nhắn trong ${roomName(activeRoom)}`} aria-live="polite" aria-relevant="additions">
            {messages.filter(message => !message.parent_id).map((message, index, array) => <div key={message.id}>{(index === 0 || new Date(array[index - 1].created).toDateString() !== new Date(message.created).toDateString()) && <div className="date-divider">{new Date(message.created).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}</div>}{messageView(message)}</div>)}
            {messages.length === 0 && <div className="conversation-empty"><p>Chưa có tin nhắn</p></div>}
          </div>
        </div>
        <div className="composer-area">
          <div className="typing-status" role="status">{Object.entries(typing).filter(([key]) => key.startsWith(activeId + ':')).map(([, botName]) => `${botName} đang trả lời…`).join(' ')}</div>
          {failedReply?.room === activeId && data?.aiConnected && <div className="retry-reply"><span>{failedReply.bot.name} chưa phản hồi.</span><button onClick={() => void botReply(failedReply.bot, failedReply.message, failedReply.room)}>Thử lại</button></div>}
          <form className="composer" onSubmit={event => { event.preventDefault(); void send(); }}>
            <input ref={fileInput} type="file" hidden onChange={event => { if (event.target.files?.[0]) void upload(event.target.files[0]); }} />
            <button className="icon-button" type="button" aria-label="Đính kèm tệp" title="Đính kèm tệp" disabled={busy} onClick={() => fileInput.current?.click()}><Paperclip size={21} /></button>
            <label className="sr-only" htmlFor="message">Tin nhắn</label><textarea id="message" ref={composer} rows={1} placeholder="Nhập tin nhắn" value={draft} maxLength={6000} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
            {activeRoom.kind === 'group' && chatBots.length > 0 && <button className="icon-button" type="button" aria-label="Nhắc đến bot" title="Nhắc đến bot" onClick={() => openModal('mention')}><AtSign size={19} /></button>}
            <button className="send-button" type="submit" aria-label={busy ? 'Đang gửi' : 'Gửi tin nhắn'} disabled={busy || !draft.trim()}><ArrowUp size={21} /></button>
          </form>
        </div>
      </> : <div className="no-conversation"><h1>{data ? 'Chọn một cuộc trò chuyện' : ''}</h1>{data && <button className="primary" onClick={() => openModal('new')}>Cuộc trò chuyện mới</button>}</div>}
    </main>
    </div>
    <Dialog open={!!modal} onOpenChange={open => { if (!open) setModal(''); }}>
      <DialogContent className={`mora-dialog ${modal === 'thread' || modal === 'work' ? 'wide-dialog' : ''}`} showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); if (mobileChat && window.innerWidth < 700) composer.current?.focus(); else modalTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle>{modal ? titles[modal] : ''}</DialogTitle><DialogDescription className="sr-only">{modal === 'bot' ? 'Đặt tên và vai trò cho đồng đội AI.' : 'Quản lý cuộc trò chuyện của bạn.'}</DialogDescription></DialogHeader>
        <DialogClose className="icon-button dialog-close" aria-label="Đóng"><X size={20} /></DialogClose>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        {modal === 'new' && <div className="new-options">{([{ type: 'connect', text: 'Tìm thành viên', icon: UserPlus }, { type: 'bot', text: 'Tạo bot', icon: Plus }, { type: 'group', text: 'Tạo nhóm', icon: Users }] as const).map(item => <button key={item.type} onClick={() => openModal(item.type)}><span className="option-icon"><item.icon size={21} /></span>{item.text}<ChevronRight size={18} /></button>)}</div>}
        {(modal === 'bot' || modal === 'group' || modal === 'add' || modal === 'context' || modal === 'plan') && <form className="modal-form" onSubmit={submitForm}>
          {(modal === 'bot' || modal === 'group') && <label htmlFor="new-name">{modal === 'bot' ? 'Tên bot' : 'Tên nhóm'}<input id="new-name" name="name" autoComplete="off" value={name} onChange={event => setName(event.target.value)} placeholder={modal === 'bot' ? 'Ví dụ: An' : 'Ví dụ: Nhóm bán hàng'} required maxLength={modal === 'bot' ? 50 : 60} /></label>}
          {modal === 'bot' && <label htmlFor="bot-role">Vai trò<textarea id="bot-role" name="role" value={role} onChange={event => setRole(event.target.value)} placeholder="Ví dụ: Hỗ trợ bán hàng, tư vấn sản phẩm và soạn tin nhắn cho khách." required maxLength={2000} rows={4} /></label>}
          {(modal === 'group' || modal === 'add') && <><label htmlFor="member-search">Thành viên<input id="member-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm người hoặc bot" /></label><div className="member-picker">{picker.map(person => <label className="member-option" key={person.id}><Avatar name={person.name} /><span><strong>{person.name}</strong>{person.role && <small>AI · {person.role}</small>}</span><input type="checkbox" checked={selected.includes(person.id)} onChange={event => setSelected(current => event.target.checked ? [...current, person.id] : current.filter(id => id !== person.id))} /></label>)}{!picker.length && <p className="muted">Không tìm thấy thành viên.</p>}</div></>}
          {modal === 'context' && editingContext && <><label>Mục tiêu<textarea rows={2} required value={editingContext.goal} onChange={event => setEditingContext({ ...editingContext, goal: event.target.value })} /></label><label>Kho mã tham chiếu<input value={editingContext.repo} placeholder="owner/repository" onChange={event => setEditingContext({ ...editingContext, repo: event.target.value })} /></label><label>Quyết định<textarea rows={4} value={editingContext.decisions} onChange={event => setEditingContext({ ...editingContext, decisions: event.target.value })} /></label></>}
          {modal === 'plan' && <label>Các bước thực hiện<textarea rows={6} value={plan} onChange={event => setPlan(event.target.value)} required /></label>}
          <button className="primary form-submit" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : modal === 'bot' ? 'Tạo bot' : modal === 'group' ? 'Tạo nhóm' : modal === 'add' ? 'Thêm thành viên' : 'Lưu'}</button>
        </form>}
        {modal === 'connect' && <><div className="search-field dialog-search"><Search size={18} /><label className="sr-only" htmlFor="connect-search">Tìm người hoặc bot</label><input id="connect-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm người hoặc bot" /></div><div className="member-picker">{picker.map(person => <button className="member-option" key={person.id} disabled={saving} onClick={() => void connect(person)}><Avatar name={person.name} /><span><strong>{person.name}</strong>{person.role && <small>AI · {person.role}</small>}</span><ChevronRight size={18} /></button>)}{!picker.length && <p className="muted">Không tìm thấy thành viên.</p>}</div><p className="member-help">Thành viên xuất hiện ở đây sau khi được cấp quyền truy cập Mora và đăng nhập.</p><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); toast.success('Đã sao chép liên kết. Liên kết không tự cấp quyền truy cập.'); } catch { toast.error('Bạn có thể sao chép URL trên thanh địa chỉ.'); } }}>Sao chép liên kết Mora</button></>}
        {modal === 'members' && <>{other?.role ? <div className="bot-profile"><Avatar name={other.name} /><span className="ai-label">AI</span><p>{other.role}</p>{!data?.aiConnected && <p className="muted">Bot chưa kết nối dịch vụ AI.</p>}</div> : <div className="member-picker">{members.map(person => <div className="member-option" key={person.id}><Avatar name={person.name} /><span><strong>{person.name}{person.id === data?.user.id ? ' (Bạn)' : ''}</strong>{person.role && <small>AI · {person.role}</small>}</span></div>)}</div>}{activeRoom?.kind === 'group' && <button className="outlined" onClick={() => openModal('add')}><UserPlus size={18} />Thêm thành viên</button>}<button className="text-button details-link" onClick={() => openModal('work')}>Bối cảnh và công việc<ChevronRight size={16} /></button></>}
        {modal === 'mention' && <div className="member-picker">{chatBots.map(bot => <button className="member-option" key={bot.id} onClick={() => { setDraft(`${draft}${draft && !draft.endsWith(' ') ? ' ' : ''}@${bot.name} `); setModal(''); setTimeout(() => composer.current?.focus(), 0); }}><Avatar name={bot.name} /><span><strong>{bot.name}</strong><small>AI · {bot.role}</small></span></button>)}</div>}
        {modal === 'thread' && thread && <><div className="thread-messages">{messageView(thread, true)}{messages.filter(message => message.parent_id === thread.id).map(message => messageView(message, true))}</div><form className="reply-form" onSubmit={event => { event.preventDefault(); void send(reply, thread.id); }}><label className="sr-only" htmlFor="thread-reply">Tin nhắn trả lời</label><textarea id="thread-reply" rows={2} placeholder="Trả lời" value={reply} onChange={event => setReply(event.target.value)} maxLength={6000} /><button className="send-button" disabled={busy || !reply.trim()} aria-label="Gửi trả lời"><ArrowUp size={20} /></button></form></>}
        {modal === 'work' && <div className="saved-work"><div className="work-context"><h2>Bối cảnh chung</h2><p>{data?.contexts.find(context => context.room_id === activeId)?.goal || 'Chưa có bối cảnh.'}</p><button className="text-button" onClick={() => { setEditingContext(data?.contexts.find(context => context.room_id === activeId) || null); setModal('context'); }}>Chỉnh bối cảnh</button></div><button className="outlined" onClick={() => { const text = window.prompt('Bạn muốn lên kế hoạch cho việc gì?'); if (text?.trim()) void act('propose', { text }, activeId); }}>Tạo kế hoạch</button>{tasks.map(task => <section className="saved-task" key={task.id}><p className="meta">{statusText[task.status]}{task.mode === 'demo' ? ' · Mẫu' : ''}</p><h2>{task.title}</h2><ol>{(JSON.parse(task.plan) as string[]).map((step, index) => <li key={index}>{step}</li>)}</ol>{task.error && <p role="alert">{task.error}</p>}{task.output && <pre>{task.output}</pre>}<div className="task-actions">{task.status === 'pending' && <button className="primary" onClick={() => void act('approve', { id: task.id, expectedUpdated: task.updated, expectedPlan: task.plan }, activeId)}><Check size={16} />Duyệt</button>}{['pending', 'running', 'generating'].includes(task.status) && <button className="outlined" onClick={() => void act('stop', { id: task.id }, activeId)}>Dừng</button>}{!['running', 'generating'].includes(task.status) && <button className="outlined" onClick={() => { setEditingTask(task); setPlan((JSON.parse(task.plan) as string[]).join('\n')); setModal('plan'); }}>Chỉnh kế hoạch</button>}{task.status === 'done' && <button className="outlined" onClick={() => void act('continue', { id: task.id }, activeId)}>Tiếp nhận</button>}</div></section>)}</div>}
      </DialogContent>
    </Dialog>
  </>;
}
