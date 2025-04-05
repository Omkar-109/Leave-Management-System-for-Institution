import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import AdminNavbar from '../components/AdminNavbar';

const AddLeaveType = () => {
  const [formData, setFormData] = useState({
    faculty_type: '',
    leave_type: '',
    number_of_leaves: '',
    reset_frequency: '',
    reset_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await axios.post('http://localhost:3000/leave-types', formData);
      setSuccessMsg(res.data.message);
      setFormData({
        faculty_type: '',
        leave_type: '',
        number_of_leaves: '',
        reset_frequency: '',
        reset_date: ''
      });
    } catch (error) {
      console.error('Error adding leave type:', error);
      setErrorMsg('Failed to add leave type.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <AdminNavbar />

      <div className='admin-container'>
        <h2>Add Leave Type</h2>

        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Faculty Type:</label><br />
            <input
              type="text"
              name="faculty_type"
              value={formData.faculty_type}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Leave Type:</label><br />
            <input
              type="text"
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Number of Leaves:</label><br />
            <input
              type="number"
              name="number_of_leaves"
              value={formData.number_of_leaves}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Reset Frequency (e.g., Yearly, Monthly):</label><br />
            <input
              type="text"
              name="reset_frequency"
              value={formData.reset_frequency}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Reset Date (optional):</label><br />
            <input
              type="date"
              name="reset_date"
              value={formData.reset_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Adding...' : 'Add Leave Type'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddLeaveType;
