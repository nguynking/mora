'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mark } from '../brand';
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
  return <main className={styles.page}>
    <form onSubmit={submit} className={styles.form}>
      <Link href="/" className={styles.brand} aria-label="Mora, trang chủ"><Mark size={56} /></Link>
      <h1>Đăng nhập</h1>
      {sent ? <p role="status" className={styles.note}>Kiểm tra email của bạn và mở liên kết đăng nhập trong trình duyệt này.</p> : <>
        <p className={styles.note}>Mora gửi liên kết đăng nhập đến email đã được mời vào không gian làm việc.</p>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required value={email} placeholder="ban@congty.vn" aria-invalid={!!error} aria-describedby={error ? 'signin-error' : undefined} onChange={event => setEmail(event.target.value)} />
        <button disabled={busy}>{busy ? 'Đang gửi…' : 'Tiếp tục'}</button>
      </>}
      {error && <p id="signin-error" role="alert" className={styles.error}>{error}</p>}
      <Link href="/">Quay lại</Link>
    </form>
  </main>;
}
