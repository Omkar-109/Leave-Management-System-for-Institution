import React, { useState, useEffect } from "react";
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

    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setUserCaptcha("");
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!role) {
            alert("Please select your role.");
            return;
        }
        if (parseInt(userCaptcha) !== captcha.answer) {
            alert("Incorrect Captcha. Please try again!");
            return;
        }
        alert(`Login successful for ${email} as ${role}`);
    };

    return (
        <div className="container">
            <div className="title-box">
                <h1>University</h1>
            </div>
            <div className="login-box">
                <h2>LOGIN</h2>
                
                <form onSubmit={handleLogin}>
                <label>Login As</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="">Select Role</option>
                        <option value="Dean">Dean</option>
                        <option value="Program Director">Program Director</option>
                        <option value="Faculty">Faculty</option>
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
                            type="text"
                            placeholder="Answer"
                            value={userCaptcha}
                            onChange={(e) => setUserCaptcha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">LOGIN</button>
                </form>
                <p className="forgot"><a href="#">Forgot password?</a></p>
            </div>
        </div>
    );
};

export default Login;
