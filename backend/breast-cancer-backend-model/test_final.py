from inference import BreastCancerPredictor
import os
import sys

# Suppress TF logs
sys.stdout = open(os.devnull, 'w')
# sys.stderr = open(os.devnull, 'w') # Keep stderr to see errors

print("Starting clean test...")
try:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "resnet50_ultrasound_final.keras")
    predictor = BreastCancerPredictor(MODEL_PATH)
    
    # Create test image
    import numpy as np
    from PIL import Image
    import io
    
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(arr, 'RGB')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    image_bytes = buf.getvalue()
    
    result = predictor.predict(image_bytes)
    
    # Restore stdout to print success
    sys.stdout = sys.__stdout__
    print("SUCCESS: Model loaded and prediction ran.")
    print(f"Result: {result}")
    
except Exception as e:
    sys.stdout = sys.__stdout__
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
