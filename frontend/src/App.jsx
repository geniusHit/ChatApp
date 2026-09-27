import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(`http://localhost:8000`)

const App = () => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://chat-app-backend-three-ashen.vercel.app";

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  console.log("messages : ", messages)

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div>
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

export default App