use crate::db::Database;
use crate::models::{CreatePaymentInput, Payment};
use rusqlite::params;
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_payments_by_order(
    db: State<Arc<Database>>,
    order_id: String,
) -> Result<Vec<Payment>, String> {
    let conn = db.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT * FROM payments WHERE order_id = ?1 ORDER BY payment_date DESC")
        .map_err(|e| e.to_string())?;

    let payments = stmt
        .query_map(params![order_id], |row| {
            Ok(Payment {
                id: row.get(0)?,
                order_id: row.get(1)?,
                amount: row.get(2)?,
                payment_method: row.get(3)?,
                payment_date: row.get(4)?,
                transaction_id: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(payments)
}

#[tauri::command]
pub fn create_payment(
    db: State<Arc<Database>>,
    payment: CreatePaymentInput,
) -> Result<String, String> {
    let conn = db.conn.lock().unwrap();
    let payment_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO payments (id, order_id, amount, payment_method, transaction_id, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            payment_id,
            payment.order_id,
            payment.amount,
            payment.payment_method,
            payment.transaction_id,
            payment.notes
        ],
    )
    .map_err(|e| e.to_string())?;

    // Update order paid_amount
    conn.execute(
        "UPDATE orders SET paid_amount = paid_amount + ?1 WHERE id = ?2",
        params![payment.amount, payment.order_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(payment_id)
}

#[tauri::command]
pub fn delete_payment(db: State<Arc<Database>>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();

    // Get payment details before deleting
    let (order_id, amount): (String, f64) = conn
        .query_row(
            "SELECT order_id, amount FROM payments WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Delete payment
    conn.execute("DELETE FROM payments WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    // Update order paid_amount
    conn.execute(
        "UPDATE orders SET paid_amount = paid_amount - ?1 WHERE id = ?2",
        params![amount, order_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
