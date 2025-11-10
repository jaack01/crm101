// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;
mod models;

use db::Database;
use std::sync::Arc;

fn main() {
    // Initialize database
    let db = match Database::new() {
        Ok(database) => {
            println!("Database initialized successfully");
            Arc::new(database)
        }
        Err(e) => {
            eprintln!("Failed to initialize database: {}", e);
            std::process::exit(1);
        }
    };

    // Initialize schema
    if let Err(e) = db.init_schema() {
        eprintln!("Failed to initialize database schema: {}", e);
        std::process::exit(1);
    }

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            // Database
            commands::database::initialize_database,
            commands::database::backup_database,
            commands::database::restore_database,
            // Customers
            commands::customers::get_customers,
            commands::customers::get_customer_by_id,
            commands::customers::create_customer,
            commands::customers::update_customer,
            commands::customers::delete_customer,
            // Orders
            commands::orders::get_orders,
            commands::orders::get_order_by_id,
            commands::orders::get_orders_by_customer,
            commands::orders::create_order,
            commands::orders::update_order_status,
            commands::orders::delete_order,
            // Payments
            commands::payments::get_payments_by_order,
            commands::payments::create_payment,
            commands::payments::delete_payment,
            // Inventory
            commands::inventory::get_inventory_items,
            commands::inventory::create_inventory_item,
            commands::inventory::update_inventory_item,
            commands::inventory::delete_inventory_item,
            commands::inventory::get_low_stock_items,
            // Services
            commands::services::get_services,
            commands::services::create_service,
            commands::services::update_service,
            commands::services::delete_service,
            // Staff
            commands::staff::get_staff,
            commands::staff::create_staff,
            commands::staff::update_staff,
            commands::staff::delete_staff,
            // Settings
            commands::settings::get_setting,
            commands::settings::set_setting,
            commands::settings::get_all_settings,
            // Dashboard
            commands::dashboard::get_dashboard_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
