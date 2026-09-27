import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";

const App = () => {

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://chat-app-backend-three-ashen.vercel.app";

  

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  )
}

export default App