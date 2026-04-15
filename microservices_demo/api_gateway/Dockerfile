# Sử dụng base image Python tối giản
FROM python:3.10-slim

WORKDIR /app

# Copy thư viện từ thư mục gốc
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Gateway và Frontend để Cổng có thể map giao diện chung
COPY api_gateway/ /app/api_gateway/
COPY frontend/ /app/frontend/

WORKDIR /app/api_gateway

# Expose Port 8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
