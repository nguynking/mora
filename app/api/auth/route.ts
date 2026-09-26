import { sessionClient, allowedEmail } from '@/lib/supabase';
import { sameOrigin, json, failure, HttpError } from '@/lib/mora';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { email } = await request.json();
    if (typeof email !== 'string' || email.length > 254 || !allowedEmail(email.trim())) throw new HttpError(403, 'Email này chưa được mời vào không gian làm việc.');
    const client = await sessionClient();
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback` } });
    if (error) throw new HttpError(429, 'Chưa gửi được liên kết đăng nhập. Vui lòng thử lại sau.');
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
