from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json

# Load model
model = joblib.load("models/xgboost_model.pkl")

# Load training feature names
with open("models/feature_names.json", "r") as f:
    FEATURE_NAMES = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# INPUT SCHEMA (HUMAN)

class CreditInput(BaseModel):
    Age: int
    Credit_amount: float
    Duration: int
    Sex: str                   # male / female
    Job: int                   # 0,1,2,3
    Housing: str               # own / rent / free
    Saving_accounts: str       # little / moderate / rich / unknown
    Purpose: str               # car / education / furniture / radio_TV / repairs


@app.get("/")
def root():
    return {"status": "Backend running successfully"}


# PREPROCESS FUNCTION

def preprocess_input(data: CreditInput):
    raw = data.dict()

    processed = {
        "Age": raw["Age"],
        "Credit amount": raw["Credit_amount"],
        "Duration": raw["Duration"],
        "Job": raw["Job"],
    }

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

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    return {
        "risk": "High Risk" if prediction == 1 else "Low Risk",
        "probability": round(float(probability), 4)
    }
