export async function generateStaticParams() {
  // Return empty array for Tauri dynamic routing
  return []
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
