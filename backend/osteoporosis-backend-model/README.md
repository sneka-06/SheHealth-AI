# Osteoporosis Risk Prediction Backend Service

This directory contains the Flask-based backend service for Osteoporosis Risk Evaluation. It utilizes a machine learning model to assess bone health risk based on demographic, lifestyle, and medical history factors.

## Project Structure

```
osteoporosis-backend-model/
├── models/             # Contains trained ML models & preprocessing artifacts
├── venv/               # Virtual environment (optional)
├── app.py              # Main Flask application entry point
├── inference.py        # Model inference logic & feature engineering
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation & Setup

1.  **Navigate to the directory:**
    ```bash
    cd backend/osteoporosis-backend-model
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

Start the Flask server on port `5002`:

```bash
python app.py
```

The server will be available at: `http://localhost:5002`

### Environment Variables
- `PORT`: (Optional) Port to run the server on (default: `5002`).

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "running",
    "service": "Osteoporosis Prediction API"
  }
  ```

### 2. Predict Osteoporosis Risk
Predicts the risk of osteoporosis based on clinical and lifestyle data.

- **URL:** `/predict/osteoporosis`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "Age": 55,
    "Gender": "Female",
    "Hormonal Changes": "Postmenopausal",
    "Family History": "Yes",
    "Race/Ethnicity": "Caucasian",
    "Body Weight": "Low",
    "Calcium Intake": "Low",
    "Vitamin D Intake": "Insufficient",
    "Physical Activity": "Sedentary",
    "Smoking": "Yes",
    "Alcohol Consumption": "Moderate",
    "Medical Conditions": "None",
    "Medications": "Corticosteroids",
    "Prior Fractures": "No"
  }
  ```

- **Success Response (200 OK):**
  ```json
  {
    "risk_level": "High Risk",
    "probability": 0.82,
    "diagnosis": "Potential Osteoporosis Risk Detected",
    "prediction_label": 1
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: Missing fields or invalid JSON.
  - `500 Internal Server Error`: Model loading failed or internal processing error.

## Model Details
The service uses a trained machine learning model (e.g., Random Forest or XGBoost) with `imbalanced-learn` handling during training. The `inference.py` script manages:
1.  Loading the model and any associated encoders/scalers.
2.  Mapping categorical input strings to numerical values.
3.  Calculating risk probability and assigning a risk level.

## Troubleshooting

- **Model Loading Failed:** Verify that the trained model files exist in the `models/` directory.
- **Dependency Issues:** Ensure `imbalanced-learn` is correctly installed as it is required for handling class imbalances often found in clinical data.
- **Port Conflict:** If port `5002` is in use, modify `app.py` or stop the conflicting service.
