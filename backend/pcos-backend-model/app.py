"""
PCOS Detection API
==================
Thin Flask wrapper around the PCOSPredictor inference engine.
"""
#import feilds
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import PCOSPredictor

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App + Model
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

predictor = PCOSPredictor()      # loads model artifacts once at startup
logger.info("Flask app ready — PCOSPredictor loaded.")

# Map frontend field names → model feature names
FIELD_MAP = {
    "age": "Age",
    "bmi": "BMI",
    "menstrual_irregularity": "Menstrual_Irregularity",
    "testosterone_level": "Testosterone_Level(ng/dL)",
    "antral_follicle_count": "Antral_Follicle_Count",
}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    """Health check."""
    return jsonify({"status": "running"})


@app.route("/predict/pcos", methods=["POST"])
def predict_pcos():
    """Accept 5 raw features from the frontend and return a PCOS prediction."""
    try:
        body = request.get_json(force=True)
        if not body:
            return jsonify({"error": "Request body is empty or not valid JSON."}), 400

        # Remap frontend keys to model keys
        patient_data = {}
        for frontend_key, model_key in FIELD_MAP.items():
            if frontend_key not in body:
                return jsonify({
                    "error": f"Missing required field: '{frontend_key}'"
                }), 400
            patient_data[model_key] = body[frontend_key]

        logger.info(f"Incoming prediction request: {patient_data}")

        # Delegate to PCOSPredictor (validates, engineers features, predicts)
        result = predictor.predict(patient_data)

        return jsonify({
            "prediction_label": "PCOS Positive" if result["prediction"] == 1 else "PCOS Negative",
            "probability": result["probability"],
            "risk_level": result["risk_level"],
            "diagnosis": result["diagnosis"],
        })

    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error."}), 500


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
