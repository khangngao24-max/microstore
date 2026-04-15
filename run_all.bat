@echo off
echo ========================================================
echo   KHOI DONG HE THONG MICROSERVICES DEMO
echo ========================================================

echo 1. Dang cai dat thu vien Python (neu chua co)...
python -m pip install -r requirements.txt

echo.
echo 2. Dang bat Product Service (Port 8001)...
start "Product Service" cmd /k "cd product_service && python -m uvicorn main:app --port 8001 --reload"

echo 3. Dang bat Order Service (Port 8002)...
start "Order Service" cmd /k "cd order_service && python -m uvicorn main:app --port 8002 --reload"

echo 4. Dang bat API Gateway (Port 8000)...
start "API Gateway" cmd /k "cd api_gateway && python -m uvicorn main:app --port 8000 --reload"

echo 5. Dang bat Web Frontend (Port 8080)...
start "Web Frontend" cmd /k "cd frontend && python -m http.server 8080"

echo ========================================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo ========================================================
echo   Moi ban truy cap vao trinh duyet cac duong dan sau:
echo   - Giao dien Web (Frontend): http://localhost:8080
echo   - Giao dien API (Swagger):  http://localhost:8000/docs
echo.
echo   Luu y: Vui long giu nguyen cac cua so den (console)
echo   khi muon ket thuc, hay dong tung cua so den lai.
echo ========================================================
pause
