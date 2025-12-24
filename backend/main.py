from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from pathlib import Path

from .schemas import CreditInput
from .model import predict_with_shap

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load training feature names
FEATURE_PATH = BASE_DIR / "models" / "feature_names.json"
with open(FEATURE_PATH, "r") as f:
    FEATURE_NAMES = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "Backend running successfully"}


def preprocess_input(data: CreditInput) -> pd.DataFrame:
    raw = data.dict()

    processed = {
        "Age": raw["Age"],
        "Credit amount": raw["Credit_amount"],
        "Duration": raw["Duration"],
        "Job": raw["Job"],
    }

    # One-hot encoding
    processed[f"Sex_{raw['Sex']}"] = 1
    processed[f"Housing_{raw['Housing']}"] = 1
    processed[f"Saving accounts_{raw['Saving_accounts']}"] = 1
    processed[f"Purpose_{raw['Purpose']}"] = 1

    # Align exactly with training features
    final_input = {
        feature: processed.get(feature, 0)
        for feature in FEATURE_NAMES
    }

    return pd.DataFrame([final_input])

# PREDICTION ENDPOINT

@app.post("/predict")
def predict_risk(data: CreditInput):
    input_df = preprocess_input(data)

    result = predict_with_shap(input_df)

    return {
        "risk": "High Risk" if result["prediction"] == 1 else "Low Risk",
        "probability": round(result["probability"], 4),
        "shap_values": result["shap_values"]
    }
