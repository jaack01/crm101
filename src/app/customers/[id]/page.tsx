'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, Award, ShoppingBag } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { customerApi, orderApi } from '@/lib/tauri'
import type { Customer, Order } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency, getOrderStatusColor } from '@/lib/utils'

function CustomerDetailContent() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerData()
  }, [customerId])

  const loadCustomerData = async () => {
    try {
      setLoading(true)
      const [customerData, ordersData] = await Promise.all([
        customerApi.getById(customerId),
        orderApi.getByCustomer(customerId),
      ])
      setCustomer(customerData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load customer:', error)
      toast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return

    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) {
      return
    }

    try {
      await customerApi.delete(customerId)
      toast.success('Customer deleted successfully')
      router.push('/customers')
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const getMembershipBadge = (tier: string) => {
    const badges = {
      standard: 'bg-gray-100 text-gray-800',
      silver: 'bg-gray-300 text-gray-900',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
    }
    return badges[tier as keyof typeof badges] || badges.standard
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOutstanding = orders.reduce((sum, order) => sum + (order.totalAmount - order.paidAmount), 0)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading customer details...</p>
        </div>
      </Layout>
    )
  }

  if (!customer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-gray-500">Customer not found</p>
          <Link href="/customers">
            <Button>Back to Customers</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${getMembershipBadge(
                  customer.membershipTier
                )}`}
              >
                {customer.membershipTier.charAt(0).toUpperCase() + customer.membershipTier.slice(1)} Member
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/customers/${customerId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{customer.address}</p>
                    {customer.city && customer.pincode && (
                      <p className="text-gray-500">{customer.city}, {customer.pincode}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Member since {formatDate(customer.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-lg font-semibold">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-lg font-semibold">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Outstanding</span>
                <span className={`text-lg font-semibold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points</span>
                <span className="text-2xl font-bold text-blue-600">{customer.loyaltyPoints}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                <span>{customer.membershipTier.charAt(0).toUpperCase() + customer.membershipTier.slice(1)} Tier</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No orders yet</p>
                <Link href="/orders/new" className="inline-block mt-4">
                  <Button>Create First Order</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Paid</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(order.orderDate)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3 px-4 text-sm text-right">{formatCurrency(order.paidAmount)}</td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
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

export default function CustomerDetailPage() {
  return (
    <ProtectedRoute>
      <CustomerDetailContent />
    </ProtectedRoute>
  )
}
