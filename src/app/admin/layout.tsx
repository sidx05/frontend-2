export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware handles authentication, no need for client-side check
  return <>{children}</>;
}
