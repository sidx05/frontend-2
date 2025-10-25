import Link from "next/link";

export default function BrandWireLink({ className }: { className?: string }) {
  return (
    <Link href="/news?category=brand-wire&limit=10000" className={className + " font-semibold hover:underline"}>
      Brand Wire
    </Link>
  );
}


