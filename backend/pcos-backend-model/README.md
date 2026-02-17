# PCOS Detection Backend Service

This directory contains the Flask-based backend service for PCOS (Polycystic Ovary Syndrome) Detection. It uses a trained machine learning model to predict the likelihood of PCOS based on hormonal and metabolic indicators.

## Project Structure

```
pcos-backend-model/
├── models/             # Contains trained ML models & preprocessing pipelines
├── venv/               # Virtual environment (optional)
├── app.py              # Main Flask application entry point
├── inference.py        # Model inference engine & feature engineering
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation & Setup

1.  **Navigate to the directory:**
    ```bash
    cd backend/pcos-backend-model
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

Start the Flask server on port `5000`:

```bash
python app.py
```

The server will be available at: `http://localhost:5000`

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "running"
  }
  ```

### 2. Predict PCOS
Accepts clinical parameters and returns a PCOS risk assessment.

- **URL:** `/predict/pcos`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "age": 25,
    "bmi": 24.5,
    "menstrual_irregularity": 1,    // 0: No, 1: Yes
    "testosterone_level": 45.0,     // ng/dL
    "antral_follicle_count": 8       // count
  }
  ```

- **Success Response (200 OK):**
  ```json
  {
    "prediction_label": "PCOS Positive",
    "probability": 0.88,
    "risk_level": "High Risk",
    "diagnosis": "Indications suggestive of PCOS"
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: Missing fields or invalid data.
  - `500 Internal Server Error`: Server-side processing error.

## Technical Details
The service utilizes a **PCOSPredictor** class (defined in `inference.py`) which:
1.  Loads the trained model from the `models/` directory.
2.  Performs feature engineering and scaling on the input data.
3.  Generates a probability score and risk level classification.

## Troubleshooting

- **Model Artifacts:** Ensure the model files (e.g., joblib or pkl) are present in the `models/` folder.
- **Port Conflict:** If port `5000` is occupied, change the port in `app.py`.
- **CORS:** CORS is enabled for all origins by default in this development version.
