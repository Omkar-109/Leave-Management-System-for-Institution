import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminView.css';
import Navbar from '../components/navbar';
import AdminNavbar from '../components/AdminNavbar';

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3000/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorMsg('Failed to load employee data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <AdminNavbar />
      <div className="list-container">
        <h2 className="list-title">Employee List</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : errorMsg ? (
          <p className="error">{errorMsg}</p>
        ) : (
          <div className="list-wrapper">
            <div className="list-header">
              <div>Name</div>
              <div>Employee ID</div>
              <div>Email</div>
              <div>Date of Joining</div>
              <div>Addresses</div>
              <div>Phone Numbers</div>
            </div>
            {employees.map((emp) => (
              <div key={emp.employees_id} className="list-row">
                <div>{emp.name}</div>
                <div>{emp.employees_id}</div>
                <div>{emp.email}</div>
                <div>{emp.date_of_joining}</div>
                <div>
                  {emp.addresses.length > 0 ? (
                    <ul>
                      {emp.addresses.map((addr, i) => (
                        <li key={i}>{addr}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-info">No address info</span>
                  )}
                </div>
                <div>
                  {emp.phones.length > 0 ? (
                    <ul>
                      {emp.phones.map((phone, i) => (
                        <li key={i}>{phone}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-info">No phone info</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewEmployees;
