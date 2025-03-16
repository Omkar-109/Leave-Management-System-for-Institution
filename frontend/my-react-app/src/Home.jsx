import React from "react";
import { useLocation } from "react-router-dom";

const Home = () => {
    const location = useLocation();
    const user = location.state?.user;

    return (
        <div>
            <h1>Welcome, {user ? user.email : "Guest"}!</h1>
        </div>
    );
};

export default Home;
