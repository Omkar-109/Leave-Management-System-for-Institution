import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import axios from "axios";
import "./styles/ProfilePage.css";

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;

                if (user.role === "employee") {
                    response = await axios.get(`http://localhost:3000/employee/${user.id}`);
                    setUserData(response.data.employee);
                } else if (user.role === "program_director") {
                    response = await axios.get(`http://localhost:3000/program-director/${user.id}`);
                    setUserData(response.data.program_director);
                } else if (user.role === "dean") {
                    response = await axios.get(`http://localhost:3000/dean/${user.id}`);
                    setUserData(response.data.dean);
                } else if (user.role === "office_admin") {
                    response = await axios.get(`http://localhost:3000/admin/${user.id}`);
                    setUserData(response.data.admin);
                } else {
                    throw new Error("Invalid user role.");
                }
            } catch (err) {
                setError("Failed to load profile data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, user.role]);

    if (loading) return <div className="profile-container"><Navbar /><p>Loading profile...</p></div>;
    if (error) return <div className="profile-container"><Navbar /><p>{error}</p></div>;

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-card">
                <h2 className="profile-heading">👤 My Profile</h2>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <td>ID</td>
                            <td>{userData.employees_id || userData.id}</td>
                        </tr>
                        <tr>
                            <td>Name</td>
                            <td>{userData.name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>{userData.email}</td>
                        </tr>
                        <tr>
                            <td>Role</td>
                            <td>{user.role.replace("_", " ")}</td>
                        </tr>
                        {user.role === "employee" && (
                            <>
                                <tr>
                                    <td>Date of Joining</td>
                                    <td>{userData.date_of_joining?.split("T")[0]}</td>
                                </tr>
                                <tr>
                                    <td>Addresses</td>
                                    <td>
                                        <ul>
                                            {userData.addresses.map((addr, idx) => (
                                                <li key={idx}>{addr}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Phones</td>
                                    <td>
                                        <ul>
                                            {userData.phones.map((phone, idx) => (
                                                <li key={idx}>{phone}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfilePage;
