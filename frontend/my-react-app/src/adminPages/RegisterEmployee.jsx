import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import AdminNavbar from '../components/AdminNavbar';
import "../styles/admin.css"

const RegisterEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date_of_joining: '',
    program_id:''
  });

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    // Fetch programs from backend
    axios.get('http://localhost:3000/programs')
      .then(res => setPrograms(res.data.programs))
      .catch(err => console.error('Failed to fetch programs:', err));
  }, []);


  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setGeneratedPassword('');

    try {
      const res = await axios.post('http://localhost:3000/register-employee', formData);
      setSuccessMsg('Employee registered successfully!');
      setGeneratedPassword(`Generated password: ${res.data.password}`);
      setFormData({ name: '', email: '', date_of_joining: '' });
    } catch (error) {
      console.error('Error registering employee:', error);
      setErrorMsg('Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <AdminNavbar />

      <div className='admin-container'>
        <h2>Register New Employee</h2>

        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        {generatedPassword && <p>{generatedPassword}</p>}
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Full Name:</label><br />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Email Address:</label><br />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Date of Joining:</label><br />
            <input
              type="date"
              name="date_of_joining"
              value={formData.date_of_joining}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div>
            <label>Select Program:</label><br />
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              required
            
            >
              <option value="">-- Select Program --</option>
              {programs.map((prog) => (
                <option key={prog.program_id} value={prog.program_id}>
                  {prog.program_name}
                </option>
              ))}
            </select>
          </div>


          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Registering...' : 'Register Employee'}
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterEmployee;
