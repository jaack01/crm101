/**
 * Tauri API wrapper for type-safe communication with Rust backend
 */

import { invoke } from '@tauri-apps/api/tauri'
import type {
  Customer,
  Order,
  Payment,
  InventoryItem,
  Service,
  Staff,
  Settings,
  CreateCustomerInput,
  CreateOrderInput,
  CreatePaymentInput,
  DashboardStats,
} from './types'

// Type-safe invoke wrapper
async function tauriInvoke<T>(command: string, args?: Record<string, any>): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`Tauri command '${command}' failed:`, error)
    throw error
  }
}

// Customer Operations
export const customerApi = {
  getAll: async (search?: string): Promise<Customer[]> => {
    return tauriInvoke<Customer[]>('get_customers', { search })
  },

  getById: async (id: string): Promise<Customer> => {
    return tauriInvoke<Customer>('get_customer_by_id', { id })
  },

  create: async (customer: CreateCustomerInput): Promise<string> => {
    return tauriInvoke<string>('create_customer', { customer })
  },

  update: async (id: string, customer: CreateCustomerInput): Promise<void> => {
    return tauriInvoke<void>('update_customer', { id, customer })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_customer', { id })
  },
}

// Order Operations
export const orderApi = {
  getAll: async (status?: string): Promise<Order[]> => {
    return tauriInvoke<Order[]>('get_orders', { status })
  },

  getById: async (id: string): Promise<Order> => {
    return tauriInvoke<Order>('get_order_by_id', { id })
  },

  getByCustomer: async (customerId: string): Promise<Order[]> => {
    return tauriInvoke<Order[]>('get_orders_by_customer', { customerId })
  },

  create: async (order: CreateOrderInput): Promise<string> => {
    return tauriInvoke<string>('create_order', { order })
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    return tauriInvoke<void>('update_order_status', { id, status })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_order', { id })
  },
}

// Payment Operations
export const paymentApi = {
  getByOrder: async (orderId: string): Promise<Payment[]> => {
    return tauriInvoke<Payment[]>('get_payments_by_order', { orderId })
  },

  create: async (payment: CreatePaymentInput): Promise<string> => {
    return tauriInvoke<string>('create_payment', { payment })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_payment', { id })
  },
}

// Inventory Operations
export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    return tauriInvoke<InventoryItem[]>('get_inventory_items')
  },

  create: async (item: Partial<InventoryItem>): Promise<string> => {
    return tauriInvoke<string>('create_inventory_item', { item })
  },

  update: async (id: string, item: Partial<InventoryItem>): Promise<void> => {
    return tauriInvoke<void>('update_inventory_item', { id, item })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_inventory_item', { id })
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    return tauriInvoke<InventoryItem[]>('get_low_stock_items')
  },
}

// Service Operations
export const serviceApi = {
  getAll: async (): Promise<Service[]> => {
    return tauriInvoke<Service[]>('get_services')
  },

  create: async (service: Partial<Service>): Promise<string> => {
    return tauriInvoke<string>('create_service', { service })
  },

  update: async (id: string, service: Partial<Service>): Promise<void> => {
    return tauriInvoke<void>('update_service', { id, service })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_service', { id })
  },
}

// Staff Operations
export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    return tauriInvoke<Staff[]>('get_staff')
  },

  create: async (staff: Partial<Staff>): Promise<string> => {
    return tauriInvoke<string>('create_staff', { staff })
  },

  update: async (id: string, staff: Partial<Staff>): Promise<void> => {
    return tauriInvoke<void>('update_staff', { id, staff })
  },

  delete: async (id: string): Promise<void> => {
    return tauriInvoke<void>('delete_staff', { id })
  },
}

// Settings Operations
export const settingsApi = {
  get: async (key: string): Promise<string | null> => {
    return tauriInvoke<string | null>('get_setting', { key })
  },

  set: async (key: string, value: string): Promise<void> => {
    return tauriInvoke<void>('set_setting', { key, value })
  },

  getAll: async (): Promise<Settings[]> => {
    return tauriInvoke<Settings[]>('get_all_settings')
  },
}

// Dashboard Operations
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return tauriInvoke<DashboardStats>('get_dashboard_stats')
  },
}

// Database Operations
export const databaseApi = {
  backup: async (path: string): Promise<void> => {
    return tauriInvoke<void>('backup_database', { path })
  },

  restore: async (path: string): Promise<void> => {
    return tauriInvoke<void>('restore_database', { path })
  },

  initialize: async (): Promise<void> => {
    return tauriInvoke<void>('initialize_database')
  },
}
