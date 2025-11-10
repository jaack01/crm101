# Quick Start Guide

## Phase 1 Implementation Complete! ✓

The project foundation has been successfully set up with the following:

### What's Been Built

1. **Project Structure**
   - Next.js 14 with TypeScript
   - Tailwind CSS configuration
   - Tauri 1.5 setup with Rust backend
   - Complete folder structure

2. **Database Layer**
   - SQLite database schema
   - All tables created (customers, orders, payments, inventory, services, staff, settings)
   - Database initialization and migration system
   - Indexes for performance optimization

3. **Backend (Rust)**
   - Complete Tauri command handlers for all modules
   - Database operations layer
   - Models and types
   - Error handling

4. **Frontend (Next.js + TypeScript)**
   - Type-safe API wrapper for Tauri commands
   - Utility functions (formatting, validation, etc.)
   - Reusable UI components (Button, Input, Card)
   - Basic routing structure (login, dashboard)
   - Global styles with Tailwind

5. **Configuration**
   - Package.json with all dependencies
   - TypeScript configuration
   - Tailwind configuration
   - Tauri configuration
   - ESLint setup

## Running the Application

### Development Mode

```bash
# Run the Tauri app in development mode
npm run tauri:dev
```

This will:
1. Start the Next.js dev server on http://localhost:3000
2. Launch the Tauri desktop application
3. Initialize the SQLite database with default data

### Frontend Only (for UI development)

```bash
# Run Next.js dev server only
npm run dev
```

### Build for Production

```bash
# Create production build
npm run tauri:build
```

## Default Data

The application comes with:
- **Default Services**: Wash (Shirt, Pants, Dress), Dry Clean (Shirt, Suit), Iron (Shirt, Pants)
- **Default Settings**: Shop name, currency, tax rate, order prefix

## Project Status

### ✓ Completed
- [x] Project setup and initialization
- [x] Database schema design and implementation
- [x] Backend command handlers (all modules)
- [x] Frontend type definitions
- [x] Basic UI components
- [x] Login and dashboard pages

### → Next Steps (Phase 2+)
- [ ] Authentication system implementation
- [ ] Customer management UI
- [ ] Order management UI
- [ ] Payment processing UI
- [ ] Inventory management UI
- [ ] Reports and analytics
- [ ] Settings panel
- [ ] Data backup/restore UI

## File Structure Overview

```
laundry-crm/
├── src/                          # Next.js Frontend
│   ├── app/                      # App router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home/splash page
│   │   ├── login/               # Login page
│   │   └── dashboard/           # Dashboard page
│   ├── components/
│   │   └── ui/                  # Reusable components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   └── lib/
│       ├── types.ts             # TypeScript types
│       ├── utils.ts             # Utility functions
│       └── tauri.ts             # Tauri API wrapper
├── src-tauri/                    # Rust Backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── commands/            # Tauri commands
│   │   │   ├── customers.rs
│   │   │   ├── orders.rs
│   │   │   ├── payments.rs
│   │   │   ├── inventory.rs
│   │   │   ├── services.rs
│   │   │   ├── staff.rs
│   │   │   ├── settings.rs
│   │   │   └── dashboard.rs
│   │   ├── db/                  # Database layer
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs
│   │   │   └── operations.rs
│   │   └── models/              # Data models
│   │       └── mod.rs
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── package.json                  # Node dependencies
└── README.md                     # Main documentation
```

## Database Schema

### Tables Created

1. **customers** - Customer information and loyalty data
2. **orders** - Order management with status tracking
3. **order_items** - Individual items in orders
4. **payments** - Payment transactions
5. **inventory** - Stock and supply management
6. **services** - Service catalog with pricing
7. **staff** - Employee management
8. **settings** - Application configuration

## Available Commands (Tauri)

All commands are fully implemented and ready to use:

### Database
- `initialize_database()`
- `backup_database(path)`
- `restore_database(path)`

### Customers
- `get_customers(search?)`
- `get_customer_by_id(id)`
- `create_customer(customer)`
- `update_customer(id, customer)`
- `delete_customer(id)`

### Orders
- `get_orders(status?)`
- `get_order_by_id(id)`
- `get_orders_by_customer(customerId)`
- `create_order(order)`
- `update_order_status(id, status)`
- `delete_order(id)`

### Payments
- `get_payments_by_order(orderId)`
- `create_payment(payment)`
- `delete_payment(id)`

### Inventory
- `get_inventory_items()`
- `create_inventory_item(item)`
- `update_inventory_item(id, item)`
- `delete_inventory_item(id)`
- `get_low_stock_items()`

### Services
- `get_services()`
- `create_service(service)`
- `update_service(id, service)`
- `delete_service(id)`

### Staff
- `get_staff()`
- `create_staff(staff)`
- `update_staff(id, staff)`
- `delete_staff(id)`

### Settings
- `get_setting(key)`
- `set_setting(key, value)`
- `get_all_settings()`

### Dashboard
- `get_dashboard_stats()`

## Tips for Development

1. **Hot Reload**: Both frontend and backend support hot reload in dev mode
2. **Database Location**: In dev mode, the database is created as `laundry_crm.db` in the project root
3. **Debugging**: Use browser DevTools for frontend, `println!` in Rust gets logged to the Tauri console
4. **Type Safety**: All API calls are type-safe thanks to TypeScript definitions

## Next Phase Preview

**Phase 2** will focus on building out the UI for:
- Complete authentication flow
- Customer management (CRUD operations)
- Order creation and tracking
- Payment processing

Each module will have a full-featured UI with forms, tables, search, and filters.

## Need Help?

- Check the README.md for full documentation
- Review the code comments in key files
- The project follows industry best practices and patterns

---

**Status**: Phase 1 Complete - Ready for Phase 2 Development
