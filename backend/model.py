
import joblib
import shap
import pandas as pd
from pathlib import Path
import os

CURRENT_DIR = Path(__file__).resolve().parent
BASE_DIR = CURRENT_DIR.parent

MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_model.pkl")
model = joblib.load(MODEL_PATH)

FEATURE_PATH = os.path.join(BASE_DIR, "models", "feature_names.json")
# Feature names from model
FEATURE_NAMES = model.get_booster().feature_names

# SHAP explainer
explainer = shap.TreeExplainer(model)

def generate_human_explanation(shap_dict: dict, risk_label: str) -> str:

    # Sort features by absolute impact
    sorted_features = sorted(
        shap_dict.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    top_features = sorted_features[:3]

    positive = []
    negative = []

    for feature, value in top_features:
        readable = (
            feature.replace("_", " ")
            .replace("Saving accounts", "Savings")
            .replace("Sex", "Gender")
        )

        if value > 0:
            positive.append(readable)
        else:
            negative.append(readable)

    if risk_label == "High Risk":
        explanation = "The applicant is classified as High Risk mainly because "
        explanation += ", ".join(positive) if positive else "several risk-related factors."
        if negative:
            explanation += ". However, " + ", ".join(negative) + " helped reduce the risk slightly."
    else:
        explanation = "The applicant is classified as Low Risk mainly because "
        explanation += ", ".join(negative) if negative else "several protective factors."
        if positive:
            explanation += ". However, " + ", ".join(positive) + " slightly increased the risk."

    return explanation

def predict_with_shap(input_df: pd.DataFrame):
    

    # Ensure correct column order
    input_df = input_df.reindex(columns=FEATURE_NAMES, fill_value=0)

    prediction = int(model.predict(input_df)[0])
    probability = float(model.predict_proba(input_df)[0][1])

    # SHAP values
    shap_values = explainer.shap_values(input_df)

    shap_dict = {
        feature: float(value)
        for feature, value in zip(FEATURE_NAMES, shap_values[0])
    }

    risk_label = "High Risk" if prediction == 1 else "Low Risk"
    explanation = generate_human_explanation(shap_dict, risk_label)

    return {
        "prediction": prediction,
        "probability": probability,
        "shap_values": shap_dict,
        "explanation": explanation,
    }
