
import os
import joblib
import pandas as pd
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────
# The 14 raw fields that the frontend sends
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

# Risk‑factor flags used to compute Risk_Factor_Count
_RISK_CHECKS = [
    lambda d: d["Hormonal Changes"] == "Postmenopausal",
    lambda d: d["Family History"] == "Yes",
    lambda d: d["Body Weight"] == "Underweight",
    lambda d: d["Calcium Intake"] == "Low",
    lambda d: d["Vitamin D Intake"] == "Insufficient",
    lambda d: d["Physical Activity"] == "Sedentary",
    lambda d: d["Smoking"] == "Yes",
    lambda d: d["Prior Fractures"] == "Yes",
    lambda d: d["Medical Conditions"] in ("Rheumatoid Arthritis", "Hyperthyroidism"),
    lambda d: d["Medications"] == "Corticosteroids",
]


class OsteoporosisPredictor:
    """Loads the trained osteoporosis pipeline and runs inference."""

    def __init__(self, model_path: str = "models"):
        try:
            pipeline_path = os.path.join(model_path, "osteoporosis_pipeline.pkl")
            features_path = os.path.join(model_path, "feature_names.pkl")
            threshold_path = os.path.join(model_path, "optimal_threshold.pkl")

            logger.info("Loading osteoporosis model pipeline from %s ...", pipeline_path)
            self.pipeline = joblib.load(pipeline_path)

            logger.info("Loading feature names from %s ...", features_path)
            self.feature_names: list[str] = joblib.load(features_path)

            logger.info("Loading optimal threshold from %s ...", threshold_path)
            self.optimal_threshold: float = joblib.load(threshold_path)

            logger.info(
                "Osteoporosis model loaded. %d features, threshold=%.4f",
                len(self.feature_names),
                self.optimal_threshold,
            )
        except FileNotFoundError as exc:
            logger.error("Model file not found: %s", exc)
            raise
        except Exception as exc:
            logger.error("Error loading model: %s", exc)
            raise

    # ── public API ────────────────────────────────────────────────────────────
    def predict(self, input_data: dict) -> dict:
        """
        Run inference on the raw 14‑field input dict from the frontend.

        The sklearn pipeline internally handles StandardScaling (numeric cols)
        and OneHotEncoding (categorical cols). We only need to:
          1. Pass through the 14 raw fields as‑is
          2. Compute 4 engineered features the pipeline also expects

        Returns
        -------
        dict with keys: prediction_label, probability, risk_level,
                        diagnosis, threshold_used, model_version
        """
        try:
            # 1. Validate required fields
            missing = [f for f in REQUIRED_FIELDS if f not in input_data]
            if missing:
                raise ValueError(f"Missing required fields: {missing}")

            # 2. Build the 18‑column DataFrame the pipeline expects
            row = self._build_row(input_data)
            input_df = pd.DataFrame([row])

            # Reindex to guarantee exact column order the pipeline was trained on
            # (14 raw + 4 engineered = 18 columns)
            expected_cols = self._get_pipeline_input_columns()
            input_df = input_df.reindex(columns=expected_cols)

            logger.info("Prediction input: %s", input_df.to_dict(orient="records"))

            # 3. Predict
            prob_positive = float(self.pipeline.predict_proba(input_df)[0][1])
            prediction = 1 if prob_positive >= self.optimal_threshold else 0

            # 4. Map to human‑readable result
            prediction_label = "Osteoporosis" if prediction == 1 else "No Osteoporosis"

            if prob_positive > 0.8:
                risk_level = "High"
            elif prob_positive >= self.optimal_threshold:
                risk_level = "Borderline"
            else:
                risk_level = "Low"

            diagnosis = (
                f"Based on the provided risk factors, the model predicts "
                f"{'a significant' if prediction == 1 else 'a low'} risk of osteoporosis "
                f"(probability {prob_positive:.1%}). "
                f"{'Please consult an endocrinologist or rheumatologist for a DEXA scan and further evaluation.' if prediction == 1 else 'Continue maintaining bone-healthy habits and discuss routine screening with your doctor.'}"
            )

            return {
                "prediction_label": prediction_label,
                "probability": round(prob_positive, 4),
                "risk_level": risk_level,
                "diagnosis": diagnosis,
                "threshold_used": self.optimal_threshold,
                "model_version": "1.0.0",
            }

        except Exception as exc:
            logger.error("Prediction failed: %s", exc)
            raise

    # ── private helpers ───────────────────────────────────────────────────────
    def _get_pipeline_input_columns(self) -> list[str]:
        """Return the 18 column names the ColumnTransformer was fitted on."""
        base = self.pipeline.estimator
        preprocessor = base.named_steps["preprocessor"]
        return list(preprocessor.feature_names_in_)

    @staticmethod
    def _build_row(d: dict) -> dict:
        """
        Build a single row dict with:
          - 14 raw fields passed through as‑is (categoricals remain strings)
          - 4 engineered features computed from the raw inputs
        """
        age = int(d["Age"])
        is_postmenopausal = d["Hormonal Changes"] == "Postmenopausal"
        is_female = d["Gender"] == "Female"

        row: dict = {
            # ── Raw fields (passed straight to the pipeline) ──
            "Age": age,
            "Gender": d["Gender"],
            "Hormonal Changes": d["Hormonal Changes"],
            "Family History": d["Family History"],
            "Race/Ethnicity": d["Race/Ethnicity"],
            "Body Weight": d["Body Weight"],
            "Calcium Intake": d["Calcium Intake"],
            "Vitamin D Intake": d["Vitamin D Intake"],
            "Physical Activity": d["Physical Activity"],
            "Smoking": d["Smoking"],
            "Alcohol Consumption": d["Alcohol Consumption"],
            "Medical Conditions": d["Medical Conditions"],
            "Medications": d["Medications"],
            "Prior Fractures": d["Prior Fractures"],
            # ── Engineered features ──
            "Age_Risk_Group": (
                "Low" if age < 50 else ("Moderate" if age < 65 else "High")
            ),
            "Is_Postmenopausal_Female": int(is_female and is_postmenopausal),
            "Age_Postmenopausal_Interaction": age * int(is_postmenopausal),
            "Risk_Factor_Count": sum(check(d) for check in _RISK_CHECKS),
        }

        return row
