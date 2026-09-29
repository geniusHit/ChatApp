import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"

const OneToOneChat = () => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const [user, setUser] = useState()
  const [IP, setIP] = useState()
  const [message, setMessage] = useState("")
  const [allContacts, setAllContacts] = useState()

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
      console.log("result : ", result)
      const decodedUser = result?.jwt ? jwtDecode(result?.jwt) : []
      setUser(decodedUser)
    }
  }

  const sendMessage = async (contact) => {
    const send = await fetch(`${API_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contact: contact, message: message })
    })

    const result = await send.json()
    console.log("result from sendMessage : ", result)

    setMessage("")
  };

  const getContacts = async () => {
    const contacts = await fetch(`${API_URL}/get-contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: user?.email })
    })

    const result = await contacts.json()
    console.log("result : ", result)
    setAllContacts(result)
  }

  useEffect(() => {
    loginUser()
  }, [API_URL, IP])

  useEffect(() => {
    getContacts()
  }, [user])

  console.log("user : ", user)
  console.log("IP : ", IP)
  console.log("allContacts : ", allContacts)
  console.log("message : ", message)

  return (
    <div>
      {allContacts !== undefined && allContacts.map((contact, index) => {
        return <div key={index}>
          <div>{contact?.contact2.name}</div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='border'
          />

          <button onClick={()=> sendMessage(contact)}>
            Send
          </button>
        </div>
      })}
    </div>
  )
}

export default OneToOneChat