import { z } from 'zod'

// Customer validation schemas
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  city: z.string().max(100, 'City name is too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

export type CustomerFormData = z.infer<typeof customerSchema>

// Order validation schemas
export const orderItemSchema = z.object({
  itemType: z.string().min(1, 'Item type is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Quantity is too large'),
  unitPrice: z.number().min(0, 'Price cannot be negative'),
})

export const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  pickupDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderItemFormData = z.infer<typeof orderItemSchema>

// Payment validation schemas
export const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'other']),
  notes: z.string().max(500, 'Notes are too long').optional().or(z.literal('')),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

// Inventory validation schemas
export const inventorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category name is too long'),
  quantity: z.number().min(0, 'Quantity cannot be negative').max(999999, 'Quantity is too large'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit name is too long'),
  minStockLevel: z.number().min(0, 'Min stock level cannot be negative').optional(),
  cost: z.number().min(0, 'Cost cannot be negative').optional(),
  supplier: z.string().max(100, 'Supplier name is too long').optional().or(z.literal('')),
  supplierContact: z.string().max(50, 'Supplier contact is too long').optional().or(z.literal('')),
})

export type InventoryFormData = z.infer<typeof inventorySchema>

// Service validation schemas
export const serviceSchema = z.object({
  serviceType: z.string().min(2, 'Service type must be at least 2 characters').max(50, 'Service type is too long'),
  itemType: z.string().min(2, 'Item type must be at least 2 characters').max(50, 'Item type is too long'),
  price: z.number().min(0, 'Price cannot be negative').max(999999, 'Price is too large'),
  isActive: z.boolean(),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

// Settings validation schemas
export const shopSettingsSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(100, 'Shop name is too long'),
  shopPhone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
  shopEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  shopAddress: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., INR, USD)'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  orderPrefix: z.string().min(1, 'Order prefix is required').max(10, 'Order prefix is too long'),
})

export type ShopSettingsFormData = z.infer<typeof shopSettingsSchema>

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username is too long'),
  password: z.string().min(3, 'Password must be at least 3 characters').max(100, 'Password is too long'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Helper function to format Zod errors
export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })
  return errors
}
