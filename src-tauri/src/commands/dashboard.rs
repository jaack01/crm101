use crate::db::Database;
use crate::models::DashboardStats;
use rusqlite::params;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_dashboard_stats(db: State<Arc<Database>>) -> Result<DashboardStats, String> {
    let conn = db.conn.lock().unwrap();

    // Get total orders
    let total_orders: i32 = conn
        .query_row("SELECT COUNT(*) FROM orders", [], |row| row.get(0))
        .unwrap_or(0);

    // Get active customers (customers with at least one order)
    let active_customers: i32 = conn
        .query_row(
            "SELECT COUNT(DISTINCT customer_id) FROM orders",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Get today's revenue
    let today_revenue: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(paid_amount), 0) FROM orders WHERE DATE(order_date) = DATE('now')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0.0);

    // Get pending orders
    let pending_orders: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM orders WHERE status = 'received'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Get processing orders
    let processing_orders: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM orders WHERE status = 'processing'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Get ready orders
    let ready_orders: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM orders WHERE status = 'ready'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(DashboardStats {
        total_orders,
        active_customers,
        today_revenue,
        pending_orders,
        processing_orders,
        ready_orders,
    })
}
