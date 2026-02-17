import os
# Must be set before importing tensorflow/keras
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import traceback
import sys
from inference import BreastCancerPredictor
import numpy as np
from PIL import Image
import io

# Redirect stdout to devnull to suppress TF logs
sys.stdout = open(os.devnull, 'w')

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "resnet50_ultrasound_final.keras")

try:
    predictor = BreastCancerPredictor(MODEL_PATH)
except Exception as e:
    with open("last_error.txt", "w") as f:
        f.write(f"Model load failed: {e}\n")
        f.write(traceback.format_exc())
    sys.exit(1)

# Create dummy image
arr = np.zeros((224, 224, 3), dtype=np.uint8)
img = Image.fromarray(arr, 'RGB')
buf = io.BytesIO()
img.save(buf, format='PNG')
image_bytes = buf.getvalue()

try:
    result = predictor.predict(image_bytes)
    with open("last_error.txt", "w") as f:
        f.write(f"Success: {result}")
except Exception as e:
    with open("last_error.txt", "w") as f:
        f.write(f"Prediction failed: {e}\n")
        f.write(traceback.format_exc())
