import { useState } from 'react'

const NewContact = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://rental-project-backend.vercel.app";

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
        <div>
            <h5 className="modal-title">Add Contact</h5>
            <p><input type='email' placeholder='Email' className='w-full outline-[#6c757d] border p-1 rounded-1 border-[#6c757d]' onChange={(e) => setNewUserEmail(e.target.value)} /></p>
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={addContact}>Go</button>

        </div>
    )
}

export default NewContact