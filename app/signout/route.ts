import { sessionClient } from '@/lib/supabase';
import { sameOrigin, failure } from '@/lib/mora';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const client = await sessionClient();
    await client.auth.signOut();
    return Response.redirect(new URL('/signin', request.url), 303);
  } catch (error) { return failure(error); }
}
