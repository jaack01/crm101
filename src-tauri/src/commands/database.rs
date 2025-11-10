use crate::db::Database;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn initialize_database(db: State<Arc<Database>>) -> Result<(), String> {
    db.init_schema().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn backup_database(db: State<Arc<Database>>, path: String) -> Result<(), String> {
    db.backup(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_database(_db: State<Arc<Database>>, _path: String) -> Result<(), String> {
    // TODO: Implement database restore
    Err("Not implemented yet".to_string())
}
