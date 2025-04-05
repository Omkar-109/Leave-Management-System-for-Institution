import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/admin.css"; // Adjust if needed

const AddProgram = () => {
  const [programName, setProgramName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post("http://localhost:3000/programs", {
        program_name: programName,
      });

      setSuccessMsg(`✅ ${response.data.message}`);
      setProgramName("");
    } catch (error) {
      console.error("Error adding program:", error);
      setErrorMsg("❌ Failed to add program. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <AdminNavbar />
      <div className="admin-container">
        <h2>Add New Program</h2>

        {successMsg && (
          <p style={{ color: "green", textAlign: "center", marginBottom: "16px" }}>
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "16px" }}>
            {errorMsg}
          </p>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="programName">Program Name</label>
          <input
            type="text"
            id="programName"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Enter program name"
            required
          />

          <button type="submit">Add Program</button>
        </form>
      </div>

    </>
    
  );
};

export default AddProgram;
