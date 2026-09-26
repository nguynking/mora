import { createBrowserClient } from '@supabase/ssr';

export async function uploadFile(file: File, room: string) {
  const post = async (body: unknown) => {
    const response = await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Chưa tải được tệp.');
    return result;
  };
  const intent = await post({ action: 'prepare', room, name: file.name, size: file.size, mime: file.type });
  const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!);
  // Upload directly to private storage: Vercel requests stay below its body limit.
  const { error } = await client.storage.from('mora-files').uploadToSignedUrl(intent.id, intent.token, file, { contentType: 'application/octet-stream' });
  if (error) throw Error('Chưa tải được tệp. Vui lòng thử lại.');
  await post({ action: 'complete', id: intent.id });
}
