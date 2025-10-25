// src/app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import ArticleViewer from "@/components/article/article-viewer";

// Function to sanitize ObjectIds from text fields
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove MongoDB ObjectId patterns (24 hex characters)
  return text.replace(/\b[0-9a-fA-F]{24}\b/g, '').trim();
}

interface ArticlePageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: { params: any }) {
  // Next.js can pass `params` as a promise in some runtimes — await to be safe
  const { slug } = (await params) as { slug: string };
  const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
  const url = `${API_HOST}/api/articles/${encodeURIComponent(slug)}`; // public article endpoint

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return notFound();
    const json = await res.json();
    let article = json?.data ?? json;

    if (!article) return notFound();

    // Sanitize text fields to remove ObjectIds
    article.title = sanitizeText(article.title);
    article.summary = sanitizeText(article.summary);
    article.content = sanitizeText(article.content);

    // --- Normalizations so ArticleViewer always receives consistent fields ---
    if (article._id && !article.id) article.id = article._id;

    // Normalize category to string label
    if (article.category && typeof article.category === "object") {
      article.category =
        article.category.label ||
        article.category.name ||
        article.category.key ||
        article.category;
    }

    // Normalize author: backend sometimes stores string or object
    if (article.author && typeof article.author === "string") {
      article.author = { name: article.author };
    } else if (article.author && typeof article.author === "object") {
      // ensure name exists
      article.author.name =
        article.author.name || article.author.fullName || article.author.displayName || "";
    } else {
      article.author = undefined;
    }

    // Normalize images to array of {url, alt}
    if (!Array.isArray(article.images)) {
      article.images = [];
      if (article.image && typeof article.image === "string") {
        article.images.push({ url: article.image, alt: article.title || "" });
      } else if (article.openGraph?.image && typeof article.openGraph.image === "string") {
        article.images.push({ url: article.openGraph.image, alt: article.title || "" });
      } else if (article.media && Array.isArray(article.media)) {
        // support common feed shapes
        article.media.forEach((m: any) => {
          if (m.url) article.images.push({ url: m.url, alt: m.alt || article.title || "" });
        });
      }
    }
    // make sure each image is object with url
    article.images = (article.images || []).map((img: any) =>
      typeof img === "string" ? { url: img, alt: article.title || "" } : img
    );

    // expose fallback fields used by UI:
    if (!article.readTime && article.content) {
      const words = (article.content || "").replace(/<\/?[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
      article.readTime = `${Math.max(1, Math.round(words / 200))} min read`;
    }

    return (
      <div className="container mx-auto p-6">
        <ArticleViewer article={article} />
      </div>
    );
  } catch (err) {
    console.error("Error fetching article by slug:", err);
    return notFound();
  }
}
