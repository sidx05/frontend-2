import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4 text-muted-foreground">By using NewsHub you agree to our terms. NewsHub aggregates publicly available content and attributes the original sources. Use of our site should comply with all applicable laws and respect content owner rights.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
