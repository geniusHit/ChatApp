import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

const Home = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://rental-project-backend.vercel.app";

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [user, setUser] = useState()
    const [IP, setIP] = useState()

    useEffect(() => {
        getIP()
    }, [])
    const getIP = async () => {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIP(data.ip)
    };

    const sendMessage = () => {
        setMessages((prev) => [...prev, message]);
    };

    const loginUser = async () => {
        if (IP !== undefined) {
            const loginUser = await fetch(`${API_URL}/get-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({IP: IP})
            })

            const result = await loginUser.json()
            console.log("result : ", result)
            const decodedUser = jwtDecode(result?.jwt)
            setUser(decodedUser)
        }
    }

    console.log("IP : ", IP)

    useEffect(() => {
        loginUser()
    }, [API_URL, IP])

    console.log("user : ", user)

    return (
        <div>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>

            <h2>Chat App</h2>

            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={sendMessage}>
                Send
            </button>
        </div>
    )
}

export default Home