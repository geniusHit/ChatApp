import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";

const NewContact = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://chat-app-backend-three-ashen.vercel.app";

    const [newUserEmail, setNewUserEmail] = useState()
    const [user, setUser] = useState(null);
    const [IP, setIP] = useState("");

    useEffect(() => {
        const getIP = async () => {
            try {
                const response = await fetch(
                    "https://api.ipify.org?format=json"
                );

                const data = await response.json();
                setIP(data.ip);
            } catch (error) {
                console.error("Failed to fetch IP:", error);
            }
        };

        getIP();
    }, []);

    useEffect(() => {
        const loginUser = async () => {
            if (!IP) return;

            try {
                const response = await fetch(`${API_URL}/get-login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ IP }),
                });

                const result = await response.json();

                if (result?.jwt) {
                    setUser(jwtDecode(result.jwt));
                }
            } catch (error) {
                console.error("Login failed:", error);
            }
        };

        loginUser();
    }, [IP]);

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
                body: JSON.stringify({...user, newUserEmail})
            })

            setNewUserEmail("")
        }
        catch (err) {
            console.log(`User not available ${err.message}`)
        }
    }

    return (
        <div className="container mt-5">
            <div className='card shadow-sm p-4 mx-auto'
                style={{ maxWidth: "350px" }}
            >
                <h2 className="mb-4">Add Contact</h2>
                <label className="form-label">Email</label>
                <p><input type='email' placeholder='Enter your Email' className='w-full outline-[#6c757d] border p-1 rounded-1 border-[#6c757d]' onChange={(e) => setNewUserEmail(e.target.value)} /></p>
                <button type="button" className="btn !bg-[#0d4663] text-white w-100" onClick={addContact}>Go</button>
            </div>
        </div>
    )
}

export default NewContact