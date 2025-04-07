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
                } else {
                    // For Dean, PD, or Admin — mock data for now, or fetch from DB when ready
                    setUserData({
                        id: user.id,
                        role: user.role.replace("_", " "),
                        email: user.id + "@university.edu"
                    });
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

    if (loading) return <div className="profile-container"><Navbar /><p>Loading...</p></div>;
    if (error) return <div className="profile-container"><Navbar /><p>{error}</p></div>;

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-box">
                <h2>My Profile</h2>
                <table>
                    <tbody>
                        <tr>
                            <td><strong>ID</strong></td>
                            <td>{userData.employees_id || userData.id}</td>
                        </tr>
                        <tr>
                            <td><strong>Name</strong></td>
                            <td>{userData.name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td><strong>Email</strong></td>
                            <td>{userData.email}</td>
                        </tr>
                        <tr>
                            <td><strong>Role</strong></td>
                            <td>{user.role.replace("_", " ")}</td>
                        </tr>
                        {user.role === "employee" && (
                            <>
                                <tr>
                                    <td><strong>Date of Joining</strong></td>
                                    <td>{userData.date_of_joining?.split("T")[0]}</td>
                                </tr>
                                <tr>
                                    <td><strong>Addresses</strong></td>
                                    <td>
                                        <ul>{userData.addresses.map((addr, idx) => <li key={idx}>{addr}</li>)}</ul>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Phones</strong></td>
                                    <td>
                                        <ul>{userData.phones.map((phone, idx) => <li key={idx}>{phone}</li>)}</ul>
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
