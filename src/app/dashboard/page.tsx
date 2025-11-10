'use client'

import { LayoutDashboard, Users, ShoppingBag, DollarSign, Package, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { name: 'Total Orders', value: '0', icon: ShoppingBag, color: 'bg-blue-500' },
    { name: 'Active Customers', value: '0', icon: Users, color: 'bg-green-500' },
    { name: 'Revenue (Today)', value: '$0', icon: DollarSign, color: 'bg-yellow-500' },
    { name: 'Pending Orders', value: '0', icon: Package, color: 'bg-purple-500' },
  ]

  const quickActions = [
    { name: 'New Order', href: '/orders/new', icon: ShoppingBag, color: 'bg-blue-600' },
    { name: 'Add Customer', href: '/customers/new', icon: Users, color: 'bg-green-600' },
    { name: 'Inventory', href: '/inventory', icon: Package, color: 'bg-purple-600' },
    { name: 'Reports', href: '/reports', icon: FileText, color: 'bg-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Laundry CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/settings" className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className={`p-3 rounded-lg ${action.color} mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
