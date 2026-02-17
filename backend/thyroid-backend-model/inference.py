
import os
import joblib
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ThyroidPredictor:
    def __init__(self, model_path="models"):
        """
        Initialize the ThyroidPredictor class.
        Loads the trained pipeline and feature names.
        """
        try:
            self.pipeline_path = os.path.join(model_path, "thyroid_pipeline.pkl")
            self.features_path = os.path.join(model_path, "feature_names.pkl")

            logger.info(f"Loading model pipeline from {self.pipeline_path}...")
            self.pipeline = joblib.load(self.pipeline_path)

            logger.info(f"Loading feature names from {self.features_path}...")
            self.feature_names = joblib.load(self.features_path)

            logger.info("Thyroid model loaded successfully.")

        except FileNotFoundError as e:
            logger.error(f"Model file not found: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

    def predict(self, input_data):
        """
        Run inference on the input data dictionary.
        
        Args:
            input_data (dict): Dictionary containing patient data.
        
        Returns:
            dict: Prediction result containing diagnosis, probability, and risk level.
        """
        try:
            # Convert input dict to DataFrame
            # Ensure we use the exact feature names the model expects
            # We map frontend keys to model keys if necessary, but here we assume 
            # the app.py prepares the data in the correct format matching feature_names
            
            # Create a DataFrame with a single row
            input_df = pd.DataFrame([input_data])
            
            # Ensure columns are in the correct order as expected by the model
            # Reindex will fill missing columns with NaN (should verify if model handles this, 
            # but our frontend validation should prevent it)
            input_df = input_df.reindex(columns=self.feature_names, fill_value=0)
            
            logger.info(f"Running prediction for input: {input_df.to_dict(orient='records')}")
            
            # Get prediction and probability
            prediction = self.pipeline.predict(input_df)[0]
            probability = self.pipeline.predict_proba(input_df)[0]

            # Assuming pipeline.classes_ is [0, 1, 2], so index 0 is Class 0 (Negative)
            prob_negative = probability[0]
            prob_disorder = 1.0 - prob_negative
            
            # Map prediction class to human-readable diagnosis
            diagnosis_map = {
                0: "Negative (No Thyroid Disorder)",
                1: "Hyperthyroidism", 
                2: "Hypothyroidism"
            }
            
            # Fallback if map doesn't match
            diagnosis = diagnosis_map.get(prediction, f"Class {prediction}")
            
            # Determine Risk Level based on probability OF DISORDER
            if prob_disorder > 0.8:
                risk_level = "High"
            elif prob_disorder > 0.5:
                risk_level = "Borderline"
            else:
                risk_level = "Low"

            return {
                "prediction": int(prediction),
                "diagnosis": diagnosis,
                "probability": float(round(prob_disorder, 4)),
                "risk_level": risk_level
            }

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
