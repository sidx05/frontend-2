// src/app/debug/api/page.tsx
// Simple diagnostics page to verify API env and responses in production

async function tryFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      url,
      preview: text.slice(0, 500),
    };
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      url,
      error: String(e?.message || e),
    };
  }
}

export default async function DebugApiPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "(undefined)";
  const base = API.replace(/\/$/, "");

  const checks = [
    await tryFetch(`${base}/api/health`),
    await tryFetch(`${base}/api/public/articles?limit=3`),
    await tryFetch(`${base}/api/categories`),
    await tryFetch(`${base}/api/trending`),
  ];

  return (
    <div style={{maxWidth: 900, margin: '32px auto', fontFamily: 'ui-sans-serif, system-ui'}}>
      <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 16}}>API Debug</h1>
      <div style={{marginBottom: 16}}>
        <div><strong>NEXT_PUBLIC_API_URL:</strong> {API}</div>
        <div><strong>Build time:</strong> {new Date().toISOString()}</div>
      </div>
      <ol style={{display: 'grid', gap: 12, paddingLeft: 18}}>
        {checks.map((c, i) => (
          <li key={i} style={{border: '1px solid #ddd', borderRadius: 8, padding: 12}}>
            <div><strong>GET</strong> <code>{c.url}</code></div>
            <div>Status: {c.status} {c.ok ? 'OK' : 'ERROR'}</div>
            {('error' in c) ? (
              <pre style={{whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: 8, borderRadius: 6}}>{c.error}</pre>
            ) : (
              <pre style={{whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: 8, borderRadius: 6}}>{c.preview}</pre>
            )}
          </li>
        ))}
      </ol>
      <p style={{marginTop: 16, color: '#666'}}>This page exists for troubleshooting and can be removed once integration is verified.</p>
    </div>
  );
}
