import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4 text-muted-foreground">
        NewsHub aggregates headlines and excerpts from public news sources to provide a quick
        overview of what's happening. We attribute every article to its original source and link
        back to the original site.
      </p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
