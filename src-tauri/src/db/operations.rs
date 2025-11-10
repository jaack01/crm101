// This file will contain common database operations
// For now, it's a placeholder for future utility functions

use rusqlite::{Connection, Result};

pub fn execute_query(conn: &Connection, query: &str) -> Result<()> {
    conn.execute(query, [])?;
    Ok(())
}
