import { createClient } from '@/lib/supabase/server';

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('connection_test')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-semibold">
          Supabase connection failed
        </h1>

        <pre className="mt-6 whitespace-pre-wrap">
          {error.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold">
        Supabase connection successful
      </h1>

      <p className="mt-4">
        {data?.[0]?.message ?? 'No test record found.'}
      </p>
    </main>
  );
}