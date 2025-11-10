use crate::db::Database;
use crate::models::{Customer, CreateCustomerInput};
use rusqlite::params;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_customers(
    db: State<Arc<Database>>,
    search: Option<String>,
) -> Result<Vec<Customer>, String> {
    let conn = db.conn.lock().unwrap();

    let query = if let Some(search_term) = search {
        format!(
            "SELECT * FROM customers WHERE name LIKE '%{}%' OR phone LIKE '%{}%' ORDER BY created_at DESC",
            search_term, search_term
        )
    } else {
        "SELECT * FROM customers ORDER BY created_at DESC".to_string()
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    let customers = stmt
        .query_map([], |row| {
            Ok(Customer {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                email: row.get(3)?,
                address: row.get(4)?,
                city: row.get(5)?,
                pincode: row.get(6)?,
                loyalty_points: row.get(7)?,
                membership_tier: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(customers)
}

#[tauri::command]
pub fn get_customer_by_id(db: State<Arc<Database>>, id: String) -> Result<Customer, String> {
    let conn = db.conn.lock().unwrap();

    let customer = conn
        .query_row(
            "SELECT * FROM customers WHERE id = ?1",
            params![id],
            |row| {
                Ok(Customer {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    phone: row.get(2)?,
                    email: row.get(3)?,
                    address: row.get(4)?,
                    city: row.get(5)?,
                    pincode: row.get(6)?,
                    loyalty_points: row.get(7)?,
                    membership_tier: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(customer)
}

#[tauri::command]
pub fn create_customer(
    db: State<Arc<Database>>,
    customer: CreateCustomerInput,
) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO customers (id, name, phone, email, address, city, pincode) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            id,
            customer.name,
            customer.phone,
            customer.email,
            customer.address,
            customer.city,
            customer.pincode
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub fn update_customer(
    db: State<Arc<Database>>,
    id: String,
    customer: CreateCustomerInput,
) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "UPDATE customers SET name = ?1, phone = ?2, email = ?3, address = ?4, city = ?5, pincode = ?6, updated_at = CURRENT_TIMESTAMP WHERE id = ?7",
        params![
            customer.name,
            customer.phone,
            customer.email,
            customer.address,
            customer.city,
            customer.pincode,
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_customer(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute("DELETE FROM customers WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
