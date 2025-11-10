use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,
    pub loyalty_points: i32,
    pub membership_tier: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCustomerInput {
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Order {
    pub id: String,
    pub order_number: String,
    pub customer_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub customer_name: Option<String>,
    pub order_date: String,
    pub pickup_date: Option<String>,
    pub delivery_date: Option<String>,
    pub status: String,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub is_express: bool,
    pub notes: Option<String>,
    pub items: Vec<OrderItem>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrderItem {
    pub id: String,
    pub order_id: String,
    pub item_type: String,
    pub service_type: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub total_price: f64,
    pub barcode: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderInput {
    pub customer_id: String,
    pub pickup_date: Option<String>,
    pub delivery_date: Option<String>,
    pub is_express: bool,
    pub notes: Option<String>,
    pub items: Vec<CreateOrderItemInput>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderItemInput {
    pub item_type: String,
    pub service_type: String,
    pub quantity: i32,
    pub unit_price: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Payment {
    pub id: String,
    pub order_id: String,
    pub amount: f64,
    pub payment_method: String,
    pub payment_date: String,
    pub transaction_id: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreatePaymentInput {
    pub order_id: String,
    pub amount: f64,
    pub payment_method: String,
    pub transaction_id: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryItem {
    pub id: String,
    pub name: String,
    pub category: String,
    pub quantity: f64,
    pub unit: String,
    pub min_stock_level: Option<f64>,
    pub supplier_name: Option<String>,
    pub supplier_contact: Option<String>,
    pub last_purchase_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Service {
    pub id: String,
    pub name: String,
    pub category: String,
    pub base_price: f64,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Staff {
    pub id: String,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub role: String,
    pub salary: Option<f64>,
    pub commission_rate: f64,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_orders: i32,
    pub active_customers: i32,
    pub today_revenue: f64,
    pub pending_orders: i32,
    pub processing_orders: i32,
    pub ready_orders: i32,
}
