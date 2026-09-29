import React, { useEffect, useState, useCallback } from 'react'
import { jwtDecode } from "jwt-decode"
import io from "socket.io-client";

const OneToOneChat = () => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)
  const [IP, setIP] = useState("")
  const [message, setMessage] = useState("")
  const [allContacts, setAllContacts] = useState([])
  const [chats, setChats] = useState([])

  // 1. Initialize socket connection dynamically
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [API_URL]);

  // 2. Fetch IP
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

  // 3. Login user with IP
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

  // 4. Fetch initial contacts & chats
  const fetchUserData = useCallback(async () => {
    if (!user?.email) return;

    try {
      // Get contacts
      const contactsRes = await fetch(`${API_URL}/get-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const contactsData = await contactsRes.json();
      setAllContacts(Array.isArray(contactsData) ? contactsData : []);

      // Get chats
      const chatsRes = await fetch(`${API_URL}/get-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const chatsResult = await chatsRes.json();
      const messages = chatsResult[0]?.contact1?.chats?.map((m) => m) || [];
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

  // 5. Setup WebSocket listener for incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      // If server emits the string or message object, extract text and append
      const msgText = typeof newMsg === "string" ? newMsg : newMsg?.message;
      if (msgText) {
        setChats((prevChats) => [...prevChats, msgText]);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  // 6. Send message handler
  const sendMessage = async (contact) => {
    if (!message.trim()) return;

    try {
      const send = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, message }),
      });

      const result = await send.json();
      console.log("Message sent:", result);

      // Append own message locally or emit via socket if your backend relies on socket.emit
      setChats((prev) => [...prev, message]);
      if (socket) {
        socket.emit("send_message", { contact, message });
      }

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  console.log("chats : ", chats)

  return (
    <div>
      {allContacts?.map((contact, index) => (
        <div key={index} className="p-4 border-b">
          <div className="font-bold">{contact?.contact2?.name}</div>

          <div className="my-2">
            {chats?.map((c, chatIndex) => {
              console.log("c : ", c)
              let messageTime = new Date(c.createdAt);
              console.log("messageTime : ", messageTime);
              console.log(messageTime.getDate());

              return (
                <div key={chatIndex}>{c?.message} {messageTime?.getHours()}:{messageTime?.getMinutes()} {messageTime.getDate()}/{messageTime.getMonth()}/{messageTime.getFullYear()} </div>
              )
            })}
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-1 mr-2"
            placeholder="Type a message..."
          />

          <button
            onClick={() => sendMessage(contact)}
            className="border px-3 py-1 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      ))}
    </div>
  );
};

export default OneToOneChat;