# sheHealth-AI

sheHealth-AI is a comprehensive, AI-powered health prediction platform focused on women's health. It utilizes machine learning models to provide predictive insights for various health conditions, accessible through a modern, responsive web interface. 

## 🛠 Tech Stack

### Frontend
* **Framework:** React 18 with TypeScript and Vite
* **Styling & UI:** Tailwind CSS, Shadcn UI, Radix UI primitives
* **Routing:** React Router DOM
* **Animations:** Framer Motion
* **Data Visualization:** Recharts
* **Forms & Validation:** React Hook Form, Zod
* **Testing:** Vitest, React Testing Library

### Backend
* **Framework:** Python with Flask
* **Architecture:** Microservices-based model prediction services
* **CORS:** Flask-CORS for cross-origin resource sharing

## 📦 Project Structure

The project is divided into a frontend web application and multiple independent backend prediction models:

```text
sheHealth-ai/
├── frontend/                              # React/Vite web application
└── backend/
    ├── anemia-backend-model/              # Flask service for Anemia prediction (Port 5003)
    ├── breast-cancer-backend-model/       # Flask service for Breast Cancer prediction
    ├── osteoporosis-backend-model/        # Flask service for Osteoporosis prediction
    ├── pcos-backend-model/                # Flask service for PCOS prediction
    └── thyroid-backend-model/             # Flask service for Thyroid prediction
```

## 🧠 Machine Learning Models

The trained machine learning models (`.pkl` and `.keras` files) are excluded from this repository via `.gitignore` due to their file size. To run the backend prediction services correctly, you **must download the model artifacts** from the link below and place them in their respective `models/` directories.

> [!IMPORTANT]
> Without these model files, the backend services will fail to initialize or provide accurate predictions.

**Download Model Artifacts Here:** [Google Drive - sheHealth Model Files](https://drive.google.com/drive/folders/1KVr-DLNsQhFxKfa3vnjEa6QB7NkukEI1?usp=drive_link)

### Model Placement Guide:
| Backend Service | Model File(s) Required | Target Directory |
| :--- | :--- | :--- |
| **Anemia** | `*.pkl` or `*.joblib` | `backend/anemia-backend-model/models/` |
| **Breast Cancer** | `resnet50_ultrasound_final.keras` | `backend/breast-cancer-backend-model/models/` |
| **Osteoporosis** | `*.pkl` or `*.joblib` | `backend/osteoporosis-backend-model/models/` |
| **PCOS** | `*.pkl` or `*.joblib` | `backend/pcos-backend-model/models/` |
| **Thyroid** | `*.pkl` or `*.joblib` | `backend/thyroid-backend-model/models/` |

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [Python 3.8+](https://www.python.org/)
* `pip` package manager

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup (Example: Anemia Model)

Each model runs as its own standalone Flask service. 

1. Navigate to the specific model's backend directory:
   ```bash
   cd backend/anemia-backend-model
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate  
   # On Windows: 
   venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```
   *Note: The Anemia service runs on `http://0.0.0.0:5003`.*

Repeat these steps for the other model directories (`breast-cancer`, `osteoporosis`, `pcos`, `thyroid`) as needed.

## 🔌 API Reference

### Anemia Prediction API (`/backend/anemia-backend-model/`)

#### Health Check
* **Endpoint:** `/health`
* **Method:** `GET`
* **Description:** Checks if the prediction service is running.
* **Response:**
    ```json
    {
      "status": "running",
      "service": "Anemia Prediction API"
    }
    ```

#### Predict Anemia
* **Endpoint:** `/predict/anemia`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body Requirements:**
    ```json
    {
      "Gender": 1,
      "Hemoglobin": 12.6
      "MCH": 29.0,
      "MCHC": 34.0,
      "MCV": 85.0
    }
    ```
* **Description:** Returns the prediction result based on the provided blood test metrics.

## 🧪 Testing

The frontend includes a testing suite configured with Vitest.

To run tests in watch mode:
```bash
cd frontend
npm run test:watch
```

To run a single test pass:
```bash
npm run test
```