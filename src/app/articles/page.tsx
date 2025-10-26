// src/app/articles/page.tsx

import Link from "next/link"

// Function to sanitize ObjectIds from text fields
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove MongoDB ObjectId patterns (24 hex characters)
  return text.replace(/\b[0-9a-fA-F]{24}\b/g, '').trim();
}

async function getArticles() {
  const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${API_HOST}/api/public/articles`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch articles")
  }

  const data = await res.json()
  // backend returns { success, data: { articles: [], pagination: {...} } }
  return Array.isArray(data?.data?.articles) ? data.data.articles : []
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>

      <ul className="space-y-4">
        {articles.map((article: any) => (
          <li key={article._id || article.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md">
            <Link href={`/articles/${article.slug}`}>
              <h2 className="text-xl font-semibold">{sanitizeText(article.title)}</h2>
              <p className="text-gray-600">{sanitizeText(article.summary)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
