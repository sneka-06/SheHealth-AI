# Breast Cancer Prediction Backend Service

This directory contains the Flask-based backend service for Breast Cancer Risk Prediction. It serves a ResNet50-based deep learning model that analyzes ultrasound images to detect potential malignancies.

## Project Structure

```
breast-cancer-backend-model/
├── models/             # Contains the trained .keras model
├── venv/               # Virtual environment (optional)
├── app.py              # Main Flask application entry point
├── inference.py        # Model loading & image preprocessing logic
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Prerequisites

- Python 3.9+ (Recommended for TensorFlow compatibility)
- pip (Python package manager)

## Installation & Setup

1.  **Navigate to the directory:**
    ```bash
    cd backend/breast-cancer-backend-model
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

Start the Flask server on port `5004`:

```bash
python app.py
```

The server will be available at: `http://localhost:5004`

### Environment Variables
- `PORT`: (Optional) Port to run the server on (default: `5004`).

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "running",
    "service": "Breast Cancer Prediction API"
  }
  ```

### 2. Predict Breast Cancer
Analyzes an uploaded ultrasound image for breast cancer risk.

- **URL:** `/predict/breast-cancer`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `image`: The ultrasound image file (jpg, png, jpeg).

- **Success Response (200 OK):**
  ```json
  {
    "risk_level": "Malignant",
    "probability": 0.98,
    "classification": "malignant",
    "diagnosis": "Positive for Malignancy",
    "class_probabilities": {
        "benign": 0.02,
        "malignant": 0.98,
        "normal": 0.00
    }
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: No image file provided.
  - `500 Internal Server Error`: Model loading failed or prediction error.

## Model Details
The service uses a **ResNet50** model trained on breast ultrasound datasets. The model attempts to classify images into categories such as `benign`, `malignant`, or `normal`. It uses `inference.py` to:
1.  Load the `resnet50_ultrasound_final.keras` model.
2.  Preprocess the input image (resize, normalize).
3.  Perform inference and return the class probabilities.

## Troubleshooting

- **Model Not Found:** Ensure the `resnet50_ultrasound_final.keras` file is present in the `models/` directory.
- **TensorFlow Errors:** Ensure you have a compatible Python version (3.9-3.11) and the correct TensorFlow version installed.
- **Port Conflict:** If port `5004` is in use, modify the `port` argument in `app.py` or kill the process using that port.
