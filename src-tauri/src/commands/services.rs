use crate::db::Database;
use crate::models::Service;
use rusqlite::params;
use serde_json::Value;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_services(db: State<Arc<Database>>) -> Result<Vec<Service>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM services ORDER BY category, name")
        .map_err(|e| e.to_string())?;

    let services = stmt
        .query_map([], |row| {
            Ok(Service {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                base_price: row.get(3)?,
                is_active: row.get::<_, i32>(4)? == 1,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(services)
}

#[tauri::command]
pub fn create_service(db: State<Arc<Database>>, service: Value) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let service_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO services (id, name, category, base_price, is_active)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            service_id,
            service["name"].as_str().unwrap_or(""),
            service["category"].as_str().unwrap_or(""),
            service["basePrice"].as_f64().unwrap_or(0.0),
            if service["isActive"].as_bool().unwrap_or(true) { 1 } else { 0 }
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(service_id)
}

#[tauri::command]
pub fn update_service(db: State<Arc<Database>>, id: String, service: Value) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "UPDATE services SET name = ?1, category = ?2, base_price = ?3, is_active = ?4 WHERE id = ?5",
        params![
            service["name"].as_str().unwrap_or(""),
            service["category"].as_str().unwrap_or(""),
            service["basePrice"].as_f64().unwrap_or(0.0),
            if service["isActive"].as_bool().unwrap_or(true) { 1 } else { 0 },
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_service(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute("DELETE FROM services WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
