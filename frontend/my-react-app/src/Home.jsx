import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    useEffect(() => {
        if (!user) {
            navigate("/"); // Redirect to login if no user data is found
        }
    }, [user, navigate]);

    return (
        <div>
            <h1>Welcome, {user ? user.email : "Guest"}!</h1>
            {user && <p>Role: {user.role}</p>}
        </div>
    );
    
};

export default Home;
