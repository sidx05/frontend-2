import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
      <p className="mb-4 text-muted-foreground">Content on NewsHub is aggregated from third-party sources. We aim to link and attribute original articles. We are not responsible for the content or claims made by external sources.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
