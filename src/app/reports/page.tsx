'use client'

import { useEffect, useState } from 'react'
import { FileText, TrendingUp, Users, ShoppingBag, DollarSign, Calendar, Download } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { orderApi, customerApi } from '@/lib/tauri'
import type { Order, Customer } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

function ReportsContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, customersData] = await Promise.all([
        orderApi.getAll(),
        customerApi.getAll(),
      ])
      setOrders(ordersData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    end.setHours(23, 59, 59, 999)
    return orderDate >= start && orderDate <= end
  })

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalPaid = filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0)
  const totalOutstanding = totalRevenue - totalPaid
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

  // Status breakdown
  const statusBreakdown = {
    received: filteredOrders.filter(o => o.status === 'received').length,
    processing: filteredOrders.filter(o => o.status === 'processing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
  }

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {}
  filteredOrders.forEach(order => {
    // This is simplified - in real app, we'd get actual payment methods from payments table
    if (order.paidAmount > 0) {
      paymentMethods['Cash'] = (paymentMethods['Cash'] || 0) + order.paidAmount
    }
  })

  // Top customers
  const customerOrders = customers.map(customer => {
    const customerOrderList = filteredOrders.filter(o => o.customerId === customer.id)
    const totalSpent = customerOrderList.reduce((sum, o) => sum + o.totalAmount, 0)
    return {
      customer,
      orderCount: customerOrderList.length,
      totalSpent,
    }
  }).filter(c => c.orderCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)

  // Daily revenue trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const dailyRevenue = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.orderDate.split('T')[0] === date)
    return {
      date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: dayOrders.length,
    }
  })

  // Service popularity (from order items)
  const serviceCount: Record<string, number> = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      serviceCount[item.serviceType] = (serviceCount[item.serviceType] || 0) + item.quantity
    })
  })

  const topServices = Object.entries(serviceCount)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const handleExport = () => {
    // Generate CSV
    const csvData = [
      ['Order Number', 'Customer', 'Date', 'Status', 'Total', 'Paid', 'Outstanding'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName || '',
        formatDate(order.orderDate),
        order.status,
        order.totalAmount.toString(),
        order.paidAmount.toString(),
        (order.totalAmount - order.paidAmount).toString(),
      ])
    ]

    const csv = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${dateRange.start}-to-${dateRange.end}.csv`
    a.click()
    toast.success('Report exported successfully')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading reports...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Business insights and performance metrics</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Date Range:</span>
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="outline" size="sm" onClick={loadData}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageOrderValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyRevenue.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-20">{day.date}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((day.revenue / Math.max(...dailyRevenue.map(d => d.revenue))) * 100, 5)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{formatCurrency(day.revenue)}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-20">{day.orders} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Received</span>
                  <span className="text-lg font-bold text-blue-600">{statusBreakdown.received}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing</span>
                  <span className="text-lg font-bold text-yellow-600">{statusBreakdown.processing}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ready</span>
                  <span className="text-lg font-bold text-green-600">{statusBreakdown.ready}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="text-lg font-bold text-gray-600">{statusBreakdown.delivered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="text-lg font-bold text-red-600">{statusBreakdown.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              {topServices.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{service.service}</span>
                      <span className="text-lg font-bold text-gray-900">{service.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {customerOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Orders</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total Spent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((item, index) => (
                      <tr key={item.customer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{item.customer.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.customer.phone}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">{item.orderCount}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(item.totalSpent)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            item.customer.membershipTier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            item.customer.membershipTier === 'silver' ? 'bg-gray-300 text-gray-900' :
                            item.customer.membershipTier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.customer.membershipTier.charAt(0).toUpperCase() + item.customer.membershipTier.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Collected</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-green-600 mt-1">
                  {totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : 0}% of total
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalOutstanding)}</p>
                <p className="text-xs text-red-600 mt-1">
                  {totalRevenue > 0 ? ((totalOutstanding / totalRevenue) * 100).toFixed(1) : 0}% pending
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-blue-600 mt-1">Payment efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  )
}
