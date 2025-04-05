import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin.css"; // Make sure this points to your admin.css
import Navbar from "../components/navbar";
import AdminNavbar from "../components/AdminNavbar";

const ViewLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/leave-types");
        setLeaveTypes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leave types:", error);
        setErrorMsg("❌ Failed to fetch leave types. Please try again.");
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  return (
    <>
    <Navbar/>
    <AdminNavbar/>
    <div className="list-container">
      <h2 className="list-title">All Leave Types</h2>

      {loading && <p className="loading">Loading leave types...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      {!loading && leaveTypes.length === 0 && (
        <p className="no-info">No leave types found.</p>
      )}

      {!loading && leaveTypes.length > 0 && (
        <div className="list-wrapper">
          <div className="list-header">
            <div>ID</div>
            <div>Faculty Type</div>
            <div>Leave Type</div>
            <div>No. of Leaves</div>
            <div>Reset Frequency</div>
            <div>Reset Date</div>
            <div>Created At</div>
          </div>

          {leaveTypes.map((type) => (
            <div className="list-row" key={type.leave_type_id}>
              <div>{type.leave_type_id}</div>
              <div>{type.faculty_type}</div>
              <div>{type.leave_type}</div>
              <div>{type.number_of_leaves}</div>
              <div>{type.reset_frequency}</div>
              <div>{new Date(type.reset_date).toLocaleDateString()}</div>
              <div>{new Date(type.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default ViewLeaveTypes;
