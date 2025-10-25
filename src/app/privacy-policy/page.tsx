import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4 text-muted-foreground">
        NewsHub aggregates publicly available articles from a variety of sources.
        We display article headlines and excerpts and always include attribution to the original
        source. We do not claim ownership of scraped content — all source names and links are shown
        alongside each article. If you are a content owner and have concerns, please contact us.
      </p>
      <p className="text-sm text-muted-foreground">For more details about cookie usage and preferences see the <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
