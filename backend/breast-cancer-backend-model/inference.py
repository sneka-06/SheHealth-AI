
import os
import sys
import json
import zipfile
import h5py
import numpy as np
import tensorflow as tf
import keras
from PIL import Image
import io

# === Keras 3 Compatibility Patches ===

# 1. Patch for Keras 3 module path mismatch
try:
    import keras.src.models.functional as functional
    sys.modules['keras.src.engine.functional'] = functional
except ImportError:
    pass

# 2. Monkeypatch BatchNormalization to handle legacy axis=[3] format
from keras.layers import BatchNormalization
original_bn_init = BatchNormalization.__init__

def patched_bn_init(self, *args, **kwargs):
    if 'axis' in kwargs and isinstance(kwargs['axis'], list):
        # Convert list [3] or [1] to integer
        kwargs['axis'] = kwargs['axis'][0]
    return original_bn_init(self, *args, **kwargs)

BatchNormalization.__init__ = patched_bn_init

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
        """Load trained model using a robust manual reconstruction approach"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
        try:
            # First attempt standard loading
            self.model = keras.models.load_model(self.model_path, compile=False)
            print("Successfully loaded model using standard load_model")
        except Exception as e:
            print(f"Standard load_model failed: {e}. Attempting manual reconstruction...")
            self._manual_load_model()

    def _manual_load_model(self):
        """Manually reconstruct model from .keras zip contents"""
        temp_dir = os.path.join(os.path.dirname(self.model_path), "temp_load")
        if os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir, exist_ok=True)
        
        try:
            with zipfile.ZipFile(self.model_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            config_path = os.path.join(temp_dir, "config.json")
            weights_path = os.path.join(temp_dir, "model.weights.h5")
            
            if not os.path.exists(config_path) or not os.path.exists(weights_path):
                raise FileNotFoundError("Required files (config.json, model.weights.h5) not found in .keras archive")

            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Fix config module paths
            config_str = json.dumps(config).replace("keras.src.engine.functional", "keras.src.models.functional")
            config = json.loads(config_str)
            
            # Remove compile_config if it exists to avoid optimizer mismatches
            if 'compile_config' in config:
                del config['compile_config']
            
            # Reconstruct model from config
            self.model = keras.models.model_from_json(json.dumps(config))
            
            # Load weights manually by type and order
            self._load_weights_by_type_and_order(weights_path)
            
            print("Successfully reconstructed model manually")
            
        except Exception as e:
            print(f"Manual reconstruction failed: {e}")
            raise e
        finally:
            # Cleanup temp directory
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    def _load_weights_by_type_and_order(self, h5_path):
        """Load weights from H5 file by matching layer types and order"""
        import re
        def natural_key(string_):
            return [int(s) if s.isdigit() else s for s in re.split(r'(\d+)', string_)]

        with h5py.File(h5_path, 'r') as f:
            # Group keys in H5 by base type (e.g., 'conv2d', 'batch_normalization')
            h5_groups_by_type = {}
            for key in f.keys():
                if key.startswith('layers\\') or key.startswith('layers/'):
                    # Check if it has non-empty vars
                    if 'vars' in f[key] and len(f[key]['vars'].keys()) > 0:
                        # Extract base type from key, e.g., 'layers\conv2d_1' -> 'conv2d'
                        base_name = key.replace('layers\\', '').replace('layers/', '')
                        base_type = re.sub(r'_\d+$', '', base_name)
                        
                        if base_type not in h5_groups_by_type:
                            h5_groups_by_type[base_type] = []
                        h5_groups_by_type[base_type].append(key)
            
            # Sort keys within each type naturally
            for t in h5_groups_by_type:
                h5_groups_by_type[t].sort(key=natural_key)

            # Map Keras layer classes to H5 base types
            # Note: H5 uses lowercase names like 'conv2d', 'batch_normalization'
            class_to_h5_type = {
                'Conv2D': 'conv2d',
                'BatchNormalization': 'batch_normalization',
                'Dense': 'dense',
                'DepthwiseConv2D': 'depthwise_conv2d'
            }

            # Group model layers by their identified H5 type
            model_layers_by_type = {}
            for layer in self.model.layers:
                if len(layer.weights) > 0:
                    layer_class = layer.__class__.__name__
                    h5_type = class_to_h5_type.get(layer_class)
                    if h5_type:
                        if h5_type not in model_layers_by_type:
                            model_layers_by_type[h5_type] = []
                        model_layers_by_type[h5_type].append(layer)
            
            # Perform mapping for each type
            print("Type-based weight mapping:")
            for h5_type, layers in model_layers_by_type.items():
                groups = h5_groups_by_type.get(h5_type, [])
                print(f"  Type '{h5_type}': {len(layers)} layers, {len(groups)} weight groups.")
                
                for i, layer in enumerate(layers):
                    if i < len(groups):
                        group_name = groups[i]
                        group = f[group_name]['vars']
                        var_keys = sorted(group.keys(), key=natural_key)
                        weights = [np.array(group[k]) for k in var_keys]
                        
                        try:
                            layer.set_weights(weights)
                        except Exception as e:
                            print(f"    Failed to map {layer.name} <-> {group_name}: {e}")
                    else:
                        print(f"    WARNING: No weight group for layer {layer.name} (index {i})")

    def preprocess_image(self, image_bytes):
        """
        Preprocess image bytes for prediction
        """
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize(self.img_size)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    
    def is_valid_ultrasound(self, image):
        """
        Check if the image is likely an ultrasound (grayscale).
        """
        img_array = np.array(image)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
            diff_rg = np.mean(np.abs(r - g))
            diff_rb = np.mean(np.abs(r - b))
            diff_gb = np.mean(np.abs(g - b))
            avg_diff = (diff_rg + diff_rb + diff_gb) / 3.0
            if avg_diff > 15:
                return False, f"Image detected as non-medical (Color variance: {avg_diff:.1f})."
        
        if len(img_array.shape) == 3:
            gray_img = np.mean(img_array, axis=2)
        else:
            gray_img = img_array
            
        mean_intensity = np.mean(gray_img)
        std_intensity = np.std(gray_img)
        if mean_intensity > 150:
             return False, f"Image is too bright ({mean_intensity:.1f})."
        if std_intensity < 15:
            return False, f"Image is too flat ({std_intensity:.1f})."
        return True, ""

    def predict(self, image_bytes):
        """
        Make prediction on image bytes
        """
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
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

        img_resized = img.resize(self.img_size)
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        if self.model is None:
            raise RuntimeError("Model not loaded.")
        predictions = self.model.predict(img_array, verbose=0)
        
        probs = predictions[0]
        predicted_class_idx = np.argmax(probs)
        predicted_class = self.class_names[predicted_class_idx]
        confidence = float(probs[predicted_class_idx])
        
        result = {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'class_probabilities': {
                name: float(p) for name, p in zip(self.class_names, probs)
            },
            'low_confidence': False
        }
        
        if predicted_class == 'malignant':
            result['risk_level'] = "High"
            result['diagnosis'] = "Potential Malignancy Detected."
        elif predicted_class == 'benign':
            result['risk_level'] = "Borderline"
            result['diagnosis'] = "Benign Findings."
        else: # normal
            result['risk_level'] = "Low"
            result['diagnosis'] = "Normal Ultrasound."
            
        return result