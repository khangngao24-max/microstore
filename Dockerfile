FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Chay truc tiep tu api_gateway de tranh sai duong dan
WORKDIR /app/api_gateway

# Railway se tu dong inject PORT vao bien moi truong
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
