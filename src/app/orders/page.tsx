'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Plus, Search, Eye, Filter, Calendar } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { orderApi } from '@/lib/tauri'
import type { Order, OrderStatus } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency, getOrderStatusColor } from '@/lib/utils'

function OrdersContent() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

  const statusOptions: { value: OrderStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All Orders', color: 'bg-gray-100 text-gray-800' },
    { value: 'received', label: 'Received', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ]

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderApi.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus)
      toast.success('Order status updated')
      loadOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all customer orders</p>
          </div>
          <Link href="/orders/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusOptions.slice(1).map((status) => {
            const count = orders.filter((o) => o.status === status.value).length
            return (
              <Card key={status.value} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter(status.value as OrderStatus)}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 mt-1">{status.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading orders...
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/orders/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Order
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Paid</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isPaid = order.paidAmount >= order.totalAmount
                      const isExpress = order.isExpress

                      return (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                              {isExpress && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                  Express
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{order.customerName || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(order.orderDate, 'dd MMM yyyy')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{order.items.length} items</td>
                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${getOrderStatusColor(order.status)}`}
                            >
                              <option value="received">Received</option>
                              <option value="processing">Processing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <span className={isPaid ? 'text-green-600 font-medium' : 'text-red-600'}>
                              {formatCurrency(order.paidAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {!loading && orders.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="space-x-6">
                  <span className="text-gray-600">Total Orders: <strong>{orders.length}</strong></span>
                  <span className="text-gray-600">Showing: <strong>{filteredOrders.length}</strong></span>
                </div>
                <div className="space-x-6">
                  <span className="text-gray-600">
                    Total Revenue: <strong className="text-green-600">{formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}</strong>
                  </span>
                  <span className="text-gray-600">
                    Outstanding: <strong className="text-red-600">{formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0))}</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  )
}
