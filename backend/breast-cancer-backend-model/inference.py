import os
import numpy as np
import tensorflow as tf
import tensorflow as tf
import tf_keras as keras
from PIL import Image
import io

class BreastCancerPredictor:
    def __init__(self, model_path):
        """
        Initialize predictor
        
        Args:
            model_path: Path to trained model
        """
        self.model_path = model_path
        self.model = None
        # Must match training configuration
        self.class_names = ['benign', 'malignant', 'normal']
        self.img_size = (224, 224)
        
        # Load model
        self.load_model()
    
    def load_model(self):
        """Load trained model"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
        self.model = keras.models.load_model(self.model_path)
    
    def preprocess_image(self, image_bytes):
        """
        Preprocess image bytes for prediction
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Preprocessed image array
        """
        # Load image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model input size
        img = img.resize(self.img_size)
        
        # Convert to array and normalize
        img_array = np.array(img) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def is_valid_ultrasound(self, image):
        """
        Check if the image is likely an ultrasound (grayscale).
        """
        # Convert to numpy array
        img_array = np.array(image)
        
        # If image helps 3 channels (RGB), check color variance
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
            
            # Calculate variance between channels
            # Ultrasounds are grayscale, so R~=G~=B
            diff_rg = np.mean(np.abs(r - g))
            diff_rb = np.mean(np.abs(r - b))
            diff_gb = np.mean(np.abs(g - b))
            
            avg_diff = (diff_rg + diff_rb + diff_gb) / 3.0
            
            # Threshold: If avg difference > 15 (out of 255), it's likely a color image
            if avg_diff > 15:
                return False, f"Image detected as non-medical (Color variance: {avg_diff:.1f}). Please upload a grayscale ultrasound."
        
        # Calculate pixel intensity statistics (using grayscale version)
        if len(img_array.shape) == 3:
            gray_img = np.mean(img_array, axis=2)
        else:
            gray_img = img_array
            
        mean_intensity = np.mean(gray_img)
        std_intensity = np.std(gray_img)
        
        # Check 1: Too bright? (Ultrasounds are mostly dark/black)
        # Typical breast ultrasounds have large black areas. Mean intensity is usually < 100.
        if mean_intensity > 150:
             return False, f"Image is too bright (Mean intensity: {mean_intensity:.1f}). Ultrasounds are typically darker."
             
        # Check 2: Too flat? (Ultrasounds have high contrast between tissue and background)
        if std_intensity < 15:
            return False, f"Image is too flat/uniform (Std Dev: {std_intensity:.1f}). Ultrasounds have more contrast."
            
        return True, ""

    def predict(self, image_bytes):
        """
        Make prediction on image bytes
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Prediction result dictionary
        """
        # Load image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Check validation
        is_valid, msg = self.is_valid_ultrasound(img)
        if not is_valid:
             return {
                'predicted_class': 'unknown',
                'confidence': 0.0,
                'risk_level': "Invalid Input",
                'diagnosis': msg,
                'class_probabilities': {c: 0.0 for c in self.class_names},
                'low_confidence': True
            }

        # Preprocess image
        # Resize to model input size
        img_resized = img.resize(self.img_size)
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        predictions = self.model.predict(img_array, verbose=0)
        
        # Get probabilities
        probs = predictions[0]
        
        # Get predicted class index
        predicted_class_idx = np.argmax(probs)
        predicted_class = self.class_names[predicted_class_idx]
        confidence = float(probs[predicted_class_idx])
        
        # Prepare result structure
        result = {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'class_probabilities': {
                class_name: float(prob) 
                for class_name, prob in zip(self.class_names, probs)
            },
            'low_confidence': False
        }
        

            
        # Determine diagnosis and risk level based on class
        if predicted_class == 'malignant':
            result['risk_level'] = "High"
            result['diagnosis'] = "Potential Malignancy Detected. Please consult a specialist immediately."
        elif predicted_class == 'benign':
            result['risk_level'] = "Borderline"
            result['diagnosis'] = "Benign Findings. Likely non-cancerous, but regular screening is advised."
        else: # normal
            result['risk_level'] = "Low"
            result['diagnosis'] = "Normal Ultrasound. No suspicious findings detected."
            
        return result
