'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, ShoppingBag, DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { dashboardApi } from '@/lib/tauri'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      href: '/orders',
    },
    {
      name: 'Active Customers',
      value: stats?.activeCustomers || 0,
      icon: Users,
      color: 'bg-green-500',
      href: '/customers',
    },
    {
      name: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      href: '/billing',
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Package,
      color: 'bg-purple-500',
      href: '/orders?status=received',
    },
  ]

  const quickStats = [
    {
      label: 'Processing',
      value: stats?.processingOrders || 0,
      color: 'text-yellow-600',
    },
    {
      label: 'Ready for Pickup',
      value: stats?.readyOrders || 0,
      color: 'text-green-600',
    },
  ]

  const quickActions = [
    { name: 'New Order', href: '/orders/new', icon: ShoppingBag, color: 'bg-blue-600' },
    { name: 'Add Customer', href: '/customers/new', icon: Users, color: 'bg-green-600' },
    { name: 'View Inventory', href: '/inventory', icon: Package, color: 'bg-purple-600' },
    { name: 'Reports', href: '/reports', icon: TrendingUp, color: 'bg-orange-600' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {loading ? '...' : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      {loading ? '...' : stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className={`p-3 rounded-lg ${action.color} mb-2`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {stats && stats.totalOrders === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Get Started</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Welcome to your Laundry CRM! Start by adding your first customer and creating an order.
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <Link
                      href="/customers/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Add Customer
                    </Link>
                    <Link
                      href="/settings"
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      Configure Settings
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
