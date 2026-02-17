# Thyroid Disorder Prediction Backend Service

This repository contains the Flask-based backend service for Thyroid Disorder Prediction. It provides machine learning-based risk assessment for conditions like Hypothyroidism and Hyperthyroidism using patient metrics.

## Project Structure

```
thyroid-backend-model/
├── models/             # Contains trained model and feature mapping artifacts
├── venv/               # Virtual environment (optional)
├── app.py              # Main Flask application entry point
├── inference.py        # Model loading & prediction logic
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation & Setup

1.  **Navigate to the directory:**
    ```bash
    cd backend/thyroid-backend-model
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

Start the Flask server on port `5001`:

```bash
python app.py
```

The server will be available at: `http://localhost:5001`

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "running",
    "service": "Thyroid Prediction API"
  }
  ```

### 2. Predict Thyroid Risk
Analyzes clinical health markers to predict thyroid disorders.

- **URL:** `/predict/thyroid`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "age": 45,
    "sex": "F",              // M or F
    "TSH": 2.5,
    "T3": 1.8,
    "TT4": 110.0,
    "T4U": 0.95,
    "FTI": 115.0,
    "on thyroxine": "f",    // t: True, f: False
    "query on thyroxine": "f",
    "on antithyroid medication": "f",
    "sick": "f",
    "pregnant": "f",
    "thyroid surgery": "f",
    "I131 treatment": "f",
    "query hypothyroid": "f",
    "query hyperthyroid": "f",
    "lithium": "f",
    "goitre": "f",
    "tumor": "f",
    "hypopituitary": "f",
    "psych": "f"
  }
  ```

- **Success Response (200 OK):**
  ```json
  {
    "diagnosis": "negative",
    "probability": 0.99,
    "risk_level": "Low Risk",
    "prediction_class": 0
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: Invalid JSON or data structure.
  - `500 Internal Server Error`: Model is not loaded or failed during inference.

## Technical Details
The service utilizes **XGBoost** for classification. The `inference.py` script:
1.  Loads the pre-trained model and feature encoders.
2.  Handles data imputation for missing values if necessary.
3.  Maps clinical features to the model's required input format.

## Troubleshooting

- **Model Loading:** Ensure the model files are present in the `models/` directory.
- **Port Conflict:** If port `5001` is busy, update the `port` in `app.py`.
- **Dependency Conflicts:** Verify the `scikit-learn` and `xgboost` versions match those in `requirements.txt`.
