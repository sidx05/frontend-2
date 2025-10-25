import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="mb-4 text-muted-foreground">You can reach us at <a className="text-blue-600" href="mailto:contact@newshub.com">contact@newshub.com</a> for inquiries related to content attribution, partnerships, or support.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
