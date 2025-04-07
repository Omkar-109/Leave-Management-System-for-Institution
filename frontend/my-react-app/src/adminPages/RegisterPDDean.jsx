import React, { useState } from "react";
import axios from "axios";
import "../styles/admin.css"; // Import your admin styles here
import Navbar from "../components/navbar";
import AdminNavbar from "../components/AdminNavbar";

const RegisterPDDean = () => {
  const [formData, setFormData] = useState({
    managed_entity_id: "",
    email: "",
    role: "Dean",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const endpoint =
      formData.role === "Dean"
        ? "http://localhost:3000/register-dean"
        : "http://localhost:3000/register-program-director";

    try {
      const response = await axios.post(endpoint, {
        managed_entity_id: formData.managed_entity_id,
        email: formData.email,
      });

      setMessage(`✅ ${formData.role} Registered!`);
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Registration error:", err);
      setError("❌ Registration failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar/>
      <AdminNavbar/>
      <div className="admin-container">
      <h2>Register {formData.role}</h2>

      {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <ul className="admin-form">
        <li>
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Dean">Dean</option>
              <option value="Program Director">Program Director</option>
            </select>
          </li>
          <li>
            <label htmlFor="managed_entity_id">Managed Entity ID</label>
            <input
              type="text"
              name="managed_entity_id"
              id="managed_entity_id"
              value={formData.managed_entity_id}
              onChange={handleChange}
              required
            />
          </li>

          <li>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </li>

          

          <li>
            <button type="submit">Register</button>
          </li>
        </ul>
      </form>
    </div>
    </>
    
  );
};

export default RegisterPDDean;
