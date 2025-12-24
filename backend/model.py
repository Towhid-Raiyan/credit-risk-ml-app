import joblib
import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "xgboost_model.pkl"
)

model = joblib.load(MODEL_PATH)