use crate::db::Database;
use crate::models::Staff;
use rusqlite::params;
use serde_json::Value;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_staff(db: State<Arc<Database>>) -> Result<Vec<Staff>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM staff ORDER BY name")
        .map_err(|e| e.to_string())?;

    let staff_members = stmt
        .query_map([], |row| {
            Ok(Staff {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                email: row.get(3)?,
                role: row.get(4)?,
                salary: row.get(5)?,
                commission_rate: row.get(6)?,
                is_active: row.get::<_, i32>(7)? == 1,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(staff_members)
}

#[tauri::command]
pub fn create_staff(db: State<Arc<Database>>, staff: Value) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let staff_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO staff (id, name, phone, email, role, salary, commission_rate, is_active)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            staff_id,
            staff["name"].as_str().unwrap_or(""),
            staff["phone"].as_str().unwrap_or(""),
            staff["email"].as_str(),
            staff["role"].as_str().unwrap_or("staff"),
            staff["salary"].as_f64(),
            staff["commissionRate"].as_f64().unwrap_or(0.0),
            if staff["isActive"].as_bool().unwrap_or(true) { 1 } else { 0 }
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(staff_id)
}

#[tauri::command]
pub fn update_staff(db: State<Arc<Database>>, id: String, staff: Value) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "UPDATE staff SET name = ?1, phone = ?2, email = ?3, role = ?4, salary = ?5, commission_rate = ?6, is_active = ?7 WHERE id = ?8",
        params![
            staff["name"].as_str().unwrap_or(""),
            staff["phone"].as_str().unwrap_or(""),
            staff["email"].as_str(),
            staff["role"].as_str().unwrap_or("staff"),
            staff["salary"].as_f64(),
            staff["commissionRate"].as_f64().unwrap_or(0.0),
            if staff["isActive"].as_bool().unwrap_or(true) { 1 } else { 0 },
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_staff(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute("DELETE FROM staff WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
