use crate::db::Database;
use crate::models::{CreateOrderInput, Order, OrderItem};
use rusqlite::params;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_orders(db: State<Arc<Database>>, status: Option<String>) -> Result<Vec<Order>, String> {
    let conn = db.conn.lock().unwrap();

    let query = if let Some(status_filter) = status {
        format!(
            "SELECT o.*, c.name as customer_name FROM orders o
             LEFT JOIN customers c ON o.customer_id = c.id
             WHERE o.status = '{}' ORDER BY o.order_date DESC",
            status_filter
        )
    } else {
        "SELECT o.*, c.name as customer_name FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         ORDER BY o.order_date DESC"
            .to_string()
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    let orders = stmt
        .query_map([], |row| {
            let order_id: String = row.get(0)?;
            let customer_name: Option<String> = row.get(12).ok();

            Ok(Order {
                id: order_id.clone(),
                order_number: row.get(1)?,
                customer_id: row.get(2)?,
                customer_name,
                order_date: row.get(3)?,
                pickup_date: row.get(4)?,
                delivery_date: row.get(5)?,
                status: row.get(6)?,
                total_amount: row.get(7)?,
                paid_amount: row.get(8)?,
                is_express: row.get::<_, i32>(9)? == 1,
                notes: row.get(10)?,
                items: vec![], // Will be filled separately
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get items for each order
    let mut orders_with_items = Vec::new();
    for mut order in orders {
        order.items = get_order_items_internal(&conn, &order.id)?;
        orders_with_items.push(order);
    }

    Ok(orders_with_items)
}

#[tauri::command]
pub fn get_order_by_id(db: State<Arc<Database>>, id: String) -> Result<Order, String> {
    let conn = db.conn.lock().unwrap();

    let mut order = conn
        .query_row(
            "SELECT o.*, c.name as customer_name FROM orders o
             LEFT JOIN customers c ON o.customer_id = c.id
             WHERE o.id = ?1",
            params![id],
            |row| {
                let customer_name: Option<String> = row.get(12).ok();

                Ok(Order {
                    id: row.get(0)?,
                    order_number: row.get(1)?,
                    customer_id: row.get(2)?,
                    customer_name,
                    order_date: row.get(3)?,
                    pickup_date: row.get(4)?,
                    delivery_date: row.get(5)?,
                    status: row.get(6)?,
                    total_amount: row.get(7)?,
                    paid_amount: row.get(8)?,
                    is_express: row.get::<_, i32>(9)? == 1,
                    notes: row.get(10)?,
                    items: vec![],
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    order.items = get_order_items_internal(&conn, &id)?;

    Ok(order)
}

#[tauri::command]
pub fn get_orders_by_customer(
    db: State<Arc<Database>>,
    customer_id: String,
) -> Result<Vec<Order>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare(
            "SELECT * FROM orders WHERE customer_id = ?1 ORDER BY order_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let orders = stmt
        .query_map(params![customer_id], |row| {
            Ok(Order {
                id: row.get(0)?,
                order_number: row.get(1)?,
                customer_id: row.get(2)?,
                customer_name: None,
                order_date: row.get(3)?,
                pickup_date: row.get(4)?,
                delivery_date: row.get(5)?,
                status: row.get(6)?,
                total_amount: row.get(7)?,
                paid_amount: row.get(8)?,
                is_express: row.get::<_, i32>(9)? == 1,
                notes: row.get(10)?,
                items: vec![],
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get items for each order
    let mut orders_with_items = Vec::new();
    for mut order in orders {
        order.items = get_order_items_internal(&conn, &order.id)?;
        orders_with_items.push(order);
    }

    Ok(orders_with_items)
}

#[tauri::command]
pub fn create_order(db: State<Arc<Database>>, order: CreateOrderInput) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let order_id = Uuid::new_v4().to_string();
    let order_number = format!("ORD-{}", chrono::Utc::now().timestamp());

    // Calculate total amount
    let total_amount: f64 = order
        .items
        .iter()
        .map(|item| item.quantity as f64 * item.unit_price)
        .sum();

    conn.execute(
        "INSERT INTO orders (id, order_number, customer_id, pickup_date, delivery_date, is_express, notes, total_amount, paid_amount)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            order_id,
            order_number,
            order.customer_id,
            order.pickup_date,
            order.delivery_date,
            if order.is_express { 1 } else { 0 },
            order.notes,
            total_amount,
            0.0
        ],
    )
    .map_err(|e| e.to_string())?;

    // Insert order items
    for item in order.items {
        let item_id = Uuid::new_v4().to_string();
        let total_price = item.quantity as f64 * item.unit_price;

        conn.execute(
            "INSERT INTO order_items (id, order_id, item_type, service_type, quantity, unit_price, total_price)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                item_id,
                order_id,
                item.item_type,
                item.service_type,
                item.quantity,
                item.unit_price,
                total_price
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(order_id)
}

#[tauri::command]
pub fn update_order_status(
    db: State<Arc<Database>>,
    id: String,
    status: String,
) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "UPDATE orders SET status = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![status, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_order(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute("DELETE FROM orders WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Helper function to get order items
fn get_order_items_internal(
    conn: &rusqlite::Connection,
    order_id: &str,
) -> Result<Vec<OrderItem>, String> {
    let mut stmt = conn
        .prepare("SELECT * FROM order_items WHERE order_id = ?1")
        .map_err(|e| e.to_string())?;

    let items = stmt
        .query_map(params![order_id], |row| {
            Ok(OrderItem {
                id: row.get(0)?,
                order_id: row.get(1)?,
                item_type: row.get(2)?,
                service_type: row.get(3)?,
                quantity: row.get(4)?,
                unit_price: row.get(5)?,
                total_price: row.get(6)?,
                barcode: row.get(7)?,
                status: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(items)
}
