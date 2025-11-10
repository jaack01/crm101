use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::AppHandle;

pub mod schema;
pub mod operations;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self> {
        // Use app data directory for database in production
        let db_path = Self::get_db_path();

        println!("Opening database at: {}", db_path);

        let conn = Connection::open(&db_path)?;

        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    fn get_db_path() -> String {
        // In production, use the app data directory
        // For development, use a local file
        if cfg!(debug_assertions) {
            "./laundry_crm.db".to_string()
        } else {
            // TODO: Use proper app data directory
            "./laundry_crm.db".to_string()
        }
    }

    pub fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // Create all tables
        schema::create_customers_table(&conn)?;
        schema::create_orders_table(&conn)?;
        schema::create_order_items_table(&conn)?;
        schema::create_payments_table(&conn)?;
        schema::create_inventory_table(&conn)?;
        schema::create_services_table(&conn)?;
        schema::create_staff_table(&conn)?;
        schema::create_settings_table(&conn)?;

        // Insert default data
        schema::insert_default_services(&conn)?;
        schema::insert_default_settings(&conn)?;

        println!("Database schema initialized successfully");

        Ok(())
    }

    pub fn backup(&self, backup_path: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let backup_conn = Connection::open(backup_path)?;

        conn.backup(rusqlite::DatabaseName::Main, &backup_conn, None)?;

        Ok(())
    }
}
