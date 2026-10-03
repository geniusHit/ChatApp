import { useEffect, useState, useCallback, useRef } from 'react'
import { jwtDecode } from "jwt-decode"

const OneToOneChat = ({ contactEmails }) => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const [user, setUser] = useState(null)
  const [IP, setIP] = useState("")
  const [message, setMessage] = useState("")
  const [chats, setChats] = useState()
  const messageInput = useRef()
  const [sortedChats, setSortedChats] = useState()

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
    if (!user?.email || !contactEmails?.to) return;

    try {
      const chatsRes = await fetch(`${API_URL}/get-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactEmails),
      });
      const chatsResult = await chatsRes.json();
      const messages = {
        from: {
          email: chatsResult[0]?.contact1?.email,
          name: chatsResult[0]?.contact1?.name,
          chats: chatsResult[0]?.contact1?.chats,
        },
        to: {
          email: chatsResult[0]?.contact2?.email,
          name: chatsResult[0]?.contact2?.name,
          chats: chatsResult[0]?.contact2?.chats,
        }
      }

      setChats(messages);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    }

  }, [user, API_URL, contactEmails?.from, contactEmails?.to]);

  useEffect(() => {
    if (user && contactEmails?.to) {
      fetchUserData();
    }

  }, [user, contactEmails?.to, fetchUserData]);

  const sendMessage = async (from, to, message, contactTarget) => {
    try {
      const send = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: from, to: to, message: message, contactTarget: contactTarget }),
      });

      fetchUserData()
      messageInput.current.value = ""

    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  useEffect(() => {
    if (chats) {
      const chats2 = [
        ...(chats?.from?.chats ?? []).map((c) => ({
          ...c,
          receiver: chats?.to?.email
        })),
        ...(chats?.to?.chats ?? []).map((c) => ({
          ...c,
          receiver: chats?.from?.email
        }))
      ];

      setSortedChats(chats2)
    }
  }, [chats])

  const logout = async () => {

  }

  return (
    <div>
      <div className="p-4">
        <div className="my-2">
          <div>From: {contactEmails?.from}</div>
          <div>To: {contactEmails?.to}</div>
        </div>

        <div>
          {
            sortedChats && sortedChats.map((chat, index) => {
              return <div key={index} className={`${chat?.receiver === user?.email ? 'text-left' : 'text-right'}`}>
                {chat?.message}
              </div>
            })
          }
        </div>

        <input
          onChange={(e) => setMessage(e.target.value)}
          className="border p-1 mr-2"
          placeholder="Type a message..."
          ref={messageInput}
        />

        <button
          onClick={
            () => sendMessage(contactEmails?.from, contactEmails?.to, message, contactEmails?.contactTarget)
          }
          className="border px-3 py-1 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default OneToOneChat;