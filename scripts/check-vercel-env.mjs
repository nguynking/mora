const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'MORA_ALLOWED_EMAILS'].filter(key => !process.env[key]);
if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) missing.push('POSTGRES_URL');
if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
if (missing.length) throw new Error(`Configure these Vercel environment variables before deployment: ${missing.join(', ')}.`);
