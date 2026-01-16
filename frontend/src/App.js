import React, { useState } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function App() {
  const [formData, setFormData] = useState({
    Age: "",
    Credit_amount: "",
    Duration: "",
    Sex: "male",
    Job: "0",
    Housing: "own",
    Saving_accounts: "unknown",
    Purpose: "car",
  });

  const [result, setResult] = useState(null);
  const [shapData, setShapData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setExplanation("");
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          Age: Number(formData.Age),
          Credit_amount: Number(formData.Credit_amount),
          Duration: Number(formData.Duration),
          Job: Number(formData.Job),
        }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      setResult(data);
      setExplanation(data.explanation || "");


      const shapArray = Object.entries(data.shap_values)
        .map(([key, value]) => ({
          feature: key,
          impact: value,
        }))
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 10);

      setShapData(shapArray);
    } catch (err) {
      setError("Backend not reachable or invalid input");
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };

  return (
    <div className="container">
      <h1>Credit Risk Prediction</h1>

      <div className="main-layout">
        {/* LEFT PANEL */}
        <div className="card">
          <div className="grid">
            <label>Age</label>
            <input name="Age" value={formData.Age} onChange={handleChange} />

            <label>Credit Amount</label>
            <input
              name="Credit_amount"
              value={formData.Credit_amount}
              onChange={handleChange}
            />

            <label>Duration (months)</label>
            <input
              name="Duration"
              value={formData.Duration}
              onChange={handleChange}
            />

            <label>Sex</label>
            <select name="Sex" value={formData.Sex} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <label>Job</label>
            <select name="Job" value={formData.Job} onChange={handleChange}>
              <option value="0">Unskilled</option>
              <option value="1">Skilled</option>
              <option value="2">Highly Skilled</option>
              <option value="3">Management</option>
            </select>

            <label>Housing</label>
            <select name="Housing" value={formData.Housing} onChange={handleChange}>
              <option value="own">Own</option>
              <option value="rent">Rent</option>
              <option value="free">Free</option>
            </select>

            <label>Saving Accounts</label>
            <select
              name="Saving_accounts"
              value={formData.Saving_accounts}
              onChange={handleChange}
            >
              <option value="unknown">Unknown</option>
              <option value="little">Little</option>
              <option value="moderate">Moderate</option>
              <option value="rich">Rich</option>
            </select>

            <label>Purpose</label>
            <select name="Purpose" value={formData.Purpose} onChange={handleChange}>
              <option value="car">Car</option>
              <option value="education">Education</option>
              <option value="furniture">Furniture</option>
              <option value="radio/TV">Radio/TV</option>
              <option value="repairs">Repairs</option>
            </select>
          </div>

          <button className="predict-btn" onClick={handleSubmit}>
            Predict Risk
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {/* RIGHT PANEL */}
        <div className="result-card">
          {!result && !loading && (
            <p className="result-placeholder">
              Result will appear here
            </p>
          )}

          {loading && (
            <div className="loader">
              <div className="spinner"></div>
              <p>Analyzing...</p>
            </div>
          )}

          {result && !loading && (
            <>
              <h2
                className={
                  result.risk === "High Risk" ? "risk-high" : "risk-low"
                }
              >
                {result.risk}
              </h2>

              <p>Probability: {result.probability}</p>

              <h3>Why this decision?</h3>

              {explanation && (
                <div className="explanation-box">
                  <p>{explanation}</p>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shapData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={140} />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#8884d8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
