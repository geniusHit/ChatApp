import React, { useEffect, useState, useCallback, useRef } from 'react'
import { jwtDecode } from "jwt-decode"
import { Link } from 'react-router-dom';

const OneToOneChat = () => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const [user, setUser] = useState(null)
  const [IP, setIP] = useState("")
  const [message, setMessage] = useState("")
  const [allContacts, setAllContacts] = useState([])
  const [chats, setChats] = useState([])
  const messageInput = useRef()

  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIP(data.ip);
      } catch (err) {
        console.error("Failed to fetch IP:", err);
      }
    };
    getIP();
  }, []);

  useEffect(() => {

    const loginUser = async () => {
      if (!IP) return;
      try {
        const res = await fetch(`${API_URL}/get-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ IP }),
        });
        const result = await res.json();
        if (result?.jwt) {
          setUser(jwtDecode(result.jwt));
        }
      } catch (err) {
        console.error("Login failed:", err);
      }
    };

    loginUser();
  }, [IP, API_URL]);

  const fetchUserData = useCallback(async () => {
    if (!user?.email) return;

    try {
      const contactsRes = await fetch(`${API_URL}/get-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const contactsData = await contactsRes.json();
      setAllContacts(Array.isArray(contactsData) ? contactsData : []);

      const contactEmails = contactsData.map((c) => {
        return [c?.contact1?.email, c?.contact2?.email]
      })
      const chatsRes = await fetch(`${API_URL}/get-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: contactEmails }),
      });
      const chatsResult = await chatsRes.json();
      const messages = chatsResult.map((chats1) => {
        return (
          [chats1?.contact1?.email, chats1?.contact2?.email, chats1?.contact1?.chats]
        )
      }
      )
      setChats(messages);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const sendMessage = async (contact, message) => {
    try {
      const send = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, message: message?.message }),
      });

      const result = await send.json();

      setChats((prev) => [...prev, message]);
      fetchUserData()
      messageInput.current.value = ""

    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/ono-chat">One on one chat</Link>

      {allContacts?.map((contact, index) => {

        return (
          <div key={index} className="p-4 border-b">
            <div className="font-bold text-secondary">{contact?.contact2?.name}</div>

            <div className="my-2">
              {chats?.map((c, chatIndex) => {
                if (contact?.contact1?.email === c[0] && contact?.contact2?.email === c[1] && c[2].length !== undefined && c[2].length > 0) {
                  return c[2].map((c2, c2Index) => {
                    let messageTime = new Date(c2.createdAt);

                    return (
                      <div key={c2Index} className='text-secondary'>
                        {c2?.message} {messageTime?.getHours()}:{messageTime?.getMinutes()} {messageTime.getDate()}/{messageTime.getMonth()}/{messageTime.getFullYear()}
                      </div>
                    )
                  })
                }
              })}
            </div>

            <input
              onChange={(e) => setMessage(e.target.value)}
              className="border p-1 mr-2"
              placeholder="Type a message..."
              ref={messageInput}
            />

            <button
              onClick={() => sendMessage(contact, { from: contact?.contact1?.email, message: message })}
              className="border px-3 py-1 bg-blue-500 text-white rounded"
            >
              Send
            </button>
          </div>)
      })}
    </div>
  );
};

export default OneToOneChat;