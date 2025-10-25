import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
      <p className="mb-4 text-muted-foreground">
        We use cookies to enhance your browsing experience, provide personalized content, and
        analyze traffic. You can manage cookie preferences using the provided controls. Essential
        cookies are required for the site to function.
      </p>
      <p className="text-sm text-muted-foreground">See our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> for information about how we handle data.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
