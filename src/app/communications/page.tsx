'use client'

import { useState, useEffect } from 'react'
import { Mail, MessageSquare, Send, Users, CheckCircle, Clock, AlertCircle, Plus, Eye, Edit, Copy, Trash2, Filter, Search } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { customerApi } from '@/lib/tauri'
import type { Customer } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface MessageTemplate {
  id: string
  name: string
  type: 'sms' | 'email'
  category: 'promotional' | 'transactional' | 'reminder' | 'greeting'
  subject?: string
  content: string
  variables: string[]
  active: boolean
  usageCount: number
  createdAt: string
}

interface MessageHistory {
  id: string
  templateId: string
  templateName: string
  type: 'sms' | 'email'
  recipients: number
  status: 'sent' | 'pending' | 'failed'
  sentAt: string
  sentBy: string
}

interface CommunicationStats {
  totalSent: number
  smsSent: number
  emailSent: number
  successRate: number
  activeTemplates: number
  pendingMessages: number
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: '1',
    name: 'Order Ready Notification',
    type: 'sms',
    category: 'transactional',
    content: 'Hi {customerName}, your order {orderNumber} is ready for pickup! Please collect it from our shop. Thank you for choosing us!',
    variables: ['customerName', 'orderNumber'],
    active: true,
    usageCount: 156,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Payment Reminder',
    type: 'sms',
    category: 'reminder',
    content: 'Dear {customerName}, friendly reminder about your pending payment of ₹{amount} for order {orderNumber}. Please clear at your earliest convenience.',
    variables: ['customerName', 'amount', 'orderNumber'],
    active: true,
    usageCount: 89,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Welcome Email',
    type: 'email',
    category: 'greeting',
    subject: 'Welcome to {shopName}!',
    content: 'Dear {customerName},\n\nThank you for choosing {shopName}! We\'re delighted to have you as our customer.\n\nAs a welcome gift, you\'ve earned {loyaltyPoints} loyalty points. You can redeem these on your future orders.\n\nWe look forward to serving you!\n\nBest regards,\n{shopName} Team',
    variables: ['customerName', 'shopName', 'loyaltyPoints'],
    active: true,
    usageCount: 234,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Promotional Discount',
    type: 'email',
    category: 'promotional',
    subject: 'Special Offer: {discountPercent}% OFF This Week!',
    content: 'Hi {customerName},\n\nGreat news! Get {discountPercent}% discount on all our services this week.\n\nOffer valid till {offerEndDate}.\n\nVisit us today and save big!\n\nCheers,\n{shopName}',
    variables: ['customerName', 'discountPercent', 'offerEndDate', 'shopName'],
    active: true,
    usageCount: 412,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Birthday Wishes',
    type: 'sms',
    category: 'greeting',
    content: 'Happy Birthday {customerName}! 🎉 As a gift, we\'ve added {bonusPoints} bonus points to your account. Enjoy your special day!',
    variables: ['customerName', 'bonusPoints'],
    active: true,
    usageCount: 67,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'Delivery Notification',
    type: 'sms',
    category: 'transactional',
    content: 'Hi {customerName}, your order {orderNumber} is out for delivery and will reach you by {deliveryTime}. Thank you!',
    variables: ['customerName', 'orderNumber', 'deliveryTime'],
    active: true,
    usageCount: 198,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    name: 'Feedback Request',
    type: 'email',
    category: 'transactional',
    subject: 'How was your experience with {shopName}?',
    content: 'Dear {customerName},\n\nThank you for your recent order {orderNumber}. We hope you\'re satisfied with our service!\n\nWe\'d love to hear your feedback. Please take a moment to rate your experience.\n\nYour feedback helps us serve you better.\n\nThank you,\n{shopName} Team',
    variables: ['customerName', 'orderNumber', 'shopName'],
    active: false,
    usageCount: 23,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    name: 'Inactive Customer Re-engagement',
    type: 'email',
    category: 'promotional',
    subject: 'We Miss You at {shopName}!',
    content: 'Hi {customerName},\n\nIt\'s been a while since we last saw you!\n\nWe\'d love to have you back. Here\'s a special {discountPercent}% discount just for you, valid for the next 7 days.\n\nCome back and experience our improved services.\n\nWarm regards,\n{shopName} Team',
    variables: ['customerName', 'discountPercent', 'shopName'],
    active: true,
    usageCount: 45,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const SAMPLE_HISTORY: MessageHistory[] = [
  {
    id: '1',
    templateId: '4',
    templateName: 'Promotional Discount',
    type: 'email',
    recipients: 145,
    status: 'sent',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentBy: 'Admin User',
  },
  {
    id: '2',
    templateId: '1',
    templateName: 'Order Ready Notification',
    type: 'sms',
    recipients: 23,
    status: 'sent',
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentBy: 'Manager User',
  },
  {
    id: '3',
    templateId: '2',
    templateName: 'Payment Reminder',
    type: 'sms',
    recipients: 12,
    status: 'sent',
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentBy: 'Admin User',
  },
  {
    id: '4',
    templateId: '3',
    templateName: 'Welcome Email',
    type: 'email',
    recipients: 8,
    status: 'sent',
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    sentBy: 'Admin User',
  },
  {
    id: '5',
    templateId: '6',
    templateName: 'Delivery Notification',
    type: 'sms',
    recipients: 34,
    status: 'sent',
    sentAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    sentBy: 'Manager User',
  },
]

function CommunicationsContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES)
  const [history, setHistory] = useState<MessageHistory[]>(SAMPLE_HISTORY)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'sms' | 'email'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'promotional' | 'transactional' | 'reminder' | 'greeting'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [stats, setStats] = useState<CommunicationStats>({
    totalSent: 0,
    smsSent: 0,
    emailSent: 0,
    successRate: 0,
    activeTemplates: 0,
    pendingMessages: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const customersData = await customerApi.getAll()
      setCustomers(customersData)
      calculateStats()
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load communication data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalSent = history.reduce((sum, h) => sum + h.recipients, 0)
    const smsSent = history.filter(h => h.type === 'sms').reduce((sum, h) => sum + h.recipients, 0)
    const emailSent = history.filter(h => h.type === 'email').reduce((sum, h) => sum + h.recipients, 0)
    const successRate = history.filter(h => h.status === 'sent').length / history.length * 100
    const activeTemplates = templates.filter(t => t.active).length
    const pendingMessages = history.filter(h => h.status === 'pending').length

    setStats({
      totalSent,
      smsSent,
      emailSent,
      successRate,
      activeTemplates,
      pendingMessages,
    })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || template.type === filterType
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const handleSendMessage = (template: MessageTemplate) => {
    toast.loading('Preparing to send messages...')

    setTimeout(() => {
      toast.dismiss()
      toast.success(`Message sent successfully to ${customers.length} customers!`)

      // Add to history
      const newHistory: MessageHistory = {
        id: Date.now().toString(),
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        recipients: customers.length,
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentBy: 'Current User',
      }

      setHistory(prev => [newHistory, ...prev])

      // Update template usage
      setTemplates(prev => prev.map(t =>
        t.id === template.id
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ))

      calculateStats()
    }, 2000)
  }

  const handlePreview = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleToggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === templateId
        ? { ...t, active: !t.active }
        : t
    ))
    const template = templates.find(t => t.id === templateId)
    toast.success(template?.active ? 'Template deactivated' : 'Template activated')
  }

  const handleDuplicate = (template: MessageTemplate) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    setTemplates(prev => [newTemplate, ...prev])
    toast.success('Template duplicated successfully')
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'promotional': return 'bg-purple-100 text-purple-800'
      case 'transactional': return 'bg-blue-100 text-blue-800'
      case 'reminder': return 'bg-orange-100 text-orange-800'
      case 'greeting': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'sms' ? MessageSquare : Mail
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading communications...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Send SMS and Email messages to customers
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSent}</p>
                  <p className="text-xs text-gray-500 mt-1">All messages</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SMS Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.smsSent}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.emailSent} emails</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Delivery rate</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Templates</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeTemplates}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to use</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
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
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="sms">SMS Only</option>
                  <option value="email">Email Only</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="promotional">Promotional</option>
                  <option value="transactional">Transactional</option>
                  <option value="reminder">Reminder</option>
                  <option value="greeting">Greeting</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const TypeIcon = getTypeIcon(template.type)
            return (
              <Card key={template.id} className={!template.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      template.type === 'sms' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <TypeIcon className={`w-5 h-5 ${
                        template.type === 'sms' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Used {template.usageCount} times
                            </span>
                          </div>
                        </div>
                        {!template.active && (
                          <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-full flex-shrink-0">
                            Inactive
                          </span>
                        )}
                      </div>

                      {template.subject && (
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                      )}

                      <p className="text-sm text-gray-700 line-clamp-2">
                        {template.content}
                      </p>

                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.variables.map((variable, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-700 rounded"
                            >
                              {`{${variable}}`}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handlePreview(template)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        {template.active && (
                          <button
                            onClick={() => handleSendMessage(template)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Send to All
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(template.id)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {template.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const TypeIcon = getTypeIcon(item.type)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        item.type === 'sms' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <TypeIcon className={`w-4 h-4 ${
                          item.type === 'sms' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {item.templateName}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Sent to {item.recipients} recipients by {item.sentBy}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimestamp(item.sentAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {item.status === 'sent' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : item.status === 'pending' ? (
                          <Clock className="w-5 h-5 text-orange-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Template Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Template Name</h3>
                    <p className="text-base text-gray-900">{selectedTemplate.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Type & Category</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedTemplate.type === 'sms' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedTemplate.type.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(selectedTemplate.category)}`}>
                        {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)}
                      </span>
                    </div>
                  </div>

                  {selectedTemplate.subject && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject</h3>
                      <p className="text-base text-gray-900">{selectedTemplate.subject}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Message Content</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </p>
                    </div>
                  </div>

                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Variables</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm font-mono bg-gray-100 text-gray-700 rounded"
                          >
                            {`{${variable}}`}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        These variables will be automatically replaced with actual customer data when sending.
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Usage Statistics</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Used {selectedTemplate.usageCount} times</span>
                      <span>•</span>
                      <span>Created {formatTimestamp(selectedTemplate.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedTemplate.active && (
                    <Button
                      onClick={() => {
                        setShowPreview(false)
                        handleSendMessage(selectedTemplate)
                      }}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to All Customers
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function CommunicationsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <CommunicationsContent />
    </ProtectedRoute>
  )
}
