import { Routes, Route } from "react-router-dom"
import "./App.css"
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import OneToOneChat from "./Pages/OneToOneChat";

const App = () => {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}  />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ono-chat" element={<OneToOneChat />} />
      </Routes>
    </div>
  )

}

export default App