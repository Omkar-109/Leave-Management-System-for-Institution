import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Login from "./Login.jsx";
import ProfilePage from "./profilePage.jsx";
// Import Employee Dashboard
import EmployeeDashboard from "./empPages/EmployeeDashboard.jsx";
import ApplyLeave from "./empPages/ApplyLeave.jsx"; 
import ViewLeaves from "./empPages/ViewLeaves.jsx";

//import pd pages
import PDDashboard from "./pdPages/pd-dashboard.jsx";

//import Dean pages
import DeanDashboard from "./deanPages/dean-dashboard.jsx";

//import admin pages
import AdminDashboard from "./adminPages/AdminDashboard.jsx";
import RegisterPDDean from "./adminPages/RegisterPDDean.jsx"; 
import RegisterEmployee from "./adminPages/RegisterEmployee.jsx";
import ViewEmployees from "./adminPages/ViewEmployees.jsx";
import AddProgram from "./adminPages/AddProgram.jsx";
import ViewPrograms from "./adminPages/ViewPrograms.jsx";
import AddLeaveType from './adminPages/AddLeaveType';
import ViewLeaveTypes from './adminPages/ViewLeaveTypes';
import ViewLeaveRecords from './adminPages/ViewLeaveRecords';

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> 
        <Route path="/apply-leave" element={<ApplyLeave />} /> 
        <Route path="/view-leaves" element={<ViewLeaves />} />

         {/* PD */}
         <Route path="/pd-dashboard" element={<PDDashboard />} />

         {/* Dean */}
         <Route path="/dean-dashboard" element={<DeanDashboard />} />
        {/* admin */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}/>
        <Route path="/admin/register-pd-dean" element={<RegisterPDDean />}/>
        <Route path="/admin/register-employee" element={<RegisterEmployee />}/>
        <Route path="/admin/view-employees" element={<ViewEmployees />} />
        <Route path="/admin/add-program" element={<AddProgram />} />
        <Route path="/admin/view-programs" element={<ViewPrograms />} />
        <Route path="/admin/add-leave-type" element={<AddLeaveType />} />
        <Route path="/admin/view-leave-types" element={<ViewLeaveTypes />} />
        <Route path="/admin/view-leave-records" element={<ViewLeaveRecords />} />
        
        <Route path="profilePage" element={<ProfilePage />}/>
      </Routes>
    </Router>
  </React.StrictMode>
); 