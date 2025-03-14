import React from "react";
import "./Login.css"; // Import CSS for styling

const Login = () => {
    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <form>
                    <input type="email" placeholder="Email" required />
                    <input type="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#">Sign Up</a></p>
            </div>
        </div>
    );
};

export default Login;
