import os
import sqlite3
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Order Service", description="Dịch vụ xử lý đơn hàng")

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8001/products")
DB_FILE = "orders.db"

def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.on_event("startup")
def startup():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS orders
                  (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, quantity INTEGER, total_price REAL)''')
    conn.commit()

class OrderCreate(BaseModel):
    product_id: int
    quantity: int

@app.post("/orders", tags=["Order"])
async def create_order(order: OrderCreate):
    """Tạo đơn hàng mới - Sẽ tự động gọi sang Product Service để kiểm tra giá và trừ kho"""
    async with httpx.AsyncClient() as client:
        try:
            # 1. Gọi Product Service để lấy thông tin sản phẩm
            prod_resp = await client.get(f"{PRODUCT_SERVICE_URL}/{order.product_id}")
            if prod_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Không tìm thấy sản phẩm bên hệ thống Kho")
            
            product_data = prod_resp.json()
            if product_data['stock'] < order.quantity:
                raise HTTPException(status_code=400, detail="Kho không đủ hàng để đáp ứng số lượng lệnh này")
                
            total_price = product_data['price'] * order.quantity
            
            # 2. Yêu cầu Product Service giảm số lượng tồn kho
            update_resp = await client.put(f"{PRODUCT_SERVICE_URL}/{order.product_id}/reduce_stock?quantity={order.quantity}")
            if update_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Lỗi khi trừ kho sản phẩm")
                
            # 3. Sau khi trừ kho thành công, lưu lại biên lai Order vào cơ sở dữ liệu riêng
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO orders (product_id, quantity, total_price) VALUES (?, ?, ?)", 
                           (order.product_id, order.quantity, total_price))
            conn.commit()
            
            return {
                "message": "Đơn hàng đã được tạo thành công!", 
                "order_id": cursor.lastrowid, 
                "total_paid": total_price,
                "product_name": product_data['name']
            }
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Lỗi đường truyền: Product Service hiện đang mệt hoặc tắt lưới")

@app.get("/orders", tags=["Order"])
def get_orders():
    """Lấy danh sách các đơn hàng đã đặt"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders")
    return [dict(row) for row in cursor.fetchall()]
