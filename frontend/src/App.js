import React, { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    Age: "",
    Credit_amount: "",
    Duration: "",
    Sex: "male",
    Job: 1,
    Housing: "rent",
    Saving_accounts: "moderate",
    Purpose: "car"
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Backend not reachable");
    }
  };

  return (
    <div className="container">
      <h1>Credit Risk Prediction</h1>

      <div className="form-row">
        <label>Age</label>
        <input name="Age" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Credit Amount</label>
        <input name="Credit_amount" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Duration (months)</label>
        <input name="Duration" onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Gender</label>
        <select name="Sex" onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="form-row">
        <label>Job Type</label>
        <select name="Job" onChange={handleChange}>
          <option value="0">Unskilled</option>
          <option value="1">Skilled</option>
          <option value="2">Highly Skilled</option>
          <option value="3">Management</option>
        </select>
      </div>

      <div className="form-row">
        <label>Housing</label>
        <select name="Housing" onChange={handleChange}>
          <option value="own">Own</option>
          <option value="rent">Rent</option>
          <option value="free">Free</option>
        </select>
      </div>

      <div className="form-row">
        <label>Savings Account</label>
        <select name="Saving_accounts" onChange={handleChange}>
          <option value="little">Little</option>
          <option value="moderate">Moderate</option>
          <option value="rich">Rich</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className="form-row">
        <label>Purpose</label>
        <select name="Purpose" onChange={handleChange}>
          <option value="car">Car</option>
          <option value="education">Education</option>
          <option value="furniture/equipment">Furniture</option>
          <option value="radio/TV">Radio / TV</option>
          <option value="repairs">Repairs</option>
        </select>
      </div>

      <button className="predict-btn" onClick={handleSubmit}>
        Predict
      </button>

      {result && (
        <div
          className={`result ${
            result.risk === "Low Risk" ? "low-risk" : "high-risk"
          }`}
        >
          <h2>{result.risk}</h2>
          <p>Probability: {result.probability}</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
