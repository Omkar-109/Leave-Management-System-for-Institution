import React, { useEffect, useState } from "react";
import "../styles/Employee.css";

const ViewLeaves = () => {
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        const fetchLeaves = async () => {
            const response = await fetch("http://localhost:3000/my-leaves", { credentials: "include" });
            const data = await response.json();
            setLeaves(data);
        };

        fetchLeaves();
    }, []);

    return (
        <div className="container">
            <div className="table-container">
                <h2>My Leave Applications</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Leave ID</th>
                            <th>Type</th>
                            <th>No. of Days</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status (PD)</th>
                            <th>Status (Dean)</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map((leave) => (
                            <tr key={leave.leave_id}>
                                <td>{leave.leave_id}</td>
                                <td>{leave.leaveType}</td>
                                <td>{leave.noOfDays}</td>
                                <td>{leave.fromDate}</td>
                                <td>{leave.toDate}</td>
                                <td>{leave.pdStatus}</td>
                                <td>{leave.deanStatus}</td>
                                <td>{leave.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewLeaves;
