import React, {useState} from 'react'
import { Link, Routes, Route } from "react-router-dom"

const Home = () => {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])

    const sendMessage = () => {
        setMessages((prev) => [...prev, message]);
    };

    return (
        <div>
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