import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "./styles/Login.css";
import { FaSyncAlt } from "react-icons/fa";

const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 10;
    const num2 = Math.floor(Math.random() * 10);
    return { question: `${num1} + ${num2} =`, answer: num1 + num2 };
};

const Login = () => {
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [userCaptcha, setUserCaptcha] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    
    const navigate = useNavigate(); // Hook for navigation

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setUserCaptcha("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!role) {
            setError("Please select your role.");
            return;
        }
        if (parseInt(userCaptcha) !== captcha.answer) {
            setError("Incorrect Captcha. Please try again!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", { // Adjust URL if needed
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
                credentials: "include", // Required for session-based authentication
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            navigate("/home", { state: { user: data.user } }); // Redirect to Home without alert

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="container">
            <div className="title-box">
                <h1>University</h1>
            </div>
            <div className="login-box">
                <h2>LOGIN</h2>
                
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleLogin}>
                    <label>Login As</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="">Select Role</option>
                        <option value="Dean">Dean</option>
                        <option value="Program Director">Program Director</option>
                        <option value="Faculty">Employee</option>
                        <option value="Office Admin">Office Admin</option>
                    </select>

                    <label>Email</label>
                    <input 
                        type="email" 
                        placeholder="Enter Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    
                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    
                    <div className="captcha">
                        <FaSyncAlt className="refresh-icon" onClick={refreshCaptcha} />
                        <span>{captcha.question}</span>
                        <input
                            type="number"
                            placeholder="Answer"
                            value={userCaptcha}
                            onChange={(e) => setUserCaptcha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={!email || !password || !role || !userCaptcha}>LOGIN</button>
                </form>
                <p className="forgot"><a href="#">Forgot password?</a></p>
            </div>
        </div>
    );
};

export default Login;
