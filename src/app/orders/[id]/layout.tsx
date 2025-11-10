export async function generateStaticParams() {
  // Return empty array for Tauri dynamic routing
  return []
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
