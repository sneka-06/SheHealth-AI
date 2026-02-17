"""
PCOS Detection System - Inference Module
=========================================
Production deployment predictor class.
Loads trained pipeline, threshold, and feature names to make predictions.
"""

import os
import logging
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')


class PCOSPredictor:
    """Production PCOS prediction class.

    Usage:
        predictor = PCOSPredictor()
        result = predictor.predict({
            'Age': 28,
            'BMI': 32.5,
            'Menstrual_Irregularity': 1,
            'Testosterone_Level(ng/dL)': 85.0,
            'Antral_Follicle_Count': 18
        })
        print(result)
    """

    # Raw input features (what the user provides)
    RAW_FEATURES = [
        'Age', 'BMI', 'Menstrual_Irregularity',
        'Testosterone_Level(ng/dL)', 'Antral_Follicle_Count'
    ]

    def __init__(self, model_dir=None):
        """Initialize predictor by loading saved artifacts.

        Args:
            model_dir: Path to directory containing model artifacts.
                       Defaults to ./models/
        """
        self.model_dir = model_dir or MODEL_DIR

        try:
            self.pipeline = joblib.load(
                os.path.join(self.model_dir, 'pcos_model_pipeline.pkl')
            )
            self.threshold = joblib.load(
                os.path.join(self.model_dir, 'optimal_threshold.pkl')
            )
            self.feature_names = joblib.load(
                os.path.join(self.model_dir, 'feature_names.pkl')
            )
            logger.info(f"PCOSPredictor initialized. "
                        f"Model loaded from {self.model_dir}. "
                        f"Threshold: {self.threshold:.2f}. "
                        f"Features: {len(self.feature_names)}")
        except FileNotFoundError as e:
            raise FileNotFoundError(
                f"Model artifacts not found in '{self.model_dir}'. "
                f"Run train.py first to generate model files. Error: {e}"
            )

    def _validate_input(self, patient_data):
        """Validate input features.

        Args:
            patient_data: dict with patient features

        Returns:
            dict: validated patient data

        Raises:
            ValueError: if required features missing or invalid
        """
        if not isinstance(patient_data, dict):
            raise ValueError("patient_data must be a dictionary.")

        missing = [f for f in self.RAW_FEATURES if f not in patient_data]
        if missing:
            raise ValueError(
                f"Missing required features: {missing}. "
                f"Required: {self.RAW_FEATURES}"
            )

        validated = {}
        for feat in self.RAW_FEATURES:
            val = patient_data[feat]
            try:
                validated[feat] = float(val)
            except (TypeError, ValueError):
                raise ValueError(
                    f"Feature '{feat}' must be numeric. Got: {val} ({type(val).__name__})"
                )

        # Domain validation
        if not (10 <= validated['Age'] <= 60):
            logger.warning(f"Age={validated['Age']} outside typical range (10-60).")
        if not (10 <= validated['BMI'] <= 60):
            logger.warning(f"BMI={validated['BMI']} outside typical range (10-60).")
        if validated['Menstrual_Irregularity'] not in (0, 1, 0.0, 1.0):
            logger.warning(f"Menstrual_Irregularity={validated['Menstrual_Irregularity']} "
                           f"should be 0 or 1.")
        if not (0 <= validated['Testosterone_Level(ng/dL)'] <= 200):
            logger.warning(f"Testosterone={validated['Testosterone_Level(ng/dL)']} "
                           f"outside typical range (0-200).")
        if not (0 <= validated['Antral_Follicle_Count'] <= 50):
            logger.warning(f"AFC={validated['Antral_Follicle_Count']} "
                           f"outside typical range (0-50).")

        return validated

    def _engineer_features(self, validated_data):
        """Create engineered features matching training pipeline.

        Args:
            validated_data: dict of validated raw features

        Returns:
            pd.DataFrame with all features
        """
        data = validated_data.copy()

        # Feature engineering (must match train.py)
        bmi = data['BMI']
        if bmi < 18.5:
            data['BMI_Category'] = 0
        elif bmi < 25:
            data['BMI_Category'] = 1
        elif bmi < 30:
            data['BMI_Category'] = 2
        else:
            data['BMI_Category'] = 3

        data['Testosterone_High'] = 1 if data['Testosterone_Level(ng/dL)'] > 50 else 0
        data['AFC_High'] = 1 if data['Antral_Follicle_Count'] >= 12 else 0
        data['Age_BMI_Interaction'] = data['Age'] * data['BMI']
        data['Testosterone_AFC_Ratio'] = (
            data['Testosterone_Level(ng/dL)'] / (data['Antral_Follicle_Count'] + 1)
        )

        # Create DataFrame with correct column order
        df = pd.DataFrame([data])[self.feature_names]
        return df

    def predict(self, patient_data):
        """Make PCOS prediction for a patient.

        Args:
            patient_data: dict with keys matching RAW_FEATURES:
                - Age (int/float)
                - BMI (float)
                - Menstrual_Irregularity (0 or 1)
                - Testosterone_Level(ng/dL) (float)
                - Antral_Follicle_Count (int/float)

        Returns:
            dict with:
                - prediction (int): 0=Negative, 1=Positive
                - probability (float): probability of PCOS
                - risk_level (str): Low / Medium / High
                - threshold_used (float): classification threshold
                - features_used (list): feature names
                - diagnosis (str): human-readable diagnosis
        """
        try:
            # Validate
            validated = self._validate_input(patient_data)

            # Engineer features
            X = self._engineer_features(validated)

            # Predict probability
            probability = float(self.pipeline.predict_proba(X)[0, 1])

            # Apply optimal threshold
            prediction = 1 if probability >= self.threshold else 0

            # Risk level
            if probability < 0.3:
                risk_level = 'Low'
            elif probability < 0.6:
                risk_level = 'Borderline'
            else:
                risk_level = 'High'

            # Diagnosis text
            if prediction == 1:
                diagnosis = "PCOS Positive - Further clinical evaluation recommended"
            else:
                diagnosis = "PCOS Negative - No immediate PCOS indicators detected"

            result = {
                'prediction': prediction,
                'probability': round(probability, 4),
                'risk_level': risk_level,
                'threshold_used': round(self.threshold, 2),
                'features_used': self.feature_names,
                'diagnosis': diagnosis
            }

            logger.info(f"Prediction: {result['diagnosis']} "
                        f"(prob={result['probability']}, risk={result['risk_level']})")

            return result

        except ValueError as e:
            raise
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {e}")

    def predict_batch(self, patients_list):
        """Make predictions for multiple patients.

        Args:
            patients_list: list of dicts, each with patient features

        Returns:
            list of prediction result dicts
        """
        return [self.predict(p) for p in patients_list]


# ===================================================================
# CLI Demo
# ===================================================================
def main():
    """Demo prediction."""
    print("=" * 60)
    print("PCOS Detection System - Inference Demo")
    print("=" * 60)

    predictor = PCOSPredictor()

    # Example patients
    examples = [
        {
            'name': 'Low Risk Patient',
            'data': {
                'Age': 30, 'BMI': 22.0, 'Menstrual_Irregularity': 0,
                'Testosterone_Level(ng/dL)': 35.0, 'Antral_Follicle_Count': 8
            }
        },
        {
            'name': 'Medium Risk Patient',
            'data': {
                'Age': 27, 'BMI': 28.5, 'Menstrual_Irregularity': 1,
                'Testosterone_Level(ng/dL)': 55.0, 'Antral_Follicle_Count': 14
            }
        },
        {
            'name': 'High Risk Patient',
            'data': {
                'Age': 25, 'BMI': 33.0, 'Menstrual_Irregularity': 1,
                'Testosterone_Level(ng/dL)': 90.0, 'Antral_Follicle_Count': 22
            }
        }
    ]

    for ex in examples:
        print(f"\n--- {ex['name']} ---")
        print(f"Input: {ex['data']}")
        result = predictor.predict(ex['data'])
        print(f"Prediction: {'PCOS Positive' if result['prediction'] == 1 else 'PCOS Negative'}")
        print(f"Probability: {result['probability']:.4f}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Diagnosis: {result['diagnosis']}")


if __name__ == '__main__':
    main()
