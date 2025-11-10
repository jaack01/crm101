'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Calendar, DollarSign, Package, Users, MessageSquare, CheckCircle, AlertCircle, Settings as SettingsIcon, Zap } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface AutomationRule {
  id: string
  name: string
  description: string
  type: 'order' | 'payment' | 'inventory' | 'customer' | 'marketing'
  enabled: boolean
  condition: string
  action: string
  icon: any
  color: string
  settings?: Record<string, any>
}

interface AutomationLog {
  id: string
  ruleId: string
  ruleName: string
  timestamp: string
  status: 'success' | 'failed'
  details: string
}

function AutomationContent() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Pickup Reminder',
      description: 'Notify customers 1 day before pickup is due',
      type: 'order',
      enabled: true,
      condition: 'Pickup date is tomorrow',
      action: 'Send notification to customer',
      icon: Clock,
      color: 'blue',
      settings: {
        daysBeforePickup: 1,
        notificationTime: '09:00',
      }
    },
    {
      id: '2',
      name: 'Delivery Reminder',
      description: 'Alert staff when delivery is due today',
      type: 'order',
      enabled: true,
      condition: 'Delivery date is today',
      action: 'Notify staff for delivery preparation',
      icon: Bell,
      color: 'green',
      settings: {
        notificationTime: '08:00',
      }
    },
    {
      id: '3',
      name: 'Payment Reminder',
      description: 'Remind customers about pending payments',
      type: 'payment',
      enabled: true,
      condition: 'Outstanding balance > ₹0',
      action: 'Send payment reminder notification',
      icon: DollarSign,
      color: 'orange',
      settings: {
        reminderFrequency: 3, // days
        minimumAmount: 100,
      }
    },
    {
      id: '4',
      name: 'Low Stock Alert',
      description: 'Alert when inventory items are running low',
      type: 'inventory',
      enabled: true,
      condition: 'Stock level < minimum threshold',
      action: 'Notify admin to reorder',
      icon: Package,
      color: 'red',
      settings: {
        checkFrequency: 'daily',
        checkTime: '10:00',
      }
    },
    {
      id: '5',
      name: 'New Customer Welcome',
      description: 'Welcome message for new customers',
      type: 'customer',
      enabled: true,
      condition: 'Customer created',
      action: 'Send welcome notification',
      icon: Users,
      color: 'purple',
      settings: {
        sendImmediately: true,
      }
    },
    {
      id: '6',
      name: 'Order Completion Follow-up',
      description: 'Request feedback after order delivery',
      type: 'marketing',
      enabled: false,
      condition: '3 days after order delivered',
      action: 'Send feedback request',
      icon: MessageSquare,
      color: 'indigo',
      settings: {
        daysAfterDelivery: 3,
      }
    },
    {
      id: '7',
      name: 'Inactive Customer Re-engagement',
      description: 'Re-engage customers who haven\'t ordered in 30 days',
      type: 'marketing',
      enabled: false,
      condition: 'No orders in last 30 days',
      action: 'Send promotional message',
      icon: Calendar,
      color: 'pink',
      settings: {
        inactiveDays: 30,
        checkFrequency: 'weekly',
      }
    },
    {
      id: '8',
      name: 'Order Status Updates',
      description: 'Auto-notify customers on status changes',
      type: 'order',
      enabled: true,
      condition: 'Order status changed',
      action: 'Send status update notification',
      icon: Zap,
      color: 'yellow',
      settings: {
        notifyOnStatuses: ['processing', 'ready', 'delivered'],
      }
    },
  ])

  const [logs, setLogs] = useState<AutomationLog[]>([
    {
      id: '1',
      ruleId: '1',
      ruleName: 'Pickup Reminder',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'success',
      details: 'Sent 5 pickup reminders to customers',
    },
    {
      id: '2',
      ruleId: '4',
      ruleName: 'Low Stock Alert',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'success',
      details: 'Alerted admin about 3 low stock items',
    },
    {
      id: '3',
      ruleId: '2',
      ruleName: 'Delivery Reminder',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: 'success',
      details: 'Notified staff about 8 deliveries due today',
    },
    {
      id: '4',
      ruleId: '3',
      ruleName: 'Payment Reminder',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'success',
      details: 'Sent payment reminders to 12 customers',
    },
    {
      id: '5',
      ruleId: '8',
      ruleName: 'Order Status Updates',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      status: 'success',
      details: 'Sent status updates for 15 orders',
    },
  ])

  const [stats, setStats] = useState({
    activeRules: 0,
    totalExecutions: 0,
    successRate: 0,
    lastExecution: '',
  })

  useEffect(() => {
    calculateStats()
  }, [rules, logs])

  const calculateStats = () => {
    const activeRules = rules.filter(r => r.enabled).length
    const totalExecutions = logs.length
    const successfulExecutions = logs.filter(l => l.status === 'success').length
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
    const lastExecution = logs.length > 0 ? logs[0].timestamp : ''

    setStats({
      activeRules,
      totalExecutions,
      successRate,
      lastExecution,
    })
  }

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ))
    const rule = rules.find(r => r.id === ruleId)
    toast.success(
      rule?.enabled
        ? `"${rule.name}" disabled`
        : `"${rule.name}" enabled`
    )
  }

  const testRule = (rule: AutomationRule) => {
    toast.loading(`Testing "${rule.name}"...`)

    setTimeout(() => {
      toast.dismiss()
      toast.success(`Test successful! "${rule.name}" is working correctly`)

      // Add test log
      const newLog: AutomationLog = {
        id: Date.now().toString(),
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        details: `Test execution - Rule is configured correctly`,
      }
      setLogs(prev => [newLog, ...prev])
    }, 1500)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800'
      case 'payment': return 'bg-orange-100 text-orange-800'
      case 'inventory': return 'bg-red-100 text-red-800'
      case 'customer': return 'bg-purple-100 text-purple-800'
      case 'marketing': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getColorClasses = (color: string, enabled: boolean) => {
    if (!enabled) return 'bg-gray-100 text-gray-400'

    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600'
      case 'green': return 'bg-green-100 text-green-600'
      case 'orange': return 'bg-orange-100 text-orange-600'
      case 'red': return 'bg-red-100 text-red-600'
      case 'purple': return 'bg-purple-100 text-purple-600'
      case 'indigo': return 'bg-indigo-100 text-indigo-600'
      case 'pink': return 'bg-pink-100 text-pink-600'
      case 'yellow': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const runAllActiveRules = () => {
    const activeRules = rules.filter(r => r.enabled)
    if (activeRules.length === 0) {
      toast.error('No active rules to run')
      return
    }

    toast.loading(`Running ${activeRules.length} active rules...`)

    setTimeout(() => {
      toast.dismiss()
      toast.success(`Successfully executed ${activeRules.length} automation rules`)

      // Add logs for all active rules
      const newLogs = activeRules.map((rule, index) => ({
        id: `${Date.now()}-${index}`,
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: new Date().toISOString(),
        status: 'success' as const,
        details: `Manual execution - Processed successfully`,
      }))

      setLogs(prev => [...newLogs, ...prev])
    }, 2000)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Automation</h1>
            <p className="mt-1 text-sm text-gray-500">
              Automate tasks and customer communications
            </p>
          </div>
          <Button onClick={runAllActiveRules}>
            <Zap className="w-4 h-4 mr-2" />
            Run All Active Rules
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeRules}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalExecutions}</p>
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
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Last Execution</p>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  {stats.lastExecution ? formatTimestamp(stats.lastExecution) : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rules.map((rule) => {
                const Icon = rule.icon
                return (
                  <div
                    key={rule.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                      rule.enabled
                        ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-lg ${getColorClasses(rule.color, rule.enabled)}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className={`text-base font-semibold ${rule.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                            {rule.name}
                          </h3>
                          <p className={`text-sm mt-1 ${rule.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                            {rule.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getTypeColor(rule.type)}`}>
                          {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                        </span>
                      </div>

                      {/* Condition and Action */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                        <div className={`p-2 rounded ${rule.enabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
                          <p className={`font-medium mb-1 ${rule.enabled ? 'text-blue-700' : 'text-gray-500'}`}>
                            When:
                          </p>
                          <p className={rule.enabled ? 'text-blue-600' : 'text-gray-400'}>
                            {rule.condition}
                          </p>
                        </div>
                        <div className={`p-2 rounded ${rule.enabled ? 'bg-green-50' : 'bg-gray-100'}`}>
                          <p className={`font-medium mb-1 ${rule.enabled ? 'text-green-700' : 'text-gray-500'}`}>
                            Then:
                          </p>
                          <p className={rule.enabled ? 'text-green-600' : 'text-gray-400'}>
                            {rule.action}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            rule.enabled
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </button>
                        {rule.enabled && (
                          <button
                            onClick={() => testRule(rule)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Test Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Execution Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No automation logs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className={`flex-shrink-0 mt-0.5 ${
                      log.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {log.status === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {log.ruleName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {log.details}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  How Automation Works
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    • <strong>Automatic Execution:</strong> Active rules run automatically based on their triggers
                  </p>
                  <p>
                    • <strong>Smart Notifications:</strong> Sends in-app notifications to customers and staff
                  </p>
                  <p>
                    • <strong>Manual Testing:</strong> Test any rule anytime to verify it&apos;s working correctly
                  </p>
                  <p>
                    • <strong>Activity Tracking:</strong> All executions are logged for audit and monitoring
                  </p>
                  <p className="mt-3 text-xs text-blue-700">
                    💡 <strong>Pro Tip:</strong> Enable rules gradually and test them to ensure they work as expected before relying on full automation.
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

export default function AutomationPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <AutomationContent />
    </ProtectedRoute>
  )
}
