'use client'

import { useEffect, useState, useRef } from 'react'
import { FileText, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Calendar, Download, FileDown, Percent, BarChart3, Target } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { orderApi, customerApi, inventoryApi } from '@/lib/tauri'
import type { Order, Customer, InventoryItem } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type DateRangePreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

function ReportsContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState<DateRangePreset>('month')
  const [compareWithPrevious, setCompareWithPrevious] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyPreset(preset)
  }, [preset])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, customersData, inventoryData] = await Promise.all([
        orderApi.getAll(),
        customerApi.getAll(),
        inventoryApi.getAll(),
      ])
      setOrders(ordersData)
      setCustomers(customersData)
      setInventory(inventoryData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (presetType: DateRangePreset) => {
    const today = new Date()
    let start: Date
    let end: Date = new Date()

    switch (presetType) {
      case 'today':
        start = new Date(today)
        break
      case 'week':
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        return
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    })
  }

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    end.setHours(23, 59, 59, 999)
    return orderDate >= start && orderDate <= end
  })

  // Previous period for comparison
  const getPreviousPeriodOrders = () => {
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const duration = end.getTime() - start.getTime()

    const prevEnd = new Date(start)
    prevEnd.setMilliseconds(-1)
    const prevStart = new Date(prevEnd.getTime() - duration)

    return orders.filter(order => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= prevStart && orderDate <= prevEnd
    })
  }

  const previousOrders = compareWithPrevious ? getPreviousPeriodOrders() : []

  // Calculate current metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalPaid = filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0)
  const totalOutstanding = totalRevenue - totalPaid
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

  // Previous period metrics
  const prevRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const prevOrderCount = previousOrders.length
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
  const orderChange = prevOrderCount > 0 ? ((filteredOrders.length - prevOrderCount) / prevOrderCount) * 100 : 0

  // Status breakdown
  const statusBreakdown = {
    received: filteredOrders.filter(o => o.status === 'received').length,
    processing: filteredOrders.filter(o => o.status === 'processing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
  }

  // Daily revenue trend for selected period
  const getDaysBetween = (start: Date, end: Date): string[] => {
    const days: string[] = []
    const current = new Date(start)

    while (current <= end) {
      days.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)
  const allDays = getDaysBetween(start, end)

  const dailyRevenue = allDays.map(date => {
    const dayOrders = filteredOrders.filter(o => o.orderDate.split('T')[0] === date)
    return {
      date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      fullDate: date,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: dayOrders.length,
      paid: dayOrders.reduce((sum, o) => sum + o.paidAmount, 0),
    }
  }).slice(-30) // Show max 30 days for readability

  // Service popularity
  const serviceRevenue: Record<string, { count: number; revenue: number }> = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!serviceRevenue[item.serviceType]) {
        serviceRevenue[item.serviceType] = { count: 0, revenue: 0 }
      }
      serviceRevenue[item.serviceType].count += item.quantity
      serviceRevenue[item.serviceType].revenue += item.quantity * item.unitPrice
    })
  })

  const topServices = Object.entries(serviceRevenue)
    .map(([service, data]) => ({
      service,
      count: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Service revenue pie chart data
  const servicePieData = topServices.map((service, index) => ({
    name: service.service,
    value: service.revenue,
    count: service.count,
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

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

  // Customer retention metrics
  const newCustomers = customers.filter(c => {
    const joinDate = new Date(c.createdAt || dateRange.start)
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    return joinDate >= start && joinDate <= end
  }).length

  const repeatCustomers = customerOrders.filter(c => c.orderCount > 1).length
  const oneTimeCustomers = customerOrders.filter(c => c.orderCount === 1).length
  const retentionRate = customerOrders.length > 0 ? (repeatCustomers / customerOrders.length) * 100 : 0

  // Inventory cost estimation (for profit margin)
  const totalInventoryValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity * (item.unitPrice || 0))
  }, 0)

  // Estimated profit (simplified - revenue minus 30% estimated costs)
  const estimatedCosts = totalRevenue * 0.30 // 30% cost assumption
  const estimatedProfit = totalRevenue - estimatedCosts
  const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0

  const handleExportCSV = () => {
    const csvData = [
      ['Laundry CRM - Business Report'],
      [`Period: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`],
      [''],
      ['Summary Metrics'],
      ['Total Revenue', formatCurrency(totalRevenue)],
      ['Total Orders', filteredOrders.length.toString()],
      ['Average Order Value', formatCurrency(averageOrderValue)],
      ['Total Collected', formatCurrency(totalPaid)],
      ['Outstanding', formatCurrency(totalOutstanding)],
      ['Collection Rate', `${totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : 0}%`],
      [''],
      ['Order Details'],
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
    URL.revokeObjectURL(url)
    toast.success('Report exported to CSV successfully')
  }

  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      if (!reportRef.current) return

      toast.loading('Generating PDF...')

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Add header
      pdf.setFontSize(20)
      pdf.setTextColor(30, 64, 175) // Blue
      pdf.text('Laundry CRM - Business Report', pageWidth / 2, 20, { align: 'center' })

      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Period: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`, pageWidth / 2, 28, { align: 'center' })
      pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, pageWidth / 2, 33, { align: 'center' })

      // Add summary metrics
      let yPos = 45
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Summary Metrics', 15, yPos)

      yPos += 10
      pdf.setFontSize(10)
      const metrics = [
        ['Total Revenue:', formatCurrency(totalRevenue)],
        ['Total Orders:', filteredOrders.length.toString()],
        ['Average Order Value:', formatCurrency(averageOrderValue)],
        ['Total Collected:', formatCurrency(totalPaid)],
        ['Outstanding:', formatCurrency(totalOutstanding)],
        ['Collection Rate:', `${totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : 0}%`],
        ['Profit Margin:', `${profitMargin.toFixed(1)}%`],
        ['New Customers:', newCustomers.toString()],
        ['Retention Rate:', `${retentionRate.toFixed(1)}%`],
      ]

      metrics.forEach(([label, value]) => {
        pdf.setTextColor(100, 100, 100)
        pdf.text(label, 15, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.text(value, 80, yPos)
        yPos += 6
      })

      // Add order status breakdown
      yPos += 5
      pdf.setFontSize(14)
      pdf.text('Order Status Breakdown', 15, yPos)

      yPos += 10
      pdf.setFontSize(10)
      const statuses = [
        ['Received:', statusBreakdown.received.toString()],
        ['Processing:', statusBreakdown.processing.toString()],
        ['Ready:', statusBreakdown.ready.toString()],
        ['Delivered:', statusBreakdown.delivered.toString()],
        ['Cancelled:', statusBreakdown.cancelled.toString()],
      ]

      statuses.forEach(([label, value]) => {
        pdf.setTextColor(100, 100, 100)
        pdf.text(label, 15, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.text(value, 80, yPos)
        yPos += 6
      })

      // Add top services
      yPos += 5
      pdf.setFontSize(14)
      pdf.text('Top Services', 15, yPos)

      yPos += 10
      pdf.setFontSize(10)
      topServices.forEach((service, index) => {
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${index + 1}. ${service.service}`, 15, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.text(formatCurrency(service.revenue), 80, yPos)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`(${service.count} items)`, 120, yPos)
        yPos += 6
      })

      // Add new page for top customers if needed
      if (yPos > pageHeight - 60) {
        pdf.addPage()
        yPos = 20
      } else {
        yPos += 10
      }

      // Add top customers
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Top 10 Customers', 15, yPos)

      yPos += 10
      pdf.setFontSize(9)
      customerOrders.forEach((item, index) => {
        if (yPos > pageHeight - 15) {
          pdf.addPage()
          yPos = 20
        }

        pdf.setTextColor(100, 100, 100)
        pdf.text(`${index + 1}.`, 15, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.text(item.customer.name, 22, yPos)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${item.orderCount} orders`, 100, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.text(formatCurrency(item.totalSpent), 140, yPos)
        yPos += 5
      })

      // Add footer
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${totalPages} | Laundry CRM Report`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // Save PDF
      pdf.save(`report-${dateRange.start}-to-${dateRange.end}.pdf`)
      toast.dismiss()
      toast.success('PDF report generated successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.dismiss()
      toast.error('Failed to generate PDF report')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading advanced reports...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6" ref={reportRef}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPreset('today')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setPreset('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setPreset('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setPreset('quarter')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'quarter'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Quarter
                </button>
                <button
                  onClick={() => setPreset('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'year'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Year
                </button>
                <button
                  onClick={() => setPreset('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {/* Custom Date Range */}
              {preset === 'custom' && (
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Custom Range:</span>
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
                </div>
              )}

              {/* Compare Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="compare"
                  checked={compareWithPrevious}
                  onChange={(e) => setCompareWithPrevious(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="compare" className="text-sm font-medium text-gray-700">
                  Compare with previous period
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics with Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  {compareWithPrevious && (
                    <div className="flex items-center gap-1 mt-1">
                      {revenueChange >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">vs previous</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                  {compareWithPrevious && (
                    <div className="flex items-center gap-1 mt-1">
                      {orderChange >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${orderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {orderChange >= 0 ? '+' : ''}{orderChange.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">vs previous</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageOrderValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated profit</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Percent className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Collected"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Revenue Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Service Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={servicePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {servicePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Order Status
              </CardTitle>
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

          {/* Customer Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-blue-600">{newCustomers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Repeat Customers</p>
                  <p className="text-2xl font-bold text-green-600">{repeatCustomers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">One-Time Customers</p>
                  <p className="text-2xl font-bold text-gray-600">{oneTimeCustomers}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{retentionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{service.service}</p>
                      <p className="text-xs text-gray-500">{service.count} items processed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(service.revenue)}</p>
                      <p className="text-xs text-gray-500">
                        {totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0}% of revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers Table */}
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
