import React, { useState } from "react";
import "./styles/Login.css";
import { FaSyncAlt } from "react-icons/fa";

const Login = () => {
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [userCaptcha, setUserCaptcha] = useState("");

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 10;
        const num2 = Math.floor(Math.random() * 10);
        return { question: `${num1} + ${num2} =`, answer: num1 + num2 };
    }

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setUserCaptcha("");
    };

    return (
        <div className="container">
             <div className="title-box">
                <h1>University</h1>
            </div>
            <div className="login-box">
                <h2>LOGIN</h2>
                <form>
                    <label>Email</label>
                    <input type="email" placeholder="Enter Email" required />
                    
                    <label>Password</label>
                    <input type="password" placeholder="Enter Password" required />

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
