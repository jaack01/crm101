use crate::db::Database;
use crate::models::InventoryItem;
use rusqlite::params;
use serde_json::Value;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_inventory_items(db: State<Arc<Database>>) -> Result<Vec<InventoryItem>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM inventory ORDER BY name")
        .map_err(|e| e.to_string())?;

    let items = stmt
        .query_map([], |row| {
            Ok(InventoryItem {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                quantity: row.get(3)?,
                unit: row.get(4)?,
                min_stock_level: row.get(5)?,
                supplier_name: row.get(6)?,
                supplier_contact: row.get(7)?,
                last_purchase_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(items)
}

#[tauri::command]
pub fn create_inventory_item(db: State<Arc<Database>>, item: Value) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let item_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO inventory (id, name, category, quantity, unit, min_stock_level, supplier_name, supplier_contact)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            item_id,
            item["name"].as_str().unwrap_or(""),
            item["category"].as_str().unwrap_or(""),
            item["quantity"].as_f64().unwrap_or(0.0),
            item["unit"].as_str().unwrap_or(""),
            item["minStockLevel"].as_f64(),
            item["supplierName"].as_str(),
            item["supplierContact"].as_str(),
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(item_id)
}

#[tauri::command]
pub fn update_inventory_item(
    db: State<Arc<Database>>,
    id: String,
    item: Value,
) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "UPDATE inventory SET name = ?1, category = ?2, quantity = ?3, unit = ?4,
         min_stock_level = ?5, supplier_name = ?6, supplier_contact = ?7, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?8",
        params![
            item["name"].as_str().unwrap_or(""),
            item["category"].as_str().unwrap_or(""),
            item["quantity"].as_f64().unwrap_or(0.0),
            item["unit"].as_str().unwrap_or(""),
            item["minStockLevel"].as_f64(),
            item["supplierName"].as_str(),
            item["supplierContact"].as_str(),
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_inventory_item(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute("DELETE FROM inventory WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_low_stock_items(db: State<Arc<Database>>) -> Result<Vec<InventoryItem>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM inventory WHERE quantity <= COALESCE(min_stock_level, 0)")
        .map_err(|e| e.to_string())?;

    let items = stmt
        .query_map([], |row| {
            Ok(InventoryItem {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                quantity: row.get(3)?,
                unit: row.get(4)?,
                min_stock_level: row.get(5)?,
                supplier_name: row.get(6)?,
                supplier_contact: row.get(7)?,
                last_purchase_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(items)
}
