# Anemia Prediction Backend Service

This directory contains the Flask-based backend service for Anemia Risk Prediction. It serves a machine learning model that predicts the likelihood of anemia based on hematological parameters.

## Project Structure

```
anemia-backend-model/
├── models/             # Contains trained ML models & scalers
├── venv/               # Virtual environment (optional)
├── app.py              # Main Flask application entry point
├── inference.py        # Model inference logic & preprocessing
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation & Setup

1.  **Navigate to the directory:**
    ```bash
    cd backend/anemia-backend-model
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

Start the Flask server on port `5003`:

```bash
python app.py
```

The server will be available at: `http://localhost:5003`

### Environment Variables
- `PORT`: (Optional) Port to run the server on (default: `5003`).

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "running",
    "service": "Anemia Prediction API"
  }
  ```

### 2. Predict Anemia
Predicts anemia risk based on blood test parameters.

- **URL:** `/predict/anemia`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "Gender": 0,          // 0: Female, 1: Male
    "Hemoglobin": 12.5,   // g/dL
    "MCH": 28.0,          // pg
    "MCHC": 33.0,         // g/dL
    "MCV": 85.0           // fL
  }
  ```

- **Success Response (200 OK):**
  ```json
  {
    "prediction": "Anemic",
    "probability": 0.85,
    "confidence_score": 85.0
  }
  ```
  _Note: Response format depends on `inference.py` implementation._

- **Error Responses:**
  - `400 Bad Request`: Missing fields or invalid data type.
  - `500 Internal Server Error`: Model loading failed or prediction error.

## Model Logic
The service uses a trained machine learning model (likely XGBoost or Random Forest) loaded via `joblib`. The `inference.py` script handles:
1.  Loading the model and scaler artifacts.
2.  Preprocessing input data (scaling/normalization).
3.  Running the prediction and formatting the output.

## Troubleshooting

- **Model Not Found:** Ensure the `.pkl` or `.joblib` model files are present in the `models/` directory.
- **Port Conflict:** If port `5003` is in use, modify the `port` argument in `app.py` or kill the process using that port.
