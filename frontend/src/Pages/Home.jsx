import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

const Home = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://rental-project-backend.vercel.app";

    const [messages, setMessages] = useState([])
    const [user, setUser] = useState()
    const [IP, setIP] = useState()
    const [newUserEmail, setNewUserEmail] = useState()
    const [showMessage, setShowMessage] = useState(false)

    useEffect(() => {
        getIP()
    }, [])
    const getIP = async () => {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIP(data.ip)
    };

    const loginUser = async () => {
        if (IP !== undefined) {
            const loginUser = await fetch(`${API_URL}/get-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ IP: IP })
            })

            const result = await loginUser.json()
            const decodedUser = result?.jwt ? jwtDecode(result?.jwt) : []
            setUser(decodedUser)
        }
    }

    useEffect(() => {
        loginUser()
    }, [API_URL, IP])

    const addContact = async () => {
        try {
            const getProvidedContact = await fetch(`${API_URL}/get-user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: newUserEmail })
            })

            if (!getProvidedContact.ok) {
                throw new Error("User not available.")
            }

            const result = await getProvidedContact.json()

            const otoContact = await fetch(`${API_URL}/oto-contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ contact1: user, contact2: result })
            })

            setNewUserEmail("")
        }
        catch (err) {
            console.log(`User not available ${err.message}`)
        }
    }

    return (
        <div>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
            <Link to="/ono-chat">One on one chat</Link>

            <h2>Chat App</h2>

            <div>{user?.name}</div> <br /><br />

            <button onClick={() => setShowMessage(true)}>New Contact</button> <br /><br />

            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>

            {showMessage === true
                &&
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Contact</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowMessage(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><input type='email' placeholder='Email' className='w-full outline-[#6c757d] border p-1 rounded-1 border-[#6c757d]' onChange={(e) => setNewUserEmail(e.target.value)} /></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={addContact}>Go</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Home