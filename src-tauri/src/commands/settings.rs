use crate::db::Database;
use crate::models::Settings;
use rusqlite::params;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_setting(db: State<Arc<Database>>, key: String) -> Result<Option<String>, String> {
    let conn = db.conn.lock().unwrap();

    let result = conn
        .query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn set_setting(db: State<Arc<Database>>, key: String, value: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, CURRENT_TIMESTAMP)",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_all_settings(db: State<Arc<Database>>) -> Result<Vec<Settings>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM settings")
        .map_err(|e| e.to_string())?;

    let settings = stmt
        .query_map([], |row| {
            Ok(Settings {
                key: row.get(0)?,
                value: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(settings)
}
