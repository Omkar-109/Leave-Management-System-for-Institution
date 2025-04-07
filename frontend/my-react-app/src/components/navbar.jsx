import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("User");
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchName = async () => {
            try {
                const userData = localStorage.getItem("user");
                if (!userData) {
                    setErrorMsg("No user data found.");
                    return;
                }

                const user = JSON.parse(userData);
                const { id, role } = user;

                if (!id || !role) {
                    setErrorMsg("Invalid user data.");
                    return;
                }

                let url = "";
                if (role === "employee") {
                    url = `http://localhost:3000/employee/${id}`;
                } else if (role === "program_director") {
                    url = `http://localhost:3000/program-director/${id}`;
                } else if (role === "dean") {
                    url = `http://localhost:3000/dean/${id}`;
                } else if (role === "office_admin") {
                    url = `http://localhost:3000/admin/${id}`;
                } else {
                    setErrorMsg("Unknown role.");
                    return;
                }

                const response = await axios.get(url);
                const data = response.data;

                if (data?.employee?.name) setName(data.employee.name);
                else if (data?.program_director?.name) setName(data.program_director.name);
                else if (data?.dean?.name) setName(data.dean.name);
                else if (data?.admin?.name) setName(data.admin.name);
                else setErrorMsg("Name not found.");

            } catch (error) {
                console.error("Error fetching user name:", error);
                setErrorMsg("Failed to fetch user name.");
            } finally {
                setLoading(false);
            }
        };

        fetchName();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">University</div>

            <div className="navbar-user">
                <button
                    className="user-btn"
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                    {loading
                        ? "Loading..."
                        : errorMsg
                            ? "User"
                            : name
                    } ▼
                </button>

                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate("/profilePage")}>View Profile</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
