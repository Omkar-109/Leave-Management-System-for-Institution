import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminView.css';
import Navbar from '../components/navbar';
import AdminNavbar from '../components/AdminNavbar';

const ViewLeaveRecords = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('http://localhost:3000/leaves');
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Error fetching leave records:', error);
      setErrorMsg('Failed to load leave records.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Navbar />
      <AdminNavbar />
      <div className="list-container">
        <h2 className="list-title">Leave Records</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : errorMsg ? (
          <p className="error">{errorMsg}</p>
        ) : (
          <div className="list-wrapper">
            <div className="list-header leave-grid">
              <div>Leave ID</div>
              <div>Employee ID</div>
              <div>Name</div>
              <div>Leave Type</div>
              <div>No. of Days</div>
              <div>From</div>
              <div>To</div>
              <div>Reason</div>
              <div>Created At</div>
              <div>PD Status</div>
              <div>Dean Status</div>
              <div>Overall Status</div>
            </div>
            {leaves.map((leave) => {
              const start = new Date(leave.start_date);
              const end = new Date(leave.end_date);
              const diffTime = Math.abs(end - start);
              const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
                <div key={leave.leave_id} className="list-row leave-grid">
                  <div>{leave.leave_id}</div>
                  <div>{leave.employees_id}</div>
                  <div>{leave.name}</div>
                  <div>{leave.leave_type}</div>
                  <div>{days}</div>
                  <div>{formatDate(leave.start_date)}</div>
                  <div>{formatDate(leave.end_date)}</div>
                  <div>{leave.reason}</div>
                  <div>{formatDate(leave.created_at)}</div>
                  <div>{leave.program_director_status}</div>
                  <div>{leave.dean_status}</div>
                  <div>{leave.status}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewLeaveRecords;
