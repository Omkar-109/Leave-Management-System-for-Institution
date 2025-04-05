import { NavLink } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  return (
      <div className="adminNavLinks">
        <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/register-pd-dean" className={({ isActive }) => isActive ? 'active' : ''}>
          Register PD / Deans
        </NavLink>
        <NavLink to="/admin/register-employee" className={({ isActive }) => isActive ? 'active' : ''}>
          Register Employee
        </NavLink>
        <NavLink to="/admin/view-employees" className={({ isActive }) => isActive ? 'active' : ''}>
          View All Employees
        </NavLink>
        <NavLink to="/admin/add-program" className={({ isActive }) => isActive ? 'active' : ''}>
          Add Program
        </NavLink>
        <NavLink to="/admin/view-programs" className={({ isActive }) => isActive ? 'active' : ''}>
          View All Programs
        </NavLink>
        <NavLink to="/admin/add-leave-type" className={({ isActive }) => isActive ? 'active' : ''}>
          Add Leave Type
        </NavLink>
        <NavLink to="/admin/view-leave-types" className={({ isActive }) => isActive ? 'active' : ''}>
          View Leave Types
        </NavLink>
        <NavLink to="/admin/view-leave-records" className={({ isActive }) => isActive ? 'active' : ''}>
          View Leave Records
        </NavLink>
      </div>
    
  );
};

export default AdminNavbar;
