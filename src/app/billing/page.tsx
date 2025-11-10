'use client'

import { DollarSign } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/Card'

function BillingContent() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage invoices and payment records</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              Advanced billing and invoice features will be available in the next update.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For now, you can manage payments directly from order details.
            </p>
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
