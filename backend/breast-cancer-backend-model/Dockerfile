FROM python:3.10-slim

WORKDIR /app

# System dependencies that might be needed for image handling (opencv/keras)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5004

CMD ["python", "app.py"]
