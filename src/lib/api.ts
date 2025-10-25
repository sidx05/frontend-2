// src/lib/api.ts
const API_HOST = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
const PUBLIC_BASE = `${API_HOST}/api`; // Backend routes are mounted at /api

async function safeJson(res: Response) {
  let json: any = null;
  try {
    json = await res.json();
  } catch (err) {
    return null;
  }
  return json;
}

function normalizeArrayResponse(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json?.articles)) return json.articles;
  if (Array.isArray(json?.data?.articles)) return json.data.articles;

  if (json.success && Array.isArray(json.data)) return json.data;
  
  return [];
}

export async function fetchCategoryBySlug(slug: string) {
  const res = await fetch(`${API_HOST}/api/categories/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  const json = await res.json();
  return json; // backend returns { success, category, articles }
}


export async function fetchCategories() {
  const res = await fetch(`${PUBLIC_BASE}/categories`, { cache: "no-store" });
  const json = await safeJson(res);
  return normalizeArrayResponse(json);
}

/**
 * fetchArticles(options)
 * options: { limit?: number, category?: string, categoryKey?: string, page?: number, q?: string }
 * Returns an array (possibly empty).
 */
export async function fetchArticles(options?: Record<string, any>) {
  const url = new URL(`${PUBLIC_BASE}/news`);
  if (options) {
    Object.entries(options).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await safeJson(res);
  return normalizeArrayResponse(json);
}

export async function fetchArticleBySlug(slug: string) {
  if (!slug) throw new Error("Missing slug");
  const res = await fetch(`${PUBLIC_BASE}/articles/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = await safeJson(res);
  return json?.data ?? json;
}

export async function fetchTrending() {
  const res = await fetch(`${PUBLIC_BASE}/trending`, { cache: "no-store" });
  const json = await safeJson(res);
  return json ?? {};
}

export async function fetchActiveTickers() {
  const res = await fetch(`${PUBLIC_BASE}/ticker/active`, { cache: "no-store" });
  const json = await safeJson(res);
  return json?.data ?? json ?? [];
}
