#import feilds
from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import AnemiaPredictor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Model
try:
    predictor = AnemiaPredictor()
except Exception as e:
    logger.error(f"Failed to load anemia model: {e}")
    predictor = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running", "service": "Anemia Prediction API"})

@app.route('/predict/anemia', methods=['POST'])
def predict():
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Validate required fields
        required_fields = ["Gender", "Hemoglobin", "MCH", "MCHC", "MCV"]
        missing = [f for f in required_fields if f not in data]
        if missing:
             return jsonify({"error": f"Missing required fields: {missing}"}), 400

        result = predictor.predict(data)
        
        return jsonify(result)

    except ValueError as ve:
         logger.warning(f"Validation error: {ve}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Run on port 5003 as requested
    app.run(host='0.0.0.0', port=5003, debug=True)
