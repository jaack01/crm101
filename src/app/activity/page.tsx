'use client'

import { useState } from 'react'
import { Activity, Search, Filter, User, ShoppingBag, Users, Package, Settings as SettingsIcon, DollarSign } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'

interface ActivityLog {
  id: string
  action: string
  type: 'customer' | 'order' | 'payment' | 'inventory' | 'staff' | 'settings'
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, any>
}

function ActivityContent() {
  // Demo data - in production, fetch from backend
  const [activities] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Created Order',
      type: 'order',
      description: 'Created order #ORD-001 for customer John Doe',
      user: 'Admin User',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      action: 'Payment Received',
      type: 'payment',
      description: 'Received payment of ₹500 for order #ORD-001',
      user: 'Staff User',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      action: 'Customer Added',
      type: 'customer',
      description: 'Added new customer: Jane Smith',
      user: 'Manager User',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4',
      action: 'Inventory Updated',
      type: 'inventory',
      description: 'Updated stock for Detergent Powder (50 → 45 kg)',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: '5',
      action: 'Staff Added',
      type: 'staff',
      description: 'Added new staff member: Mike Johnson (Role: Staff)',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: '6',
      action: 'Settings Updated',
      type: 'settings',
      description: 'Updated shop settings: Tax rate changed to 18%',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: '7',
      action: 'Order Status Changed',
      type: 'order',
      description: 'Changed order #ORD-001 status from Received to Processing',
      user: 'Staff User',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: '8',
      action: 'Payment Recorded',
      type: 'payment',
      description: 'Recorded partial payment of ₹300 for order #ORD-002',
      user: 'Manager User',
      timestamp: new Date(Date.now() - 25200000).toISOString(),
    },
  ])

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(search.toLowerCase()) ||
      activity.user.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || activity.type === filterType
    return matchesSearch && matchesType
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-green-600" />
      case 'payment':
        return <DollarSign className="h-5 w-5 text-purple-600" />
      case 'inventory':
        return <Package className="h-5 w-5 text-orange-600" />
      case 'staff':
        return <User className="h-5 w-5 text-indigo-600" />
      case 'settings':
        return <SettingsIcon className="h-5 w-5 text-gray-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-800'
      case 'order':
        return 'bg-green-100 text-green-800'
      case 'payment':
        return 'bg-purple-100 text-purple-800'
      case 'inventory':
        return 'bg-orange-100 text-orange-800'
      case 'staff':
        return 'bg-indigo-100 text-indigo-800'
      case 'settings':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const typeStats = {
    all: activities.length,
    customer: activities.filter(a => a.type === 'customer').length,
    order: activities.filter(a => a.type === 'order').length,
    payment: activities.filter(a => a.type === 'payment').length,
    inventory: activities.filter(a => a.type === 'inventory').length,
    staff: activities.filter(a => a.type === 'staff').length,
    settings: activities.filter(a => a.type === 'settings').length,
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all actions and changes in the system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('all')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{typeStats.all}</p>
                <p className="text-xs text-gray-600 mt-1">All Activities</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('customer')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{typeStats.customer}</p>
                <p className="text-xs text-gray-600 mt-1">Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('order')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{typeStats.order}</p>
                <p className="text-xs text-gray-600 mt-1">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('payment')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{typeStats.payment}</p>
                <p className="text-xs text-gray-600 mt-1">Payments</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('inventory')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{typeStats.inventory}</p>
                <p className="text-xs text-gray-600 mt-1">Inventory</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('staff')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{typeStats.staff}</p>
                <p className="text-xs text-gray-600 mt-1">Staff</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterType('settings')}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{typeStats.settings}</p>
                <p className="text-xs text-gray-600 mt-1">Settings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="customer">Customers</option>
                  <option value="order">Orders</option>
                  <option value="payment">Payments</option>
                  <option value="inventory">Inventory</option>
                  <option value="staff">Staff</option>
                  <option value="settings">Settings</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No activities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {activity.action}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {activity.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getTypeColor(activity.type)}`}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user}
                        </span>
                        <span>•</span>
                        <span>{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function ActivityPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <ActivityContent />
    </ProtectedRoute>
  )
}
