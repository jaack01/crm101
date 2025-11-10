'use client'

export const dynamicParams = false

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
  CreditCard,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { orderApi, customerApi, paymentApi } from '@/lib/tauri'
import type { Order, Customer, Payment, PaymentMethod } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency, getOrderStatusColor, getPaymentMethodLabel } from '@/lib/utils'

function OrderDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    loadOrderData()
  }, [orderId])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      const orderData = await orderApi.getById(orderId)
      setOrder(orderData)

      const [customerData, paymentsData] = await Promise.all([
        customerApi.getById(orderData.customerId),
        paymentApi.getByOrder(orderId),
      ])

      setCustomer(customerData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Failed to load order:', error)
      toast.error('Failed to load order data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return

    try {
      await orderApi.updateStatus(orderId, newStatus)
      toast.success('Order status updated')
      loadOrderData()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleAddPayment = async () => {
    if (!order) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const remainingAmount = order.totalAmount - order.paidAmount
    if (amount > remainingAmount) {
      toast.error(`Amount cannot exceed outstanding balance of ${formatCurrency(remainingAmount)}`)
      return
    }

    setProcessingPayment(true)

    try {
      await paymentApi.create({
        orderId,
        amount,
        paymentMethod,
        notes: paymentNotes || undefined,
      })

      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentNotes('')
      loadOrderData()
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Failed to record payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!order) return

    if (!confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      return
    }

    try {
      await orderApi.delete(orderId)
      toast.success('Order deleted successfully')
      router.push('/orders')
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('Failed to delete order')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </Layout>
    )
  }

  if (!order || !customer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-gray-500">Order not found</p>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const remainingAmount = order.totalAmount - order.paidAmount
  const isPaid = remainingAmount <= 0

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">Order Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="danger" onClick={handleDeleteOrder}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Order Status Banner */}
        <Card className={`border-l-4 ${order.isExpress ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className={`mt-1 text-sm font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${getOrderStatusColor(order.status)}`}
                  >
                    <option value="received">Received</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {order.isExpress && (
                  <div className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                    Express Order
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isPaid ? 'Paid' : 'Pending Payment'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-lg font-medium">{formatDate(order.orderDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    customer.membershipTier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    customer.membershipTier === 'silver' ? 'bg-gray-300 text-gray-900' :
                    customer.membershipTier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.membershipTier.charAt(0).toUpperCase() + customer.membershipTier.slice(1)} Member
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {customer.phone}
                </div>
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{customer.address}</p>
                      {customer.city && customer.pincode && (
                        <p>{customer.city}, {customer.pincode}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <Link href={`/customers/${customer.id}`}>
                    <Button variant="outline" size="sm">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.itemType} - {item.serviceType}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                        {item.barcode && (
                          <p className="text-xs text-gray-500 mt-1">Barcode: {item.barcode}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            {(order.pickupDate || order.deliveryDate) && (
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Order Date:</span>
                    <span className="ml-2 font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  {order.pickupDate && (
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Pickup Date:</span>
                      <span className="ml-2 font-medium">{formatDate(order.pickupDate)}</span>
                    </div>
                  )}
                  {order.deliveryDate && (
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Delivery Date:</span>
                      <span className="ml-2 font-medium">{formatDate(order.deliveryDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Information */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Paid Amount</span>
                  <span className="font-medium">{formatCurrency(order.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remainingAmount > 0 ? 'Outstanding' : 'Balance'}
                  </span>
                  <span className={`text-xl font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(remainingAmount))}
                  </span>
                </div>

                {remainingAmount > 0 && (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full mt-4"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payments recorded</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                          <span className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                        {payment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Record Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Pay
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={remainingAmount}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Max: ${formatCurrency(remainingAmount)}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Wallet</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction ID, reference, etc."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddPayment}
                    isLoading={processingPayment}
                    className="flex-1"
                  >
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setPaymentAmount('')
                      setPaymentNotes('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  )
}


