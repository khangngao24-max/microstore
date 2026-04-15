import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(
    title="API Gateway (Cổng giao tiếp)", 
    description="Đây là cửa ngõ tập trung. Khi bạn thao tác ở đây, Gateway sẽ tự động chuyển lệnh đến đúng Service bên dưới."
)

# Thêm CORS để Frontend có thể giao tiếp với Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCT_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8001/products")
ORDER_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:8002/orders")

class OrderCreate(BaseModel):
    product_id: int
    quantity: int

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/admin/login", tags=["Admin Auth"])
async def admin_login(req: LoginRequest):
    if req.username == "admin" and req.password == "123456":
        return {"token": "demo-admin-token-12345"}
    else:
        raise HTTPException(status_code=401, detail="Sai username hoặc password")

@app.get("/api/products", tags=["Gateway -> Product Service"])
async def get_products():
    """Lấy danh sách sản phẩm thông qua Gateway"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(PRODUCT_URL)
            return resp.json()
        except:
            raise HTTPException(status_code=503, detail="Product Service is offline")

@app.post("/api/orders", tags=["Gateway -> Order Service"])
async def create_order(order: OrderCreate):
    """Tạo đơn hàng thông qua Gateway"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ORDER_URL, json=order.model_dump() if hasattr(order, 'model_dump') else order.dict())
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=resp.json())
            return resp.json()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Order Service is offline")

@app.get("/api/orders", tags=["Gateway -> Order Service"])
async def get_orders():
    """Lấy danh sách đơn hàng thông qua Gateway"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(ORDER_URL)
            return resp.json()
        except:
            raise HTTPException(status_code=503, detail="Order Service is offline")

# Phục vụ file tĩnh Frontend (Dùng cho môi trường production / cloud)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Thử nhiều đường dẫn để tương thích cả local và Railway
possible_frontend_dirs = [
    os.path.join(current_dir, "frontend"),          # Railway: frontend nằm cùng cấp
    os.path.join(current_dir, "..", "frontend"),     # Local: frontend nằm thư mục cha
    "/app/frontend",                                  # Docker: đường dẫn tuyệt đối
]

frontend_mounted = False
for fdir in possible_frontend_dirs:
    if os.path.exists(fdir):
        app.mount("/", StaticFiles(directory=fdir, html=True), name="frontend")
        print(f"Frontend mounted from: {fdir}")
        frontend_mounted = True
        break

if not frontend_mounted:
    print("Warning: Frontend directory not found. Please ensure it exists if you want to serve static files.")
