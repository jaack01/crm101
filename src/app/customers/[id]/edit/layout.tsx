export async function generateStaticParams() {
  // Return empty array for Tauri dynamic routing
  return []
}

export default function EditCustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
