'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, CheckCircle, Clock, Search, Download, Receipt } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { orderApi, customerApi } from '@/lib/tauri'
import type { Order, Customer } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface BillingStats {
  totalRevenue: number
  totalPaid: number
  totalOutstanding: number
  paymentsToday: number
  avgPaymentSize: number
  collectionRate: number
}

type DateRangePreset = 'today' | 'week' | 'month' | 'year' | 'custom'

function BillingContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all')
  const [preset, setPreset] = useState<DateRangePreset>('month')

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    paymentsToday: 0,
    avgPaymentSize: 0,
    collectionRate: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyPreset(preset)
  }, [preset])

  useEffect(() => {
    if (orders.length > 0) {
      calculateStats()
    }
  }, [orders, dateRange])

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
      toast.error('Failed to load billing data')
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

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    end.setHours(23, 59, 59, 999)

    const inDateRange = orderDate >= start && orderDate <= end

    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'paid' && order.paidAmount === order.totalAmount) ||
                         (filterStatus === 'partial' && order.paidAmount > 0 && order.paidAmount < order.totalAmount) ||
                         (filterStatus === 'unpaid' && order.paidAmount === 0)

    return inDateRange && matchesSearch && matchesStatus
  })

  const calculateStats = () => {
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    end.setHours(23, 59, 59, 999)

    const periodOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= start && orderDate <= end
    })

    const totalRevenue = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalPaid = periodOrders.reduce((sum, o) => sum + o.paidAmount, 0)
    const totalOutstanding = totalRevenue - totalPaid

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const paymentsToday = periodOrders.filter(o => {
      const orderDate = new Date(o.orderDate)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime() && o.paidAmount > 0
    }).reduce((sum, o) => sum + o.paidAmount, 0)

    const paidOrdersCount = periodOrders.filter(o => o.paidAmount > 0).length
    const avgPaymentSize = paidOrdersCount > 0 ? totalPaid / paidOrdersCount : 0
    const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0

    setStats({
      totalRevenue,
      totalPaid,
      totalOutstanding,
      paymentsToday,
      avgPaymentSize,
      collectionRate,
    })
  }

  // Payment method breakdown (simulated)
  const getPaymentMethodBreakdown = () => {
    const breakdown: Record<string, number> = {
      'Cash': 0,
      'Card': 0,
      'UPI': 0,
      'Net Banking': 0,
      'Cheque': 0,
    }

    filteredOrders.forEach(order => {
      if (order.paidAmount > 0) {
        const rand = Math.random()
        if (rand < 0.4) breakdown['Cash'] += order.paidAmount
        else if (rand < 0.65) breakdown['UPI'] += order.paidAmount
        else if (rand < 0.85) breakdown['Card'] += order.paidAmount
        else if (rand < 0.95) breakdown['Net Banking'] += order.paidAmount
        else breakdown['Cheque'] += order.paidAmount
      }
    })

    return Object.entries(breakdown)
      .filter(([_, amount]) => amount > 0)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const paymentMethodData = getPaymentMethodBreakdown()

  // Daily revenue data
  const getDailyRevenue = () => {
    const dailyMap: Record<string, { date: string; collected: number; outstanding: number }> = {}

    filteredOrders.forEach(order => {
      const date = order.orderDate.split('T')[0]
      if (!dailyMap[date]) {
        dailyMap[date] = { date, collected: 0, outstanding: 0 }
      }
      dailyMap[date].collected += order.paidAmount
      dailyMap[date].outstanding += (order.totalAmount - order.paidAmount)
    })

    return Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }))
  }

  const dailyRevenueData = getDailyRevenue()

  // Outstanding payments
  const outstandingOrders = filteredOrders
    .filter(order => order.totalAmount > order.paidAmount)
    .sort((a, b) => (b.totalAmount - b.paidAmount) - (a.totalAmount - a.paidAmount))
    .slice(0, 10)

  // Recent payments
  const recentPayments = filteredOrders
    .filter(order => order.paidAmount > 0)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 10)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  const handleExportCSV = () => {
    const csvData = [
      ['Billing Report'],
      [`Period: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`],
      [''],
      ['Summary'],
      ['Total Revenue', formatCurrency(stats.totalRevenue)],
      ['Total Collected', formatCurrency(stats.totalPaid)],
      ['Outstanding', formatCurrency(stats.totalOutstanding)],
      ['Collection Rate', `${stats.collectionRate.toFixed(1)}%`],
      [''],
      ['Payment Details'],
      ['Order Number', 'Customer', 'Date', 'Total Amount', 'Paid', 'Outstanding', 'Status'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName || '',
        formatDate(order.orderDate),
        order.totalAmount.toString(),
        order.paidAmount.toString(),
        (order.totalAmount - order.paidAmount).toString(),
        order.paidAmount === order.totalAmount ? 'Paid' :
        order.paidAmount > 0 ? 'Partial' : 'Unpaid'
      ])
    ]

    const csv = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-report-${dateRange.start}-to-${dateRange.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported to CSV')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading billing data...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track revenue, payments, and outstanding balances
            </p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Date Range Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPreset('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPreset('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setPreset('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setPreset('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setPreset('custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Range
              </button>

              {preset === 'custom' && (
                <>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredOrders.length} orders</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Collected</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.collectionRate.toFixed(1)}% collected</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
                  <p className="text-xs text-gray-500 mt-1">{outstandingOrders.length} pending</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Payment</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgPaymentSize)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" />
                  <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethodData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px]">
                  <p className="text-gray-500">No payment data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by order or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outstanding Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outstandingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">All payments collected!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outstandingOrders.map((order) => {
                    const outstanding = order.totalAmount - order.paidAmount
                    return (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{order.orderNumber}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{order.customerName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Paid: {formatCurrency(order.paidAmount)} of {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">{formatCurrency(outstanding)}</p>
                            <p className="text-xs text-gray-500">due</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((order) => {
                    const isPaid = order.paidAmount === order.totalAmount
                    return (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{order.orderNumber}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{order.customerName}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(order.orderDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{formatCurrency(order.paidAmount)}</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                              isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isPaid ? 'Paid' : 'Partial'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Payment Management
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    • <strong>Record Payments:</strong> Click on any order to record payments
                  </p>
                  <p>
                    • <strong>Outstanding:</strong> Red highlighted orders need payment collection
                  </p>
                  <p>
                    • <strong>Collection Rate:</strong> Target is 90%+ for healthy cash flow
                  </p>
                  <p>
                    • <strong>Export Reports:</strong> Download payment reports for accounting
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  )
}
