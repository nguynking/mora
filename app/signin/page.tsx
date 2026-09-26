'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './signin.module.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setSent(true);
    } catch (error) { setError(error instanceof Error ? error.message : 'Chưa thể đăng nhập.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.page}><form onSubmit={submit} className={styles.form}>
    <h1>Đăng nhập</h1>
    {sent ? <p role="status">Kiểm tra email của bạn và mở liên kết đăng nhập trong trình duyệt này.</p> : <>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
      <button disabled={busy}>{busy ? 'Đang gửi…' : 'Tiếp tục'}</button>
    </>}
    {error && <p role="alert">{error}</p>}
    <Link href="/">Quay lại</Link>
  </form></main>;
}
