import sqlite3
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Product Service", description="Dịch vụ quản lý kho hàng")

DB_FILE = "products.db"

def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.on_event("startup")
def startup():
    conn = get_db()
    # Tự động reset database sản phẩm mỗi lần chạy để đảm bảo luôn dùng dữ liệu và ảnh mới nhất
    conn.execute("DROP TABLE IF EXISTS products")
    conn.execute('''CREATE TABLE products
                  (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, stock INTEGER, image_url TEXT)''')
    
    # Thêm dữ liệu mẫu
    conn.execute("INSERT INTO products (name, price, stock, image_url) VALUES ('Python Programming', 416000, 10, 'c:/Users/khang/Downloads/download.jpg')")
    conn.execute("INSERT INTO products (name, price, stock, image_url) VALUES ('Building Microservices', 1478000, 5, 'c:/Users/khang/Downloads/download.jpg')")
    conn.execute("INSERT INTO products (name, price, stock, image_url) VALUES ('FastAPI Cookbook', 1738000, 20, 'c:/Users/khang/Downloads/download.jpg')")
    conn.commit()

class Product(BaseModel):
    name: str
    price: float
    stock: int
    image_url: str = None

@app.get("/products", tags=["Product"])
def get_products():
    """Lấy danh sách tất cả sản phẩm"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    return [dict(row) for row in cursor.fetchall()]

@app.get("/products/{product_id}", tags=["Product"])
def get_product(product_id: int):
    """Lấy thông tin chi tiết một sản phẩm"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id=?", (product_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm này")
    return dict(row)

@app.put("/products/{product_id}/reduce_stock", tags=["Product"])
def reduce_stock(product_id: int, quantity: int):
    """Giảm số lượng trong kho khi có người đặt hàng (được gọi bởi Order Service)"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT stock FROM products WHERE id=?", (product_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm này")
    if row['stock'] < quantity:
        raise HTTPException(status_code=400, detail="Sản phẩm không đủ hàng trong kho")
    
    new_stock = row['stock'] - quantity
    cursor.execute("UPDATE products SET stock=? WHERE id=?", (new_stock, product_id))
    conn.commit()
    return {"message": "Đã cập nhật kho", "new_stock": new_stock}
