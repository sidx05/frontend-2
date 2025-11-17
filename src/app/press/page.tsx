import Link from "next/link";

export default function PressPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Press</h1>
      <p className="mb-4 text-muted-foreground">For press inquiries, media kits, or interview requests please contact <a className="text-blue-600" href="mailto:team.newshub@outlook.com">team.newshub@outlook.com</a>.</p>
      <p className="mt-6"><Link href="/" className="text-blue-600 hover:underline">Return to home</Link></p>
    </main>
  );
}
