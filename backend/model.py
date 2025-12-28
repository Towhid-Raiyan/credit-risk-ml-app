
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


def predict_with_shap(input_df: pd.DataFrame):
    """
    Predict risk and compute SHAP values
    """

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

    return {
        "prediction": prediction,
        "probability": probability,
        "shap_values": shap_dict
    }
