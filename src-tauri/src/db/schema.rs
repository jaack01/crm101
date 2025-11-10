use rusqlite::{Connection, Result};

pub fn create_customers_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            email TEXT,
            address TEXT,
            city TEXT,
            pincode TEXT,
            loyalty_points INTEGER DEFAULT 0,
            membership_tier TEXT DEFAULT 'standard',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create indexes
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)",
        [],
    )?;

    Ok(())
}

pub fn create_orders_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            order_number TEXT UNIQUE NOT NULL,
            customer_id TEXT NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            pickup_date DATETIME,
            delivery_date DATETIME,
            status TEXT DEFAULT 'received',
            total_amount REAL DEFAULT 0,
            paid_amount REAL DEFAULT 0,
            is_express INTEGER DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )",
        [],
    )?;

    // Create indexes
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)",
        [],
    )?;

    Ok(())
}

pub fn create_order_items_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS order_items (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            service_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            barcode TEXT UNIQUE,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)",
        [],
    )?;

    Ok(())
}

pub fn create_payments_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            transaction_id TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id)",
        [],
    )?;

    Ok(())
}

pub fn create_inventory_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            min_stock_level REAL,
            supplier_name TEXT,
            supplier_contact TEXT,
            last_purchase_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(())
}

pub fn create_services_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS services (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            base_price REAL NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(())
}

pub fn create_staff_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            role TEXT NOT NULL,
            salary REAL,
            commission_rate REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(())
}

pub fn create_settings_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(())
}

pub fn insert_default_services(conn: &Connection) -> Result<()> {
    // Check if services already exist
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM services",
        [],
        |row| row.get(0),
    )?;

    if count > 0 {
        return Ok(());
    }

    // Insert default services
    let services = vec![
        ("wash-shirt", "Wash", "Shirt", 30.0),
        ("wash-pants", "Wash", "Pants", 40.0),
        ("wash-dress", "Wash", "Dress", 50.0),
        ("dryclean-shirt", "Dry Clean", "Shirt", 80.0),
        ("dryclean-suit", "Dry Clean", "Suit", 200.0),
        ("iron-shirt", "Iron", "Shirt", 15.0),
        ("iron-pants", "Iron", "Pants", 20.0),
    ];

    for (id, category, name, price) in services {
        conn.execute(
            "INSERT INTO services (id, name, category, base_price) VALUES (?1, ?2, ?3, ?4)",
            [id, name, category, &price.to_string()],
        )?;
    }

    println!("Default services inserted");

    Ok(())
}

pub fn insert_default_settings(conn: &Connection) -> Result<()> {
    // Check if settings already exist
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM settings",
        [],
        |row| row.get(0),
    )?;

    if count > 0 {
        return Ok(());
    }

    // Insert default settings
    let settings = vec![
        ("shop_name", "Laundry Shop"),
        ("shop_phone", ""),
        ("shop_email", ""),
        ("shop_address", ""),
        ("currency", "USD"),
        ("tax_rate", "0"),
        ("order_prefix", "ORD"),
    ];

    for (key, value) in settings {
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)",
            [key, value],
        )?;
    }

    println!("Default settings inserted");

    Ok(())
}
