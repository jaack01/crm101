// Customer Types
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  pincode?: string
  loyaltyPoints: number
  membershipTier: 'standard' | 'silver' | 'gold' | 'platinum'
  createdAt: string
  updatedAt: string
}

// Order Types
export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName?: string
  orderDate: string
  pickupDate?: string
  deliveryDate?: string
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  isExpress: boolean
  notes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'received' | 'processing' | 'ready' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  orderId: string
  itemType: string
  serviceType: string
  quantity: number
  unitPrice: number
  totalPrice: number
  barcode?: string
  status: 'pending' | 'processing' | 'completed'
  createdAt: string
}

// Payment Types
export interface Payment {
  id: string
  orderId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  transactionId?: string
  notes?: string
  createdAt: string
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'cheque'

// Inventory Types
export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStockLevel?: number
  supplierName?: string
  supplierContact?: string
  lastPurchaseDate?: string
  createdAt: string
  updatedAt: string
}

// Service Types
export interface Service {
  id: string
  name: string
  category: string
  basePrice: number
  isActive: boolean
  createdAt: string
}

// Staff Types
export interface Staff {
  id: string
  name: string
  phone: string
  email?: string
  role: StaffRole
  salary?: number
  commissionRate: number
  isActive: boolean
  createdAt: string
}

export type StaffRole = 'admin' | 'manager' | 'staff' | 'delivery'

// Settings Types
export interface Settings {
  key: string
  value: string
  updatedAt: string
}

// Report Types
export interface DailySalesReport {
  date: string
  totalOrders: number
  totalRevenue: number
  cashPayments: number
  cardPayments: number
  upiPayments: number
  pendingAmount: number
}

export interface CustomerReport {
  customerId: string
  customerName: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

// Form Types
export interface CreateCustomerInput {
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  pincode?: string
}

export interface CreateOrderInput {
  customerId: string
  pickupDate?: string
  deliveryDate?: string
  isExpress: boolean
  notes?: string
  items: CreateOrderItemInput[]
}

export interface CreateOrderItemInput {
  itemType: string
  serviceType: string
  quantity: number
  unitPrice: number
}

export interface CreatePaymentInput {
  orderId: string
  amount: number
  paymentMethod: PaymentMethod
  transactionId?: string
  notes?: string
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number
  activeCustomers: number
  todayRevenue: number
  pendingOrders: number
  processingOrders: number
  readyOrders: number
}
