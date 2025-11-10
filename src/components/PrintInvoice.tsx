'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from './ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, Customer } from '@/lib/types'

interface PrintInvoiceProps {
  order: Order
  customer: Customer
  shopDetails?: {
    name: string
    phone: string
    email: string
    address: string
  }
}

export function PrintInvoice({ order, customer, shopDetails }: PrintInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order.orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background: white;
            }
            .invoice {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header p {
              color: #6b7280;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: 600;
              color: #4b5563;
              font-size: 13px;
            }
            .info-value {
              color: #1f2937;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f3f4f6;
              color: #374151;
              font-weight: 600;
              text-align: left;
              padding: 12px;
              font-size: 13px;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 20px;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .total-row.grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              padding-top: 10px;
              border-top: 2px solid #3b82f6;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 13px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-received { background-color: #dbeafe; color: #1e40af; }
            .status-processing { background-color: #fef3c7; color: #92400e; }
            .status-ready { background-color: #d1fae5; color: #065f46; }
            .status-delivered { background-color: #d1fae5; color: #065f46; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const getStatusClass = (status: string) => {
    return `status-badge status-${status}`
  }

  const shop = shopDetails || {
    name: 'Laundry CRM',
    phone: '+91 00000 00000',
    email: 'info@laundrycrm.com',
    address: 'Your Business Address',
  }

  return (
    <>
      <Button onClick={handlePrint} variant="outline">
        <Printer className="h-4 w-4 mr-2" />
        Print Invoice
      </Button>

      <div ref={printRef} className="hidden">
        <div className="invoice">
          {/* Header */}
          <div className="header">
            <h1>{shop.name}</h1>
            <p>{shop.address}</p>
            <p>Phone: {shop.phone} | Email: {shop.email}</p>
          </div>

          {/* Invoice Info */}
          <div className="section">
            <div className="info-grid">
              <div>
                <div className="section-title">Invoice Details</div>
                <div className="info-item">
                  <span className="info-label">Invoice Number:</span>{' '}
                  <span className="info-value">{order.orderNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Order Date:</span>{' '}
                  <span className="info-value">{formatDate(order.orderDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>{' '}
                  <span className={getStatusClass(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <div className="section-title">Customer Details</div>
                <div className="info-item">
                  <span className="info-label">Name:</span>{' '}
                  <span className="info-value">{customer.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>{' '}
                  <span className="info-value">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>{' '}
                    <span className="info-value">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="info-item">
                    <span className="info-label">Address:</span>{' '}
                    <span className="info-value">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="section">
            <div className="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.serviceType}</td>
                    <td>{item.itemType}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="total-row">
              <span>Paid Amount:</span>
              <span>{formatCurrency(order.paidAmount)}</span>
            </div>
            <div className="total-row">
              <span>Outstanding:</span>
              <span>{formatCurrency(order.totalAmount - order.paidAmount)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Dates */}
          {(order.pickupDate || order.deliveryDate) && (
            <div className="section">
              <div className="info-grid">
                {order.pickupDate && (
                  <div className="info-item">
                    <span className="info-label">Pickup Date:</span>{' '}
                    <span className="info-value">{formatDate(order.pickupDate)}</span>
                  </div>
                )}
                {order.deliveryDate && (
                  <div className="info-item">
                    <span className="info-label">Delivery Date:</span>{' '}
                    <span className="info-value">{formatDate(order.deliveryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="section">
              <div className="section-title">Notes</div>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </>
  )
}
