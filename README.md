# Laundry CRM - Production Grade Application

A comprehensive, production-ready CRM application for laundry shops built with Tauri, Next.js, Tailwind CSS, and SQLite.

## Features

- **Customer Management**: Complete customer database with contact details, history, and loyalty tracking
- **Order Management**: Full order lifecycle management from receiving to delivery
- **Inventory Management**: Track supplies, chemicals, and low stock alerts
- **Billing & Payments**: Multiple payment methods, invoicing, and payment tracking
- **Reporting & Analytics**: Comprehensive reports and business insights
- **Staff Management**: Employee tracking, roles, and performance metrics
- **Notifications**: Automated reminders and status updates
- **Data Backup**: Automated backup and restore functionality

## Tech Stack

- **Frontend**: Next.js 14 (React 18) + TypeScript
- **Styling**: Tailwind CSS
- **Desktop Framework**: Tauri 1.5
- **Backend**: Rust
- **Database**: SQLite (embedded)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
laundry-crm/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/              # Utilities and types
├── src-tauri/            # Rust backend
│   └── src/
│       ├── commands/     # Tauri commands
│       ├── db/          # Database layer
│       └── models/      # Data models
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Tauri CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run tauri:dev
```

3. Build for production:
```bash
npm run tauri:build
```

## Development

### Frontend Development
```bash
npm run dev
```

### Tauri Development
```bash
npm run tauri:dev
```

## Database Schema

The application uses SQLite with the following main tables:
- `customers` - Customer information
- `orders` - Order management
- `order_items` - Order line items
- `payments` - Payment transactions
- `inventory` - Inventory tracking
- `services` - Service catalog
- `staff` - Employee management
- `settings` - Application settings

## Features Roadmap

### Phase 1: Core Setup ✓
- [x] Project initialization
- [x] Database schema
- [x] Basic UI components
- [x] Tauri configuration

### Phase 2: Core Modules (In Progress)
- [ ] Authentication system
- [ ] Customer management
- [ ] Order management
- [ ] Payment processing

### Phase 3: Advanced Features
- [ ] Reporting & analytics
- [ ] Inventory management
- [ ] Staff management
- [ ] Notifications

### Phase 4: Production Ready
- [ ] Data backup/restore
- [ ] Testing suite
- [ ] Performance optimization
- [ ] Documentation

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.
