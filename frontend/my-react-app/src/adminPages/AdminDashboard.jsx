import React, { useEffect, useState } from "react";
import "../styles/adminStats.css";
import axios from "axios";
import Navbar from "../components/navbar";
import AdminNavbar from "../components/AdminNavbar";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3000/admin/stats")
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const cardData = [
    { label: "Total Employees", count: stats.employees },
    { label: "Total Deans", count: stats.deans },
    { label: "Total Progarm Directors", count: stats.pd },
    { label: "Total Programs", count: stats.programs },
    { label: "Total Leave Applications", count: stats.leaves },
  ];

  return (
    <>
    <Navbar/>
    <AdminNavbar/>
    <div className="admin-stats-container">
      {cardData.map((item, index) => (
        <div key={index} className="stat-card">
          <span className="stat-label">{item.label}</span>
          <span className="stat-count">{item.count.toString().padStart(2, "0")}</span>
        </div>
      ))}
    </div>
    </>
  );
};

export default AdminDashboard;
