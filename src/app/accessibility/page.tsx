import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Accessibility</h1>
      <p className="mb-4 text-muted-foreground">We strive to make NewsHub accessible to everyone. If you have difficulty using the site, please contact us at <a className="text-blue-600" href="mailto:contact@newshub.com">contact@newshub.com</a> and we'll work to address the issue.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
