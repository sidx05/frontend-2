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
  
  try {
    const res = await fetch(`${API_HOST}/api/public/articles?limit=50`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Articles fetch failed: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    console.log('Articles response:', { success: data.success, count: data?.data?.articles?.length })
    
    // backend returns { success, data: { articles: [], pagination: {...} } }
    return Array.isArray(data?.data?.articles) ? data.data.articles : []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found.</p>
          <p className="text-gray-400 text-sm mt-2">Articles may still be loading from your sources.</p>
        </div>
      ) : (
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
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        Showing {articles.length} articles
      </div>
    </div>
  )
}
