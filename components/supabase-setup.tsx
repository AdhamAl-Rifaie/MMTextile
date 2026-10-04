export function SupabaseSetup() {
  return (
    <div className="auth-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Supabase setup</h2>
          <p className="card-subtitle">Add your project URL and anon key to continue.</p>
        </div>
      </div>

      <div className="setup-list">
        <code>NEXT_PUBLIC_SUPABASE_URL</code>
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
      </div>

      <p className="status">Create `.env.local` from `.env.example`, then restart the dev server.</p>
    </div>
  );
}
