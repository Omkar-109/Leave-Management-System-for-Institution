import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminView.css"; // Reusing same style
import Navbar from "../components/navbar";
import AdminNavbar from "../components/AdminNavbar";

const ViewPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProgram, setEditProgram] = useState(null);
  const [newProgramName, setNewProgramName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:3000/programs");
      setPrograms(res.data.programs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to fetch programs.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/programs/${id}`);
      fetchPrograms();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEdit = (program) => {
    setEditProgram(program);
    setNewProgramName(program.program_name);
  };

  const submitEdit = async () => {
    try {
      await axios.put(`http://localhost:3000/programs/${editProgram.program_id}`, {
        program_name: newProgramName,
      });
      setEditProgram(null);
      setNewProgramName("");
      fetchPrograms();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <>
      <Navbar/>
      <AdminNavbar/>
      <div className="list-container">
      <h2 className="list-title">All Programs</h2>

      {loading ? (
        <p className="loading">Loading programs...</p>
      ) : errorMsg ? (
        <p className="error">{errorMsg}</p>
      ) : (
        <div className="list-wrapper">
          <div className="list-header">
            <div>Program ID</div>
            <div>Program Name</div>
            <div>Created At</div>
            <div>Actions</div>
          </div>

          {programs.map((program) => (
            <div key={program.program_id} className="list-row">
              <div>{program.program_id}</div>
              <div>{program.program_name}</div>
              <div>{program.created_at}</div>
              <div>
                <button
                  onClick={() => handleEdit(program)}
                  className="btn edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(program.program_id)}
                  className="btn delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editProgram && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Edit Program</h3>
            <input
              type="text"
              className="modal-input"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setEditProgram(null)}
              >
                Cancel
              </button>
              <button
                className="btn save"
                onClick={submitEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
    


  );
};

export default ViewPrograms;
