#import feilds
import os
import logging
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import BreastCancerPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "resnet50_ultrasound_final.keras")

try:
    predictor = BreastCancerPredictor(MODEL_PATH)
    logger.info("Breast cancer model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load breast cancer model: {e}")
    predictor = None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "service": "Breast Cancer Prediction API"})


@app.route("/predict/breast-cancer", methods=["POST"])
def predict():
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500

    # Validate file presence
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Please upload an image."}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "Empty filename. Please select a valid image."}), 400

    try:
        image_bytes = image_file.read()

        # Run prediction
        result = predictor.predict(image_bytes)

        return jsonify({
            "risk_level": result["risk_level"],
            "probability": result["confidence"],
            "classification": result["predicted_class"],
            "diagnosis": result["diagnosis"],
            "class_probabilities": result.get("class_probabilities", {}),
        })

    except Exception as e:
        logger.error(f"Prediction error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)
