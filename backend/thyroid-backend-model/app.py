#import feilds
from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import ThyroidPredictor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Model
try:
    predictor = ThyroidPredictor()
except Exception as e:
    logger.error(f"Failed to load generic model: {e}")
    predictor = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running", "service": "Thyroid Prediction API"})

@app.route('/predict/thyroid', methods=['POST'])
def predict():
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Extract features from request
        # We need to map frontend field names to model feature names if they differ.
        # Based on typical thyroid datasets (like UCI), features are often:
        # age, sex, on_thyroxine, etc.
        # The frontend sends: 'age', 'sex', 'TSH', 'TT4', etc.
        # And 'was_imputed_*' fields.
        
        # Let's construct the dictionary expected by the model.
        # We pass the raw data and let the inference/pipeline handle it, 
        # assuming the frontend keys match or are close enough that we can just pass them.
        # However, key matching is critical. 
        
        # Mapping: keys in data -> keys in model
        # The 'feature_names.pkl' will dictate this. 
        # For now, we pass 'data' directly. If the model expects specific keys (e.g. 'on thyroxine' vs 'on_thyroxine'),
        # we strictly rely on the frontend sending what the model was trained on.
        # The frontend uses keys like "on thyroxine" (with space) which matches standard datasets.
        
        result = predictor.predict(data)
        
        return jsonify({
            "risk_level": result['risk_level'],
            "probability": result['probability'],
            "diagnosis": result['diagnosis'],
            "prediction_class": result['prediction']
        })

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with PCOS service (5000)
    app.run(host='0.0.0.0', port=5001, debug=True)
