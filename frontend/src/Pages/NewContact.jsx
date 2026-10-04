import { useState } from 'react'

const NewContact = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://chat-app-backend-three-ashen.vercel.app";

    const [newUserEmail, setNewUserEmail] = useState()

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
        <div className="container mt-5">
            <div className='card shadow-sm p-4 mx-auto'
                style={{ maxWidth: "350px" }}
            >
                <h2 className="mb-4">Add Contact</h2>
                <label className="form-label">Email</label>
                <p><input type='email' placeholder='Enter your Email' className='w-full outline-[#6c757d] border p-1 rounded-1 border-[#6c757d]' onChange={(e) => setNewUserEmail(e.target.value)} /></p>
                <button type="button" className="btn !bg-[#0d4663] text-white w-100" data-bs-dismiss="modal" onClick={addContact}>Go</button>
            </div>
        </div>
    )
}

export default NewContact