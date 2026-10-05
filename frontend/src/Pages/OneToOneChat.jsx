import { useEffect, useState, useCallback, useRef } from 'react'
import { jwtDecode } from "jwt-decode"
import { IoMdSend } from "react-icons/io";
import { io } from "socket.io-client";

const OneToOneChat = ({ contactEmails }) => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://chat-app-backend-three-ashen.vercel.app";

  const socket = io(`${API_URL}`);

  const [user, setUser] = useState(null)
  const [IP, setIP] = useState("")
  const [message, setMessage] = useState("")
  const [chats, setChats] = useState()
  const messageInput = useRef()
  const [sortedChats, setSortedChats] = useState()
  const [chatsDate, setChatsDate] = useState()
  const [sortedChatsWithDate, setSortedChatsWithDate] = useState([])
  const messagesEndRef = useRef()

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
      return messages
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

      const sendData = await send.json()
      console.log("sendData : ", sendData)

      const messages = await fetchUserData()
      console.log("messages from sendMessage : ", messages)
      messageInput.current.value = ""
      // setChats(messages)
      setSortedChatsWithDate([])
      socket.emit("send_message", messages);
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

      const chats3 = chats2.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const uniqueDates = chats3.map((chat, index) => {
        const date = new Date(chat.createdAt)
        const dateOfMonth = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()

        return `${dateOfMonth}/${month}/${year}`
      })

      const uniqueDatesSet = new Set(uniqueDates)

      setChatsDate(uniqueDatesSet)

      setSortedChats(chats3)
    }
  }, [chats])

  useEffect(() => {
    if (chatsDate && sortedChats) {
      console.log("chatsDate : ", chatsDate)
      console.log("sortedChats : ", sortedChats)
      const newChats = []

      for (const date of chatsDate) {
        console.log("date : ", date)
        const splitDate = date.split("/")
        console.log("splitDate : ", splitDate)
        const sameDateChats = sortedChats.filter((chat) => {
          console.log("chat : ", chat)
          const date = new Date(chat.createdAt)
          console.log("date : ", date)
          const dateOfMonth = date.getDate()
          console.log("dateOfMonth : ", dateOfMonth)
          const month = date.getMonth()
          console.log("month : ", month)
          const year = date.getFullYear()
          console.log("year : ", year)

          if (dateOfMonth == splitDate[0] && month == splitDate[1] && year == splitDate[2]) {
            return chat
          }
        })

        newChats.push({ date: date, chats: sameDateChats })

      }

      setSortedChatsWithDate(newChats)
    }
  }, [chatsDate, sortedChats])

  console.log("sortedChatsWithDate : ", sortedChatsWithDate)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [sortedChatsWithDate]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("New chats from receive_message : ", data);
      setChats(data)
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  console.log("chats : ", chats)

  return (
    <div>
      <div className="p-4">

        <table className="table">
          <tbody>
            <tr>
              <th scope="row">From </th>
              <td>{contactEmails?.from}</td>
            </tr>
            <tr className='chat-receiver'>
              <th scope="row">To </th>
              <td>{contactEmails?.to} (You)</td>
            </tr>
          </tbody>
        </table>

        <div>
          {
            sortedChatsWithDate && sortedChatsWithDate.map((chat, index) => {
              const d = chat.date
              const splitDate = d.split("/")

              return <div key={index} className='chats-box'>
                <div className='chats-date'>{splitDate[0]}/{Number(splitDate[1]) + 1}/{splitDate[2]}</div>
                {
                  chat.chats.map((chat2, index) => {
                    const date = new Date(chat2.createdAt)
                    const hour = date.getHours()
                    const minutes = date.getMinutes()

                    return <div key={index} className={`${chat2?.receiver === user?.email ? 'received chat' : 'sent chat'}`}>
                      <div className={`${chat2?.receiver === user?.email ? 'received-chat' : 'sent-chat'}`}>
                        {chat2?.message}
                      </div>
                      <span className='chat-time'>{hour}: {minutes}</span>
                    </div>
                  })
                }
              </div>
            })
          }
        </div>

        <div className='message-input'>
          <input
            onChange={(e) => setMessage(e.target.value)}
            className="border mr-2"
            placeholder="Type a message..."
            ref={messageInput}
          />

          <button
            onClick={
              () => sendMessage(contactEmails?.from, contactEmails?.to, message, contactEmails?.contactTarget)
            }
            className="text-white rounded"
          >
            <IoMdSend />
          </button>
        </div>
      </div>

      <div ref={messagesEndRef} />
    </div >
  );
};

export default OneToOneChat;