'use client'

import { useEffect, useState } from 'react'
import { Settings, Store, ShoppingBag, DollarSign, Database, Plus, Edit, Trash2, Save } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { settingsApi, serviceApi, databaseApi } from '@/lib/tauri'
import type { Service } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<'shop' | 'services' | 'backup'>('shop')
  const [loading, setLoading] = useState(false)

  // Shop settings
  const [shopSettings, setShopSettings] = useState({
    shopName: '',
    shopPhone: '',
    shopEmail: '',
    shopAddress: '',
    currency: 'INR',
    taxRate: '0',
    orderPrefix: 'ORD',
  })

  // Services
  const [services, setServices] = useState<Service[]>([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: '',
    basePrice: 0,
    isActive: true,
  })

  useEffect(() => {
    loadSettings()
    loadServices()
  }, [])

  const loadSettings = async () => {
    try {
      const allSettings = await settingsApi.getAll()
      const settingsMap: Record<string, string> = {}
      allSettings.forEach(s => {
        settingsMap[s.key] = s.value
      })

      setShopSettings({
        shopName: settingsMap['shop_name'] || '',
        shopPhone: settingsMap['shop_phone'] || '',
        shopEmail: settingsMap['shop_email'] || '',
        shopAddress: settingsMap['shop_address'] || '',
        currency: settingsMap['currency'] || 'INR',
        taxRate: settingsMap['tax_rate'] || '0',
        orderPrefix: settingsMap['order_prefix'] || 'ORD',
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadServices = async () => {
    try {
      const data = await serviceApi.getAll()
      setServices(data)
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  const handleSaveShopSettings = async () => {
    setLoading(true)
    try {
      await Promise.all([
        settingsApi.set('shop_name', shopSettings.shopName),
        settingsApi.set('shop_phone', shopSettings.shopPhone),
        settingsApi.set('shop_email', shopSettings.shopEmail),
        settingsApi.set('shop_address', shopSettings.shopAddress),
        settingsApi.set('currency', shopSettings.currency),
        settingsApi.set('tax_rate', shopSettings.taxRate),
        settingsApi.set('order_prefix', shopSettings.orderPrefix),
      ])
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingService) {
        await serviceApi.update(editingService.id, serviceForm)
        toast.success('Service updated successfully')
      } else {
        await serviceApi.create(serviceForm)
        toast.success('Service added successfully')
      }

      setShowServiceModal(false)
      setEditingService(null)
      resetServiceForm()
      loadServices()
    } catch (error) {
      console.error('Failed to save service:', error)
      toast.error('Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      category: service.category,
      basePrice: service.basePrice,
      isActive: service.isActive,
    })
    setShowServiceModal(true)
  }

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    try {
      await serviceApi.delete(id)
      toast.success('Service deleted successfully')
      loadServices()
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast.error('Failed to delete service')
    }
  }

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      category: '',
      basePrice: 0,
      isActive: true,
    })
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      await databaseApi.backup(`./backup-${timestamp}.db`)
      toast.success('Database backed up successfully')
    } catch (error) {
      console.error('Failed to backup database:', error)
      toast.error('Failed to backup database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure application preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shop'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Store className="w-5 h-5 inline mr-2" />
              Shop Details
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Services & Pricing
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-5 h-5 inline mr-2" />
              Backup & Data
            </button>
          </nav>
        </div>

        {/* Shop Details Tab */}
        {activeTab === 'shop' && (
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Shop Name"
                  value={shopSettings.shopName}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                  placeholder="Enter shop name"
                />

                <Input
                  label="Phone Number"
                  value={shopSettings.shopPhone}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopPhone: e.target.value })}
                  placeholder="Enter phone number"
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={shopSettings.shopEmail}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopEmail: e.target.value })}
                  placeholder="Enter email address"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={shopSettings.currency}
                    onChange={(e) => setShopSettings({ ...shopSettings, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <Input
                  label="Tax Rate (%)"
                  type="number"
                  value={shopSettings.taxRate}
                  onChange={(e) => setShopSettings({ ...shopSettings, taxRate: e.target.value })}
                  placeholder="0"
                />

                <Input
                  label="Order Number Prefix"
                  value={shopSettings.orderPrefix}
                  onChange={(e) => setShopSettings({ ...shopSettings, orderPrefix: e.target.value })}
                  placeholder="ORD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                <textarea
                  value={shopSettings.shopAddress}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopAddress: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete shop address"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveShopSettings} isLoading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                resetServiceForm()
                setEditingService(null)
                setShowServiceModal(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {services.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No services configured yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Base Price</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{service.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{service.category}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">
                              {formatCurrency(service.basePrice)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditService(service)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteService(service.id, service.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Create a backup of your database to protect your data. Backups are saved to your local directory.
                </p>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Create Backup</p>
                    <p className="text-sm text-blue-700">Backup all customers, orders, and settings</p>
                  </div>
                  <Button onClick={handleBackup} isLoading={loading}>
                    <Database className="w-4 h-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Important Notes</h3>
                    <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                      <li>• Backups are created in the application directory</li>
                      <li>• Regular backups are recommended (daily or weekly)</li>
                      <li>• Store backups in a safe location</li>
                      <li>• Test restore functionality periodically</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Service Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <Input
                    label="Service Name"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="e.g., Shirt"
                    required
                  />

                  <Input
                    label="Category"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    placeholder="e.g., Wash, Dry Clean, Iron"
                    required
                  />

                  <Input
                    label="Base Price (₹)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.basePrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, basePrice: parseFloat(e.target.value) || 0 })}
                    required
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={serviceForm.isActive}
                      onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                      Active (available for orders)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" isLoading={loading} className="flex-1">
                      {editingService ? 'Update Service' : 'Add Service'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowServiceModal(false)
                        setEditingService(null)
                        resetServiceForm()
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
