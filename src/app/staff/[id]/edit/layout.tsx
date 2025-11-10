export async function generateStaticParams() {
  // Return empty array for Tauri dynamic routing
  return []
}

export default function EditStaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
