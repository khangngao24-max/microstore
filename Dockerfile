FROM python:3.10-slim

WORKDIR /app

# Cai dat thu vien
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toan bo code (bao gom cac service va frontend)
COPY . .

# Chay API Gateway lam diem dau vao chinh
# Chuyen vao thu muc api_gateway de chay main.py o do
WORKDIR /app/api_gateway

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
