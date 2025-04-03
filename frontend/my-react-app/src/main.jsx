import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import EmployeeDashboard from "./EmployeeDashboard.jsx";
import ApplyLeave from "./ApplyLeave.jsx"; // Import Employee Dashboard

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> 
        <Route path="/apply-leave" element={<ApplyLeave />} /> 
      </Routes>
    </Router>
  </React.StrictMode>
);