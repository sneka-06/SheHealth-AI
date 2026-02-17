
import os
import joblib
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AnemiaPredictor:
    def __init__(self, model_path="models"):
        """
        Initialize the AnemiaPredictor class.
        Loads the trained pipeline and feature names.
        """
        try:
            self.pipeline_path = os.path.join(model_path, "anemia_pipeline.pkl")
            self.features_path = os.path.join(model_path, "feature_names.pkl")

            logger.info(f"Loading model pipeline from {self.pipeline_path}...")
            self.pipeline = joblib.load(self.pipeline_path)

            logger.info(f"Loading feature names from {self.features_path}...")
            self.feature_names = joblib.load(self.features_path)
            
            # Optimal threshold from metadata.json
            self.optimal_threshold = 0.47

            logger.info(f"Anemia model loaded successfully. Optimal threshold: {self.optimal_threshold}")

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
                               Expected keys: Gender, Hemoglobin, MCH, MCHC, MCV
        
        Returns:
            dict: Prediction result containing prediction_label, probability, risk_level, threshold_used.
        """
        try:
            # 1. Feature Engineering
            # We need to compute 'hb_below_threshold' and 'mch_mchc_ratio'
            
            gender = input_data.get('Gender') # 0: Female, 1: Male
            hemoglobin = input_data.get('Hemoglobin')
            mch = input_data.get('MCH')
            mchc = input_data.get('MCHC')
            mcv = input_data.get('MCV') # Available but maybe not used in engineered feature?
            
            # Check for missing values
            if None in [gender, hemoglobin, mch, mchc, mcv]:
                raise ValueError("Missing required fields (Gender, Hemoglobin, MCH, MCHC, MCV)")
            
            # Feature: hb_below_threshold
            # WHO Anemia cutoffs: Non-pregnant women (12.0 g/dL), Men (13.0 g/dL)
            # Gender: 0=Female, 1=Male
            threshold_hb = 13.0 if gender == 1 else 12.0
            hb_below_threshold = 1 if hemoglobin < threshold_hb else 0
            
            # Feature: mch_mchc_ratio
            # Avoid division by zero
            mch_mchc_ratio = mch / mchc if mchc != 0 else 0
            
            # 2. Construct DataFrame
            features = {
                "Gender": gender,
                "Hemoglobin": hemoglobin,
                "MCH": mch,
                "MCHC": mchc,
                "MCV": mcv,
                "hb_below_threshold": hb_below_threshold,
                "mch_mchc_ratio": mch_mchc_ratio
            }
            
            input_df = pd.DataFrame([features])
            
            # Ensure columns exact match
            input_df = input_df.reindex(columns=self.feature_names, fill_value=0)
            
            logger.info(f"Running prediction for input features: {input_df.to_dict(orient='records')}")
            
            # 3. Predict Probability
            # probability of class 1 (Anemic)
            probability_class_1 = self.pipeline.predict_proba(input_df)[0][1]
            
            # 4. Apply Threshold
            prediction = 1 if probability_class_1 >= self.optimal_threshold else 0
            
            # 5. Result Construction
            prediction_label = "Anemic" if prediction == 1 else "Not Anemic"
            
            # Risk Level
            if probability_class_1 > 0.8:
                risk_level = "High"
            elif probability_class_1 > 0.47: # Using optimal threshold as boundary
                risk_level = "Borderline" 
            else:
                risk_level = "Low"

            return {
                "prediction_label": prediction_label,
                "probability": float(round(probability_class_1, 4)),
                "risk_level": risk_level,
                "threshold_used": self.optimal_threshold,
                "model_version": "1.0.0"
            }

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
