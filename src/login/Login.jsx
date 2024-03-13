import React, { useState } from "react";
import img1 from "../draw2.webp";
import { Navigate } from "react-router-dom";

import ygn_logo from "../image/ygn.jpg";

const Login = () => {
  const staticEmail = "yatharthgaje@gmail.com";
  const staticPassword = "Bhamtu@141513";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (email === staticEmail && password === staticPassword) {
      localStorage.setItem("isLoggedIn", true);
      setLoggedIn(true);
    } else {
      setAlertMessage("Incorrect email or password.");
    }
  };

  if (loggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <div className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
        <div className="md:w-1/3 max-w-sm">
          <img src={img1} alt="" />
        </div>
        <div className="md:w-1/3 max-w-sm">
          <div>
            <img src={ygn_logo} alt="YGN" style={{width: "50%", padding: "20px", textAlign: "center", margin: "auto"}}/>
          </div>
          <div className="text-center md:text-left mb-8">
            <label className="mr-1">Sign in with</label>
          </div>

          <input
            className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded"
            type="text"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-center md:text-left">
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider"
              type="submit"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
          {alertMessage && (
            <div className="text-red-500 mt-2">{alertMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
