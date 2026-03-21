FROM python:3.10-slim

WORKDIR /app

# Install dependencies (if any system deps are required, add here)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose the API port
EXPOSE 5003

# Run the app
CMD ["python", "app.py"]
