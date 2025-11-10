'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { dashboardApi, orderApi, customerApi, inventoryApi } from '@/lib/tauri'
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils'
import type { DashboardStats, Order, Customer, InventoryItem } from '@/lib/types'

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topCustomers, setTopCustomers] = useState<Customer[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData, customersData, inventoryData] = await Promise.all([
        dashboardApi.getStats(),
        orderApi.getAll(),
        customerApi.getAll(),
        inventoryApi.getAll(),
      ])

      setStats(statsData)

      // Get 5 most recent orders
      setRecentOrders(ordersData.slice(0, 5))

      // Get top 5 customers by loyalty points
      const sortedCustomers = [...customersData].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
      setTopCustomers(sortedCustomers.slice(0, 5))

      // Get low stock items
      const lowStock = inventoryData.filter(item =>
        item.minStockLevel && item.quantity <= item.minStockLevel
      )
      setLowStockItems(lowStock.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/reports',
    },
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/orders',
    },
    {
      name: 'Active Customers',
      value: stats?.activeCustomers || 0,
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/customers',
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      change: '-2.1%',
      trend: 'down',
      icon: Package,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/orders?status=received',
    },
  ]

  const quickActions = [
    {
      name: 'New Order',
      href: '/orders/new',
      icon: ShoppingBag,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Create a new order'
    },
    {
      name: 'Add Customer',
      href: '/customers/new',
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Add new customer'
    },
    {
      name: 'Check Inventory',
      href: '/inventory',
      icon: Package,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'View stock levels'
    },
    {
      name: 'View Reports',
      href: '/reports',
      icon: TrendingUp,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Business analytics'
    },
  ]

  const orderStatusBreakdown = [
    {
      status: 'Received',
      count: stats?.pendingOrders || 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      status: 'Processing',
      count: stats?.processingOrders || 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      status: 'Ready',
      count: stats?.readyOrders || 0,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back! Here&apos;s your business overview.</p>
          </div>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '#').replace('500', '') }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <div className={`${action.color} text-white rounded-lg p-4 transition-all hover:shadow-md cursor-pointer`}>
                    <action.icon className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">{action.name}</h3>
                    <p className="text-sm text-white/80">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderStatusBreakdown.map((item) => {
                  const total = (stats?.totalOrders || 1)
                  const percentage = Math.round((item.count / total) * 100)

                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                        <span className={`text-sm font-semibold ${item.textColor}`}>
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Low Stock Alerts</CardTitle>
                <Link href="/inventory">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All items in stock!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} {item.unit} remaining
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        Low Stock
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/orders">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Customers</CardTitle>
                <Link href="/customers">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No customers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <Link key={customer.id} href={`/customers/${customer.id}`}>
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {customer.loyaltyPoints} pts
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{customer.membershipTier}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
