import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Login from "./Pages/Login";

const App = () => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const [IP, setIP] = useState()

  useEffect(() => {
    getIP()
  }, [])
  const getIP = async () => {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    setIP(data.ip)
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}  />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )

}

export default App