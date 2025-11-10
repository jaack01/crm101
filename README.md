# Laundry CRM - Professional Laundry Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tauri](https://img.shields.io/badge/Tauri-1.5-orange)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)

A comprehensive, production-grade Customer Relationship Management (CRM) system designed specifically for laundry businesses. Built with modern technologies for optimal performance and user experience.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Technology Stack](#technology-stack) • [Documentation](#documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Laundry CRM is a full-featured desktop application that helps laundry businesses manage their daily operations efficiently. From customer management to order processing, inventory tracking, and business analytics, this application provides all the tools needed to run a successful laundry business.

### Key Highlights

- 🖥️ **Desktop Application**: Cross-platform desktop app built with Tauri
- 📊 **Comprehensive Dashboard**: Real-time business metrics and insights
- 👥 **Customer Management**: Track customer details, loyalty points, and membership tiers
- 📦 **Order Processing**: Complete order lifecycle management with status tracking
- 💰 **Payment Management**: Multiple payment methods with partial payment support
- 📈 **Inventory Tracking**: Stock management with low stock alerts
- 📊 **Business Analytics**: Revenue trends, customer insights, and service popularity
- ⚙️ **Customizable Settings**: Configure shop details, services, and pricing
- 💾 **Data Backup**: Built-in database backup and restore functionality
- 🔒 **Secure**: Role-based access control (Admin, Manager, Staff)

---

## ✨ Features

### Customer Management
- ✅ Complete CRUD operations for customers
- ✅ Customer search and filtering
- ✅ Loyalty points system
- ✅ Membership tiers (Standard, Silver, Gold, Platinum)
- ✅ Customer order history
- ✅ Contact information management
- ✅ Address and notes tracking

### Order Management
- ✅ Multi-step order creation wizard
- ✅ Dynamic item and service selection
- ✅ Order status tracking (Received → Processing → Ready → Delivered)
- ✅ Pickup and delivery date scheduling
- ✅ Order search and filtering
- ✅ Order number generation
- ✅ Itemized order details
- ✅ Customer-linked orders

### Payment Processing
- ✅ Multiple payment methods (Cash, Card, UPI, Bank Transfer)
- ✅ Partial payment support
- ✅ Payment history tracking
- ✅ Outstanding amount calculation
- ✅ Payment notes and references
- ✅ Real-time payment updates

### Inventory Management
- ✅ Complete inventory tracking system
- ✅ Low stock alerts with visual indicators
- ✅ Stock status monitoring (In Stock, Low Stock, Out of Stock)
- ✅ Category-based organization
- ✅ Supplier management
- ✅ Cost tracking per item
- ✅ Unit-based measurements
- ✅ Minimum stock level configuration

### Reports & Analytics
- ✅ Revenue trend visualization (7-day chart)
- ✅ Key business metrics (Total Revenue, Orders, Avg Order Value)
- ✅ Top 10 customers by spending
- ✅ Service popularity analysis
- ✅ Order status breakdown
- ✅ Payment collection tracking
- ✅ Custom date range filtering
- ✅ CSV data export

### Settings & Configuration
- ✅ Shop profile management
- ✅ Service catalog with CRUD operations
- ✅ Dynamic pricing management
- ✅ Currency configuration (INR default)
- ✅ Tax rate settings
- ✅ Order number prefix customization
- ✅ Database backup functionality
- ✅ Active/Inactive service status

### User Interface
- ✅ Modern, responsive design
- ✅ Mobile-friendly layouts
- ✅ Dark mode ready
- ✅ Toast notifications
- ✅ Loading states and skeletons
- ✅ Error boundaries
- ✅ Confirmation dialogs
- ✅ Search and filter capabilities

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

### Backend
- **Framework**: Tauri 1.5
- **Language**: Rust
- **Database**: SQLite (rusqlite with bundled feature)
- **Serialization**: Serde

### Development Tools
- **Language**: TypeScript
- **Build Tool**: Tauri CLI
- **Package Manager**: npm
- **CSS Processing**: PostCSS + Autoprefixer
- **Linting**: ESLint

---

## 📦 Prerequisites

Before installing, ensure you have the following:

### Required

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Rust**: Latest stable version ([Install](https://www.rust-lang.org/tools/install))

### Platform-Specific Requirements

#### Windows
- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

#### macOS
- Xcode Command Line Tools
- Install: `xcode-select --install`

#### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/laundry-crm.git
cd laundry-crm
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required Node.js packages and Rust dependencies.

### 3. Initialize Database

The database will be automatically created on first run with default data including:
- Demo users (admin/admin, manager/manager, staff/staff)
- Sample services
- Default settings

---

## 💻 Development

### Start Development Server

```bash
npm run tauri:dev
```

This will:
1. Start the Next.js development server on http://localhost:3000
2. Launch the Tauri development window
3. Enable hot-reload for both frontend and backend changes

### Development Tools

- **Next.js Dev Server**: http://localhost:3000 (web preview)
- **Tauri Dev Window**: Desktop application window
- **Rust Console**: Backend logs and database operations

### Project Scripts

```bash
# Frontend development
npm run dev          # Start Next.js dev server only

# Tauri development
npm run tauri:dev    # Start Tauri with Next.js

# Build commands
npm run build        # Build Next.js static export
npm run tauri:build  # Build production Tauri app

# Code quality
npm run lint         # Run ESLint
```

---

## 🏗️ Building for Production

### 1. Build the Application

```bash
npm run tauri:build
```

This will:
1. Build the Next.js frontend (static export)
2. Compile the Rust backend
3. Bundle everything into platform-specific installers

### 2. Build Artifacts

After successful build, installers will be located in:

```
src-tauri/target/release/bundle/
```

#### Windows
- `laundry-crm_1.0.0_x64.msi` - MSI installer
- `laundry-crm_1.0.0_x64-setup.exe` - Setup executable

#### macOS
- `laundry-crm_1.0.0_x64.dmg` - DMG installer
- `laundry-crm.app` - Application bundle

#### Linux
- `laundry-crm_1.0.0_amd64.deb` - Debian package
- `laundry-crm_1.0.0_amd64.AppImage` - AppImage

### 3. Distribution

Distribute the appropriate installer for each platform to end users.

---

## 📁 Project Structure

```
laundry-crm/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx             # Login page
│   │   ├── dashboard/           # Dashboard page
│   │   ├── customers/           # Customer management
│   │   ├── orders/              # Order management
│   │   ├── inventory/           # Inventory management
│   │   ├── reports/             # Reports & analytics
│   │   ├── settings/            # Settings & configuration
│   │   └── layout.tsx           # Root layout
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # UI components (Button, Input, Card)
│   │   ├── Layout.tsx           # Main app layout with sidebar
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── ErrorBoundary.tsx   # Error handling component
│   │   ├── Loading.tsx          # Loading states
│   │   └── FormField.tsx        # Form input components
│   ├── lib/                     # Utility functions and types
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── utils.ts            # Helper functions
│   │   ├── tauri.ts            # Tauri API wrapper
│   │   └── validations.ts      # Zod validation schemas
│   ├── stores/                  # Zustand state stores
│   │   └── authStore.ts        # Authentication state
│   └── hooks/                   # Custom React hooks
│       └── useForm.ts           # Form handling hook
├── src-tauri/                   # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs             # Entry point
│   │   ├── db/                 # Database module
│   │   │   ├── mod.rs          # Database initialization
│   │   │   └── schema.rs       # SQLite schema
│   │   └── commands/           # Tauri commands (API endpoints)
│   │       ├── customers.rs    # Customer operations
│   │       ├── orders.rs       # Order operations
│   │       ├── payments.rs     # Payment operations
│   │       ├── inventory.rs    # Inventory operations
│   │       ├── services.rs     # Service operations
│   │       ├── settings.rs     # Settings operations
│   │       └── dashboard.rs    # Dashboard statistics
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── public/                      # Static assets
├── out/                         # Next.js build output
├── package.json                 # Node.js dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 📖 Usage Guide

### First Time Setup

1. **Launch the Application**
   - Run the installed application from your applications folder

2. **Login**
   - Default accounts:
     - Admin: `admin` / `admin`
     - Manager: `manager` / `manager`
     - Staff: `staff` / `staff`

3. **Configure Shop Settings**
   - Navigate to Settings → Shop Details
   - Update shop name, contact information
   - Set currency and tax rate
   - Configure order prefix

4. **Add Services**
   - Go to Settings → Services & Pricing
   - Add your laundry services and prices
   - Set active/inactive status

### Daily Operations

#### Adding a Customer

1. Navigate to **Customers** page
2. Click **"Add Customer"**
3. Fill in customer details:
   - Name (required)
   - Phone (required)
   - Email, address (optional)
   - Membership tier
4. Click **"Add Customer"**

#### Creating an Order

1. Navigate to **Orders** page
2. Click **"Create Order"**
3. Select or search for customer
4. Add order items:
   - Select item type
   - Select service
   - Set quantity
   - Price auto-fills
5. Set pickup and delivery dates
6. Add notes if needed
7. Click **"Create Order"**

#### Recording Payments

1. Go to order details page
2. Click **"Add Payment"** in payments section
3. Enter payment amount
4. Select payment method
5. Add notes (optional)
6. Click **"Record Payment"**

#### Managing Inventory

1. Navigate to **Inventory** page
2. Click **"Add Item"** for new items
3. Fill in:
   - Item name, category
   - Quantity and unit
   - Minimum stock level
   - Cost per unit
   - Supplier information
4. Monitor low stock alerts at top of page
5. Edit or delete items as needed

#### Viewing Reports

1. Navigate to **Reports** page
2. Select date range for analysis
3. Review:
   - Revenue trends
   - Top customers
   - Popular services
   - Payment collection rates
4. Click **"Export CSV"** to download data

#### Backup Database

1. Go to **Settings** → **Backup & Data** tab
2. Click **"Backup Database"**
3. File saved as `backup-YYYY-MM-DD.db`
4. Store backup in safe location

---

## ⚙️ Configuration

### Environment Variables

The application uses no environment variables by default. All configuration is done through the Settings page in the UI.

### Database Location

- **Windows**: `%APPDATA%\com.laundry.crm\laundry.db`
- **macOS**: `~/Library/Application Support/com.laundry.crm/laundry.db`
- **Linux**: `~/.local/share/com.laundry.crm/laundry.db`

### Customization

#### Changing Currency

1. Go to Settings → Shop Details
2. Change currency field (e.g., USD, EUR, GBP)
3. Save settings

#### Modifying Services

1. Go to Settings → Services & Pricing
2. Edit existing services or add new ones
3. Update prices as needed

#### Adjusting Tax Rate

1. Go to Settings → Shop Details
2. Set tax rate percentage
3. Tax will be included in calculations

---

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start

**Problem**: Application fails to launch
**Solution**:
- Verify all prerequisites are installed
- Check if antivirus is blocking the app
- Run as administrator (Windows)
- Check console for error messages

#### Database Errors

**Problem**: "Database not found" or connection errors
**Solution**:
- Delete the database file (will recreate with defaults)
- Check file permissions
- Ensure disk space is available

#### Build Failures

**Problem**: Build command fails
**Solution**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Rust cache: `cd src-tauri && cargo clean`
- Update dependencies: `npm update`
- Check Rust toolchain: `rustup update`

#### Performance Issues

**Problem**: Application running slow
**Solution**:
- Check database size
- Perform database backup and restore
- Clear browser cache if using dev server
- Restart application

### Getting Help

For additional support:
1. Check existing GitHub issues
2. Create a new issue with:
   - Operating system and version
   - Application version
   - Steps to reproduce
   - Error messages or screenshots

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript and Rust best practices
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed
- Follow existing code style

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing desktop framework
- **Next.js Team** - For the excellent React framework
- **Rust Community** - For the powerful backend language
- **Open Source Community** - For all the amazing libraries used

---

## 📞 Support

For support, please:
- 📧 Email: support@laundrycrm.example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/laundry-crm/issues)
- 📖 Docs: [Full Documentation](https://docs.laundrycrm.example.com)

---

<div align="center">

**Built with ❤️ for laundry businesses worldwide**

[⬆ Back to Top](#laundry-crm---professional-laundry-management-system)

</div>
