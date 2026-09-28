'use client';
import { uploadFile } from '@/lib/upload-file';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArtFrame, Mark } from './brand';
import { ART, coverFor, credit } from '@/lib/art';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, AtSign, Check, ChevronRight, CircleAlert, CircleCheck, CirclePause, Clock, Download, FileText, LoaderCircle, LogOut, MessageCircle, PanelLeft, PanelRight, Paperclip, Pencil, Plus, Search, Square, ThumbsUp, UserPlus, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Room = { id: string; name: string; description: string; created: number; kind: 'direct' | 'group'; restricted: number };
type Person = { id: string; name: string; role?: string };
type Message = { id: string; room_id: string; author_id: string; author: string; text: string; kind: string; created: number; parent_id?: string; file_id?: string; file_name?: string };
type Context = { room_id: string; goal: string; repo: string; decisions: string; revision: number; editor?: string; updated?: number };
type Task = { id: string; room_id: string; title: string; plan: string; status: string; output?: string; error?: string; created: number; updated: number; mode: string; requester?: string; approved_by?: string };
type State = { user: Person; rooms: Room[]; messages: Message[]; members: Person[]; bots: Person[]; roomMembers: { room_id: string; member_id: string }[]; reactions: { message_id: string; user_id: string; emoji: string }[]; contexts: Context[]; tasks: Task[]; aiConnected: boolean };
type Modal = '' | 'new' | 'connect' | 'bot' | 'group' | 'add' | 'thread' | 'context' | 'plan' | 'mention';
type BotState = 'working' | 'waiting' | undefined;
type Entry = { type: 'message'; at: number; message: Message } | { type: 'task'; at: number; task: Task };
const time = (value: number) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const initials = (name: string) => name.replace(/@.*/, '').split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase();
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const recentTime = (value: number) => new Date(value).toDateString() === new Date().toDateString() ? time(value) : new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
const dayLabel = (value: number) => {
  const date = new Date(value), today = new Date(), yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const day = date.toDateString() === today.toDateString() ? 'Hôm nay' : date.toDateString() === yesterday.toDateString() ? 'Hôm qua' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
  return `${day} ${time(value)}`;
};
const parsePlan = (plan: string) => { try { const steps = JSON.parse(plan); return Array.isArray(steps) ? steps.map(String) : []; } catch { return []; } };
const statusText: Record<string, string> = { pending: 'Chờ duyệt', running: 'Đã duyệt', generating: 'Đang làm', stopped: 'Đã dừng', done: 'Hoàn thành', failed: 'Cần thử lại' };
const statusIcon: Record<string, typeof Clock> = { pending: Clock, running: LoaderCircle, generating: LoaderCircle, stopped: CirclePause, done: CircleCheck, failed: CircleAlert };
const store = { get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } }, set: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } } };

// Bot characters: one simple shape, two capsule eyes, in oil-paint pigments. Mora itself is the ink arch.
const BOT_COLORS = ['#C4553A', '#D09A3B', '#6E8A4B', '#3E8C80', '#4A67A6', '#C7727C', '#9C5F33', '#8FA3AD'];
const SHAPES = {
  arch: { d: 'M6 33V20a14 14 0 0 1 28 0v13a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z', eyeY: 19, gap: 5 },
  squircle: { d: 'M16 4h8c8 0 12 4 12 12v8c0 8-4 12-12 12h-8C8 36 4 32 4 24v-8C4 8 8 4 16 4Z', eyeY: 17, gap: 5 },
  circle: { d: 'M20 5a15 15 0 1 1 0 30 15 15 0 0 1 0-30Z', eyeY: 17, gap: 5 },
  pill: { d: 'M13 10h14a10 10 0 0 1 0 20H13a10 10 0 0 1 0-20Z', eyeY: 18, gap: 5 },
  tri: { d: 'M16.5 7.5c1.6-2.8 5.4-2.8 7 0l11 19.5c1.6 2.8-.4 6-3.5 6H9c-3.1 0-5.1-3.2-3.5-6Z', eyeY: 23, gap: 4.5 },
  tall: { d: 'M20 3a10 10 0 0 1 10 10v14a10 10 0 0 1-20 0V13A10 10 0 0 1 20 3Z', eyeY: 15, gap: 4 },
};
const BOT_SHAPES = ['squircle', 'circle', 'pill', 'tri', 'tall'] as const;
const seedOf = (value: string) => Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

function BotFace({ id, size = 36, state }: { id: string; size?: number; state?: BotState }) {
  const mora = id === 'mora', seed = seedOf(id);
  const shape = mora ? SHAPES.arch : SHAPES[BOT_SHAPES[seed % BOT_SHAPES.length]];
  const color = mora ? 'currentColor' : BOT_COLORS[(seed >>> 4) % BOT_COLORS.length];
  return <svg className={`bot-face${mora ? ' is-mora' : ''}${state ? ` is-${state}` : ''}`} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <path d={shape.d} fill={color} />
    <g className="eyes" style={{ fill: mora ? 'var(--background)' : 'var(--bot-eye)' }}>
      <rect x={20 - shape.gap - 1.7} y={shape.eyeY - 3.5} width="3.4" height="7" rx="1.7" />
      <rect x={20 + shape.gap - 1.7} y={shape.eyeY - 3.5} width="3.4" height="7" rx="1.7" />
    </g>
  </svg>;
}
function PersonAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * .36) }} aria-hidden="true">{initials(name)}</span>;
}
function GroupAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return <span className="avatar group" style={{ width: size, height: size, fontSize: Math.round(size * .34) }} aria-hidden="true">{initials(name) || <Users size={Math.round(size * .48)} />}</span>;
}
function Face({ person, name, size, state }: { person?: Person; name: string; size?: number; state?: BotState }) {
  return person?.role ? <BotFace id={person.id} size={size} state={state} /> : <PersonAvatar name={name} size={size} />;
}

export default function Workspace() {
  const router = useRouter();
  const [data, setData] = useState<State | null>(null);
  const [loadError, setLoadError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const [rail, setRail] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
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
  const [proposal, setProposal] = useState('');
  const [typing, setTyping] = useState<Record<string, string>>({});
  const [failedReply, setFailedReply] = useState<{ room: string; bot: Person; message: string } | null>(null);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [plan, setPlan] = useState('');
  const composer = useRef<HTMLTextAreaElement>(null);
  const proposalInput = useRef<HTMLTextAreaElement>(null);
  const panelToggle = useRef<HTMLButtonElement>(null);
  const afterMenu = useRef<(() => void) | null>(null);
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
  // Layout preferences are per browser and only read after hydration.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRail(store.get('mora-rail') === '1');
      const panel = store.get('mora-panel');
      // Only pin the panel where it sits beside the chat; on smaller screens it covers the conversation.
      setPanelOpen(window.innerWidth >= 1100 && (panel ? panel === '1' : window.innerWidth >= 1280));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const post = useCallback(async (action: string, values: Record<string, unknown> = {}, targetRoom = roomId) => {
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, room: targetRoom, ...values }) });
    const result = await response.json() as { id: string; error?: string };
    if (!response.ok) throw Error(result.error || 'Chưa lưu được thay đổi.');
    await refresh(); return result;
  }, [refresh, roomId]);
  async function act(action: string, values: Record<string, unknown> = {}, targetRoom = roomId) { try { return await post(action, values, targetRoom); } catch (error) { toast.error(error instanceof Error ? error.message : 'Vui lòng thử lại.', { duration: Infinity, closeButton: true }); } }

  const people = useMemo(() => [...(data?.members || []), ...(data?.bots || [])], [data?.members, data?.bots]);
  const personById = (id: string) => people.find(person => person.id === id);
  const roomPeople = (room: Room) => people.filter(person => data?.roomMembers.some(member => member.room_id === room.id && member.member_id === person.id) || (!room.restricted && data?.members.some(member => member.id === person.id)));
  const roomName = (room: Room) => room.kind === 'direct' ? roomPeople(room).find(person => person.id !== data?.user.id)?.name || room.name : ({ product: 'Nhóm sản phẩm', general: 'Nhóm chung', ideas: 'Ý tưởng' }[room.id] || room.name);
  const counterpart = (room: Room) => room.kind === 'direct' ? roomPeople(room).find(person => person.id !== data?.user.id) : undefined;
  const botState = (room: Room, bot?: Person): BotState => {
    if (Object.keys(typing).some(key => bot ? key === `${room.id}:${bot.id}` : key.startsWith(`${room.id}:`))) return 'working';
    const roomTasks = data?.tasks.filter(task => task.room_id === room.id) || [];
    if (roomTasks.some(task => task.status === 'running' || task.status === 'generating')) return 'working';
    if (roomTasks.some(task => task.status === 'pending')) return 'waiting';
  };
  const roomFace = (room: Room, size: number) => {
    const other = counterpart(room);
    if (room.kind === 'group') return <GroupAvatar name={roomName(room)} size={size} />;
    return <Face person={other} name={roomName(room)} size={size} state={other?.role ? botState(room, other) : undefined} />;
  };
  const rooms = useMemo(() => {
    const latest = new Map<string, Message>();
    for (const message of data?.messages || []) latest.set(message.room_id, message);
    return (data?.rooms || []).map(room => ({ room, latest: latest.get(room.id) })).sort((a, b) => (b.latest?.created ?? b.room.created) - (a.latest?.created ?? a.room.created));
  }, [data?.rooms, data?.messages]);
  const activeRoom = data?.rooms.find(room => room.id === roomId) || rooms[0]?.room;
  const activeId = activeRoom?.id || '';
  const members = activeRoom ? roomPeople(activeRoom) : [];
  const chatBots = members.filter(person => person.role);
  const other = activeRoom ? counterpart(activeRoom) : undefined;
  const messages = data?.messages.filter(message => message.room_id === activeId) || [];
  const tasks = data?.tasks.filter(task => task.room_id === activeId) || [];
  const context = data?.contexts.find(item => item.room_id === activeId);
  const cover = coverFor(activeId);
  const activeState = activeRoom ? botState(activeRoom) : undefined;
  const typingHere = Object.entries(typing).filter(([key]) => key.startsWith(activeId + ':'));
  const draft = drafts[activeId] || '';
  const visibleRooms = rooms.filter(({ room, latest }) => normalize(`${roomName(room)} ${latest?.text || ''}`).includes(normalize(search)));
  const picker = people.filter(person => person.id !== data?.user.id && normalize(`${person.name} ${person.role || ''}`).includes(normalize(query)) && (modal !== 'add' || !members.some(member => member.id === person.id)));
  const timeline: Entry[] = [
    ...messages.filter(message => !message.parent_id).map(message => ({ type: 'message' as const, at: message.created, message })),
    ...tasks.map(task => ({ type: 'task' as const, at: task.created || task.updated, task })),
  ].sort((a, b) => a.at - b.at);

  useEffect(() => {
    if (!scroll.current) return;
    if (previousRoom.current !== activeId || nearBottom.current) scroll.current.scrollTop = scroll.current.scrollHeight;
    previousRoom.current = activeId;
  }, [activeId, messages.length, tasks.length, typing]);
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
  function toggleRail() { setRail(current => { store.set('mora-rail', current ? '0' : '1'); return !current; }); }
  function showPanel(open: boolean) { setPanelOpen(open); store.set('mora-panel', open ? '1' : '0'); if (!open) requestAnimationFrame(() => panelToggle.current?.focus()); }
  function selectRoom(id: string) { setRoomId(id); setMobileChat(true); setModal(''); nearBottom.current = true; if (window.innerWidth < 700) { setPanelOpen(false); requestAnimationFrame(() => composer.current?.focus()); } }
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
      if (modal === 'context' && editingContext) { await post('context', editingContext, activeId); setModal(''); }
      else if (modal === 'plan' && editingTask) { await post('revise', { id: editingTask.id, plan }, activeId); setModal(''); }
      else { const result = await post(modal === 'add' ? 'add-members' : modal, { name, role, members: selected }, activeId); selectRoom(result.id); }
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Vui lòng thử lại.'); }
    finally { setSaving(false); }
  }
  async function propose(event: React.FormEvent) {
    event.preventDefault(); if (!proposal.trim() || saving) return; setSaving(true);
    try { if (await act('propose', { text: proposal.trim() }, activeId)) setProposal(''); } finally { setSaving(false); }
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
    try { await uploadFile(file, targetRoom); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Chưa tải được tệp.', { duration: Infinity, closeButton: true }); }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  function editPlan(task: Task) { modalTrigger.current = document.activeElement as HTMLElement; setEditingTask(task); setPlan(parsePlan(task.plan).join('\n')); setFormError(''); setModal('plan'); }
  function editContext() { modalTrigger.current = document.activeElement as HTMLElement; setEditingContext(context || null); setFormError(''); setModal('context'); }
  // Runs once the + menu has closed, so its focus return does not fight the next target.
  function afterMenuClose(event: Event) { const next = afterMenu.current; if (!next) return; event.preventDefault(); afterMenu.current = null; next(); }

  function taskActions(task: Task) {
    return <div className="task-actions">
      {task.status === 'pending' && <button className="primary" onClick={() => void act('approve', { id: task.id, expectedUpdated: task.updated, expectedPlan: task.plan }, activeId)}><Check size={16} />Duyệt</button>}
      {['pending', 'running', 'generating'].includes(task.status) && <button className="outlined" onClick={() => void act('stop', { id: task.id }, activeId)}><Square size={13} />Dừng</button>}
      {!['running', 'generating'].includes(task.status) && <button className="outlined" onClick={() => editPlan(task)}><Pencil size={14} />Chỉnh kế hoạch</button>}
      {task.status === 'done' && <button className="outlined" onClick={() => void act('continue', { id: task.id }, activeId)}>Tiếp nhận</button>}
    </div>;
  }
  function taskStatus(task: Task) {
    const Icon = statusIcon[task.status] || Clock;
    return <span className={`task-status status-${task.status}`}><Icon size={15} className={task.status === 'running' || task.status === 'generating' ? 'spin' : undefined} />{statusText[task.status] || task.status}{task.mode === 'demo' ? ' · Mẫu' : ''}</span>;
  }
  function taskCard(task: Task) {
    const steps = parsePlan(task.plan);
    return <section className="task-card" key={`task-${task.id}`} aria-label={`Kế hoạch: ${task.title}`}>
      <header><span className="task-kicker">Kế hoạch</span>{taskStatus(task)}</header>
      <h2>{task.title}</h2>
      {steps.length > 0 && <ol className="task-steps">{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}
      {task.error && <p className="form-error" role="alert">{task.error}</p>}
      {task.output && <pre className="task-output">{task.output}</pre>}
      {taskActions(task)}
    </section>;
  }
  function messageView(message: Message, previous?: Entry, inThread = false) {
    const own = message.author_id === data?.user.id;
    const replies = messages.filter(item => item.parent_id === message.id);
    const reactions = data?.reactions.filter(reaction => reaction.message_id === message.id) || [];
    const likes = reactions.filter(reaction => reaction.emoji === 'thumb').length;
    if (message.kind === 'system') return <p className="system-message" key={message.id}><span>{message.author}</span> {message.text}</p>;
    const runStart = inThread || !previous || previous.type !== 'message' || previous.message.author_id !== message.author_id || previous.message.kind === 'system' || message.created - previous.message.created > 5 * 60000;
    const showAuthor = !own && runStart && (inThread || activeRoom?.kind === 'group' || message.kind === 'sample');
    const author = personById(message.author_id);
    return <article className={`message${own ? ' own' : ''}${runStart ? ' run-start' : ''}${likes || replies.length ? ' has-activity' : ''}`} key={message.id}>
      {showAuthor && <div className="message-author"><Face person={author} name={message.author} size={20} />{message.author}{message.kind === 'agent' && <span className="ai-label">AI</span>}{message.kind === 'sample' && <span className="meta">Mẫu</span>}</div>}
      <div className="message-bubble" tabIndex={0}><p>{message.text}</p>{message.file_id && <a className="attachment" href={`/api/files?id=${message.file_id}`}><FileText size={20} /><span>{message.file_name}</span><Download size={16} /></a>}</div>
      <div className="message-meta"><time dateTime={new Date(message.created).toISOString()}>{time(message.created)}</time><button aria-label={`Thích tin nhắn của ${message.author}`} aria-pressed={reactions.some(reaction => reaction.user_id === data?.user.id && reaction.emoji === 'thumb')} onClick={() => void act('react', { message: message.id, emoji: 'thumb' }, activeId)}><ThumbsUp size={14} />{likes || ''}</button>{!inThread && <button aria-label={`Trả lời tin nhắn của ${message.author}`} onClick={() => { setThread(message); setReply(''); openModal('thread'); }}><MessageCircle size={14} />{replies.length > 0 ? `${replies.length} trả lời` : ''}</button>}</div>
    </article>;
  }
  const titles: Record<Exclude<Modal, ''>, string> = { new: 'Cuộc trò chuyện mới', connect: 'Tìm thành viên', bot: 'Tạo bot', group: 'Tạo nhóm', add: 'Thêm thành viên', thread: 'Trả lời', context: 'Chỉnh bối cảnh', plan: 'Chỉnh kế hoạch', mention: 'Nhắc đến bot' };
  const signedOut = needsLogin && !data;
  const errorBanner = loadError && !signedOut && <div className="error-banner" role="alert"><span>{loadError}</span>{needsLogin ? <button onClick={() => router.push('/signin')}>Đăng nhập</button> : <button onClick={() => void refresh()}>Thử lại</button>}</div>;

  return <>
    <Toaster position="bottom-center" />
    <a className="skip-link" href="#conversation" onClick={() => setMobileChat(true)}>Đến cuộc trò chuyện</a>
    <div className={`mora-app${mobileChat ? ' show-chat' : ''}${rail ? ' rail' : ''}${panelOpen && activeRoom ? ' show-panel' : ''}${signedOut ? ' signed-out' : ''}`}>
    <aside className="chat-list" aria-label="Cuộc trò chuyện">
      <header className="list-header">
        <span className="brand-mark" title="Mora"><Mark size={30} label="Mora" /></span>
        <button className="icon-button rail-toggle" aria-label={rail ? 'Mở rộng danh sách' : 'Thu gọn danh sách'} title={rail ? 'Mở rộng danh sách' : 'Thu gọn danh sách'} aria-pressed={rail} onClick={toggleRail}><PanelLeft size={19} /></button>
        <button className="icon-button new-chat" aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" onClick={() => openModal('new')}><Plus size={20} /></button>
      </header>
      <div className="search-field"><Search size={16} aria-hidden="true" /><label className="sr-only" htmlFor="chat-search">Tìm cuộc trò chuyện</label><input id="chat-search" type="search" placeholder="Tìm kiếm" value={search} onChange={event => setSearch(event.target.value)} /></div>
      {loadError && <div className="list-error">{errorBanner}</div>}
      <nav className="conversation-list" aria-label="Tin nhắn gần đây">
        {!data && !loadError && <p className="list-empty" role="status">Đang tải tin nhắn…</p>}
        {visibleRooms.map(({ room, latest }) => <button className={`conversation-row${activeId === room.id ? ' selected' : ''}`} key={room.id} onClick={() => selectRoom(room.id)} aria-current={activeId === room.id ? 'page' : undefined} title={rail ? roomName(room) : undefined}>
          {roomFace(room, 36)}<span className="conversation-copy"><span className="conversation-top"><strong>{roomName(room)}</strong><time>{recentTime(latest?.created || room.created)}</time></span><span className="conversation-preview">{latest ? `${latest.author_id === data?.user.id ? 'Bạn: ' : room.kind === 'group' && latest.kind !== 'system' ? latest.author.split(' ').slice(-2).join(' ') + ': ' : ''}${latest.file_name || latest.text}` : 'Chưa có tin nhắn'}</span></span>
        </button>)}
        {data && visibleRooms.length === 0 && <div className="list-empty"><p>{search ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện'}</p><button className="text-button" onClick={() => search ? setSearch('') : openModal('new')}>{search ? 'Xóa tìm kiếm' : 'Bắt đầu trò chuyện'}</button></div>}
      </nav>
      {data && <footer className="list-footer" title={rail ? data.user.name : undefined}><PersonAvatar name={data.user.name} size={28} /><span className="footer-name">{data.user.name}</span><form action="/signout" method="post"><button className="icon-button" aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={17} /></button></form></footer>}
    </aside>
    <main className="conversation" id="conversation" tabIndex={-1}>
      {activeRoom && <header className="chat-header">
        <button className="icon-button mobile-back" aria-label="Về danh sách trò chuyện" onClick={() => setMobileChat(false)}><ArrowLeft size={20} /></button>
        <button className="chat-identity" onClick={() => showPanel(true)} aria-label={`${roomName(activeRoom)}, xem chi tiết`}>{roomFace(activeRoom, 24)}<h1>{roomName(activeRoom)}</h1>{other?.role && <span className="ai-label">AI</span>}</button>
        {activeRoom.kind === 'group' && <button className="icon-button" aria-label="Thêm thành viên" title="Thêm thành viên" onClick={() => openModal('add')}><UserPlus size={19} /></button>}
        <button ref={panelToggle} className={`icon-button panel-toggle${activeState === 'working' ? ' is-active' : ''}`} aria-label={activeState === 'working' ? 'Chi tiết, bot đang làm việc' : 'Chi tiết'} title="Chi tiết" aria-pressed={panelOpen} aria-controls="details" onClick={() => showPanel(!panelOpen)}><PanelRight size={19} /></button>
      </header>}
      {loadError && <div className="chat-error">{errorBanner}</div>}
      {activeRoom ? <>
        <div className="chat-scroll" ref={scroll} onScroll={() => { const element = scroll.current; if (element) nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 160; }}>
          <div className="message-list" role="log" aria-label={`Tin nhắn trong ${roomName(activeRoom)}`} aria-live="polite" aria-relevant="additions">
            {timeline.length === 0 && <div className="conversation-empty"><ArtFrame art={cover} sizes="352px" />{roomFace(activeRoom, 40)}<h2>{roomName(activeRoom)}</h2><p>{other?.role || 'Chưa có tin nhắn. Gửi lời chào đầu tiên.'}</p></div>}
            {timeline.map((entry, index) => {
              const previous = timeline[index - 1];
              const divider = !previous || new Date(previous.at).toDateString() !== new Date(entry.at).toDateString() || entry.at - previous.at > 60 * 60000;
              return <div key={entry.type === 'message' ? entry.message.id : `task-${entry.task.id}`}>{divider && <div className="date-divider"><span>{dayLabel(entry.at)}</span></div>}{entry.type === 'message' ? messageView(entry.message, divider ? undefined : previous) : taskCard(entry.task)}</div>;
            })}
            {typingHere.map(([key]) => <div className="message run-start typing-row" key={key} aria-hidden="true"><div className="message-bubble typing-bubble"><i /><i /><i /></div></div>)}
          </div>
        </div>
        <div className="composer-area">
          <p className="sr-only" role="status">{typingHere.map(([, botName]) => `${botName} đang trả lời…`).join(' ')}</p>
          {failedReply?.room === activeId && data?.aiConnected && <div className="retry-reply"><span>{failedReply.bot.name} chưa phản hồi.</span><button onClick={() => void botReply(failedReply.bot, failedReply.message, failedReply.room)}>Thử lại</button></div>}
          <form className="composer" onSubmit={event => { event.preventDefault(); void send(); }}>
            <input ref={fileInput} type="file" hidden onChange={event => { if (event.target.files?.[0]) void upload(event.target.files[0]); }} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="composer-plus" type="button" aria-label="Thêm" title="Thêm" disabled={busy}><Plus size={20} /></button></DropdownMenuTrigger>
              <DropdownMenuContent className="mora-menu" side="top" align="start" sideOffset={10} onCloseAutoFocus={afterMenuClose}>
                <DropdownMenuItem onSelect={() => fileInput.current?.click()}><Paperclip size={16} />Tải tệp lên</DropdownMenuItem>
                {activeRoom.kind === 'group' && chatBots.length > 0 && <DropdownMenuItem onSelect={() => { afterMenu.current = () => { composer.current?.focus(); openModal('mention'); }; }}><AtSign size={16} />Nhắc đến bot</DropdownMenuItem>}
                {context && <DropdownMenuItem onSelect={() => { showPanel(true); afterMenu.current = () => proposalInput.current?.focus(); }}><Check size={16} />Tạo kế hoạch</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
            <label className="sr-only" htmlFor="message">Tin nhắn</label><textarea id="message" ref={composer} rows={1} placeholder={`Nhắn ${roomName(activeRoom)}`} value={draft} maxLength={6000} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
            <button className="send-button" type="submit" aria-label={busy ? 'Đang gửi' : 'Gửi tin nhắn'} disabled={busy || !draft.trim()}><ArrowUp size={19} /></button>
          </form>
        </div>
      </> : signedOut ? <div className="welcome">
        <ArtFrame art={ART.herringNet} className="scrim" sizes="(max-width: 700px) 100vw, 92vw" eager>
          <div><h1>Làm tiếp,<br />không cần kể lại.</h1><p>Chat làm việc cùng đồng đội và bot AI. Bối cảnh ở lại trong phòng; bot chỉ làm sau khi bạn duyệt.</p></div>
          <div className="welcome-foot"><div><Mark size={44} weight={2.2} /><p className="art-credit">{credit(ART.herringNet)}</p></div><Link className="on-art" href="/signin">Đăng nhập</Link></div>
        </ArtFrame>
      </div> : <div className="no-conversation">{data && <><ArtFrame art={ART.moonlight} sizes="(max-width: 700px) 100vw, 544px" /><h1>Chọn một cuộc trò chuyện</h1><button className="primary" onClick={() => openModal('new')}>Cuộc trò chuyện mới</button></>}</div>}
    </main>
    {panelOpen && activeRoom && <aside className="side-panel" id="details" aria-label="Chi tiết" onKeyDown={event => { if (event.key === 'Escape') showPanel(false); }}>
      <header className="panel-header"><h2>Chi tiết</h2><button className="icon-button" aria-label="Đóng chi tiết" title="Đóng" onClick={() => showPanel(false)}><X size={19} /></button></header>
      <div className="panel-body">
        <figure className="panel-cover">
          <ArtFrame art={cover} sizes="320px">
            <div className="art-pills" aria-hidden="true">
              {activeRoom.kind === 'group' ? <span className="art-pill">Thành viên<b>{members.length}</b></span> : <span className="art-pill">{other?.role ? 'Đồng đội AI' : 'Trò chuyện riêng'}</span>}
              {context && <span className="art-pill">Kế hoạch<b>{tasks.length}</b></span>}
            </div>
          </ArtFrame>
          <figcaption className="art-credit"><a href={cover.url} target="_blank" rel="noreferrer">{credit(cover)}</a></figcaption>
        </figure>
        <section className="panel-identity">
          {roomFace(activeRoom, 56)}
          <h3>{roomName(activeRoom)}</h3>
          <p className="muted">{other?.role ? 'Đồng đội AI' : activeRoom.kind === 'group' ? `${members.length} thành viên` : 'Trò chuyện riêng'}</p>
          {other?.role && <p className="panel-role">{other.role}</p>}
          {other?.role && !data?.aiConnected && <p className="muted">Bot chưa kết nối dịch vụ AI.</p>}
        </section>
        {context && <section className="panel-section">
          <h3>Công việc</h3>
          {tasks.length === 0 && <p className="muted">Chưa có kế hoạch nào.</p>}
          <ul className="panel-list">{tasks.map(task => <li key={task.id}><span className="panel-item-title">{task.title}</span>{taskStatus(task)}{taskActions(task)}</li>)}</ul>
          <form className="propose" onSubmit={propose}><label className="sr-only" htmlFor="proposal">Việc cần lên kế hoạch</label><textarea id="proposal" ref={proposalInput} rows={2} value={proposal} maxLength={3000} placeholder="Giao việc, ví dụ: soạn checklist ra mắt bản mobile" onChange={event => setProposal(event.target.value)} /><button className="primary" type="submit" disabled={saving || !proposal.trim()}>Tạo kế hoạch</button></form>
        </section>}
        {context && <section className="panel-section">
          <div className="section-head"><h3>Bối cảnh chung</h3><button className="text-button" onClick={editContext}>Chỉnh</button></div>
          <dl className="context-list"><dt>Mục tiêu</dt><dd>{context.goal || 'Chưa có mục tiêu.'}</dd>{context.repo && <><dt>Kho mã</dt><dd className="mono">{context.repo}</dd></>}{context.decisions && <><dt>Quyết định</dt><dd><ul>{context.decisions.split('\n').filter(Boolean).map((decision, index) => <li key={index}>{decision}</li>)}</ul></dd></>}</dl>
          {context.editor && <p className="meta">Cập nhật bởi {context.editor}{context.updated ? ` · ${recentTime(context.updated)}` : ''}</p>}
        </section>}
        {activeRoom.kind === 'group' && <section className="panel-section">
          <div className="section-head"><h3>Thành viên</h3><button className="text-button" onClick={() => openModal('add')}>Thêm</button></div>
          <ul className="member-list">{members.map(person => <li key={person.id}><Face person={person} name={person.name} size={28} /><span><strong>{person.name}{person.id === data?.user.id ? ' (Bạn)' : ''}</strong>{person.role && <small>AI · {person.role}</small>}</span></li>)}</ul>
        </section>}
      </div>
    </aside>}
    </div>
    <Dialog open={!!modal} onOpenChange={open => { if (!open) setModal(''); }}>
      <DialogContent className={`mora-dialog ${modal === 'thread' ? 'wide-dialog' : ''}`} showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); if (mobileChat && window.innerWidth < 700 && !panelOpen) composer.current?.focus(); else modalTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle>{modal ? titles[modal] : ''}</DialogTitle><DialogDescription className="sr-only">{modal === 'bot' ? 'Đặt tên và vai trò cho đồng đội AI.' : 'Quản lý cuộc trò chuyện của bạn.'}</DialogDescription></DialogHeader>
        <DialogClose className="icon-button dialog-close" aria-label="Đóng"><X size={20} /></DialogClose>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        {modal === 'new' && <div className="new-options">{([{ type: 'connect', text: 'Tìm thành viên', icon: UserPlus }, { type: 'bot', text: 'Tạo bot', icon: Plus }, { type: 'group', text: 'Tạo nhóm', icon: Users }] as const).map(item => <button key={item.type} onClick={() => openModal(item.type)}><span className="option-icon"><item.icon size={20} /></span>{item.text}<ChevronRight size={18} /></button>)}</div>}
        {(modal === 'bot' || modal === 'group' || modal === 'add' || modal === 'context' || modal === 'plan') && <form className="modal-form" onSubmit={submitForm}>
          {(modal === 'bot' || modal === 'group') && <label htmlFor="new-name">{modal === 'bot' ? 'Tên bot' : 'Tên nhóm'}<input id="new-name" name="name" autoComplete="off" value={name} onChange={event => setName(event.target.value)} placeholder={modal === 'bot' ? 'Ví dụ: An' : 'Ví dụ: Nhóm bán hàng'} required maxLength={modal === 'bot' ? 50 : 60} /></label>}
          {modal === 'bot' && <label htmlFor="bot-role">Vai trò<textarea id="bot-role" name="role" value={role} onChange={event => setRole(event.target.value)} placeholder="Ví dụ: Hỗ trợ bán hàng, tư vấn sản phẩm và soạn tin nhắn cho khách." required maxLength={2000} rows={4} /></label>}
          {(modal === 'group' || modal === 'add') && <><label htmlFor="member-search">Thành viên<input id="member-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm người hoặc bot" /></label><div className="member-picker">{picker.map(person => <label className="member-option" key={person.id}><Face person={person} name={person.name} size={32} /><span><strong>{person.name}</strong>{person.role && <small>AI · {person.role}</small>}</span><input type="checkbox" checked={selected.includes(person.id)} onChange={event => setSelected(current => event.target.checked ? [...current, person.id] : current.filter(id => id !== person.id))} /></label>)}{!picker.length && <p className="muted">Không tìm thấy thành viên.</p>}</div></>}
          {modal === 'context' && editingContext && <><label>Mục tiêu<textarea rows={2} required value={editingContext.goal} onChange={event => setEditingContext({ ...editingContext, goal: event.target.value })} /></label><label>Kho mã tham chiếu<input value={editingContext.repo} placeholder="owner/repository" onChange={event => setEditingContext({ ...editingContext, repo: event.target.value })} /></label><label>Quyết định<textarea rows={4} value={editingContext.decisions} onChange={event => setEditingContext({ ...editingContext, decisions: event.target.value })} /></label></>}
          {modal === 'plan' && <label>Các bước thực hiện<textarea rows={6} value={plan} onChange={event => setPlan(event.target.value)} required /></label>}
          <button className="primary form-submit" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : modal === 'bot' ? 'Tạo bot' : modal === 'group' ? 'Tạo nhóm' : modal === 'add' ? 'Thêm thành viên' : 'Lưu'}</button>
        </form>}
        {modal === 'connect' && <><div className="search-field dialog-search"><Search size={16} /><label className="sr-only" htmlFor="connect-search">Tìm người hoặc bot</label><input id="connect-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm người hoặc bot" /></div><div className="member-picker">{picker.map(person => <button className="member-option" key={person.id} disabled={saving} onClick={() => void connect(person)}><Face person={person} name={person.name} size={32} /><span><strong>{person.name}</strong>{person.role && <small>AI · {person.role}</small>}</span><ChevronRight size={18} /></button>)}{!picker.length && <p className="muted">Không tìm thấy thành viên.</p>}</div><p className="member-help">Thành viên xuất hiện ở đây sau khi được cấp quyền truy cập Mora và đăng nhập.</p><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); toast.success('Đã sao chép liên kết. Liên kết không tự cấp quyền truy cập.'); } catch { toast.error('Bạn có thể sao chép URL trên thanh địa chỉ.'); } }}>Sao chép liên kết Mora</button></>}
        {modal === 'mention' && <div className="member-picker">{chatBots.map(bot => <button className="member-option" key={bot.id} onClick={() => { setDraft(`${draft}${draft && !draft.endsWith(' ') ? ' ' : ''}@${bot.name} `); setModal(''); setTimeout(() => composer.current?.focus(), 0); }}><BotFace id={bot.id} size={32} /><span><strong>{bot.name}</strong><small>AI · {bot.role}</small></span></button>)}</div>}
        {modal === 'thread' && thread && <><div className="thread-messages">{messageView(thread, undefined, true)}{messages.filter(message => message.parent_id === thread.id).map(message => messageView(message, undefined, true))}</div><form className="reply-form" onSubmit={event => { event.preventDefault(); void send(reply, thread.id); }}><label className="sr-only" htmlFor="thread-reply">Tin nhắn trả lời</label><textarea id="thread-reply" rows={2} placeholder="Trả lời" value={reply} onChange={event => setReply(event.target.value)} maxLength={6000} /><button className="send-button" disabled={busy || !reply.trim()} aria-label="Gửi trả lời"><ArrowUp size={19} /></button></form></>}
      </DialogContent>
    </Dialog>
  </>;
}
