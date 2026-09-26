import { sessionClient } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const client = await sessionClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return Response.redirect(new URL('/', url.origin));
  }
  return Response.redirect(new URL('/signin?error=expired', url.origin));
}
