'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Search, Calendar } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { customerApi, serviceApi, orderApi } from '@/lib/tauri'
import type { Customer, Service, CreateOrderInput, CreateOrderItemInput } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface OrderItemForm extends CreateOrderItemInput {
  id: string
}

function NewOrderContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)

  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [pickupDate, setPickupDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [isExpress, setIsExpress] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [customersData, servicesData] = await Promise.all([
        customerApi.getAll(),
        serviceApi.getAll(),
      ])
      setCustomers(customersData)
      setServices(servicesData.filter((s) => s.isActive))
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        id: Date.now().toString(),
        itemType: '',
        serviceType: '',
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id))
  }

  const updateOrderItem = (id: string, field: keyof OrderItemForm, value: any) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }

          // Auto-populate price when service is selected
          if (field === 'serviceType') {
            const service = services.find((s) => s.id === value)
            if (service) {
              updated.unitPrice = service.basePrice
              updated.itemType = service.name
            }
          }

          return updated
        }
        return item
      })
    )
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomer) {
      toast.error('Please select a customer')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    // Validate all items have service selected
    const invalidItems = orderItems.filter((item) => !item.serviceType || item.quantity <= 0)
    if (invalidItems.length > 0) {
      toast.error('Please fill in all item details')
      return
    }

    setLoading(true)

    try {
      const orderData: CreateOrderInput = {
        customerId: selectedCustomer.id,
        pickupDate: pickupDate || undefined,
        deliveryDate: deliveryDate || undefined,
        isExpress,
        notes: notes || undefined,
        items: orderItems.map((item) => ({
          itemType: item.itemType,
          serviceType: item.serviceType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }

      const orderId = await orderApi.create(orderData)
      toast.success('Order created successfully!')
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/orders">
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-1 text-sm text-gray-500">Add a new order for a customer</p>
          </div>
        </div>

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customer by name or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowCustomerSearch(true)
                    }}
                    onFocus={() => setShowCustomerSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {showCustomerSearch && searchTerm && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No customers found</p>
                        <Link href="/customers/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                          Create new customer
                        </Link>
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowCustomerSearch(false)
                            setSearchTerm('')
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>2. Add Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items added yet</p>
                <Button type="button" variant="outline" className="mt-4" onClick={addOrderItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service
                        </label>
                        <select
                          value={item.serviceType}
                          onChange={(e) => updateOrderItem(item.id, 'serviceType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select service...</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.category} - {service.name} ({formatCurrency(service.basePrice)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full pt-7">
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOrderItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>3. Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Pickup Date (Optional)
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isExpress"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isExpress" className="ml-2 text-sm font-medium text-gray-700">
                Express Order (Priority Processing)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any special instructions or notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Create Order
          </Button>
          <Link href="/orders" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Layout>
  )
}

export default function NewOrderPage() {
  return (
    <ProtectedRoute>
      <NewOrderContent />
    </ProtectedRoute>
  )
}
