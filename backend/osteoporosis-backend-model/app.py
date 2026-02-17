#import feilds
from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import OsteoporosisPredictor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Model
try:
    predictor = OsteoporosisPredictor()
except Exception as e:
    logger.error(f"Failed to load osteoporosis model: {e}")
    predictor = None

REQUIRED_FIELDS = [
    "Age",
    "Gender",
    "Hormonal Changes",
    "Family History",
    "Race/Ethnicity",
    "Body Weight",
    "Calcium Intake",
    "Vitamin D Intake",
    "Physical Activity",
    "Smoking",
    "Alcohol Consumption",
    "Medical Conditions",
    "Medications",
    "Prior Fractures",
]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "service": "Osteoporosis Prediction API"})


@app.route("/predict/osteoporosis", methods=["POST"])
def predict():
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Validate required fields
        missing = [f for f in REQUIRED_FIELDS if f not in data]
        if missing:
            return jsonify({"error": f"Missing required fields: {missing}"}), 400

        result = predictor.predict(data)

        return jsonify(
            {
                "risk_level": result["risk_level"],
                "probability": result["probability"],
                "diagnosis": result["diagnosis"],
                "prediction_label": result["prediction_label"],
            }
        )

    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Port 5002 — PCOS=5000, Thyroid=5001, Osteoporosis=5002, Anemia=5003
    app.run(host="0.0.0.0", port=5002, debug=True)
