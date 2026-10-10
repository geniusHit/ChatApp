import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";

import { jwtDecode } from "jwt-decode";
import { IoMdSend } from "react-icons/io";
import { io } from "socket.io-client";
import { FaDeleteLeft } from "react-icons/fa6";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://chat-app-backend-three-ashen.vercel.app";

const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true,
});

const OneToOneChat = ({ contactEmails }) => {
  const [user, setUser] = useState(null);
  const [IP, setIP] = useState("");
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(null);
  const [sortedChats, setSortedChats] = useState([]);
  const [chatsDate, setChatsDate] = useState([]);
  const [sortedChatsWithDate, setSortedChatsWithDate] = useState([]);
  const [fromChats, setFromChats] = useState()
  const [toChats, setToChats] = useState()

  const messageInput = useRef(null);

  const previousScrollTop = useRef(0);
  const restoreScroll = useRef(false);

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

  const fetchUserData = useCallback(async () => {
    if (!user?.email || !contactEmails?.to) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/get-chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactEmails),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const result = await response.json();
      console.log("result : ", result)

      const messages = {
        from: {
          email: result?.chats?.[0]?.contact1?.email,
          name: result?.chats?.[0]?.contact1?.name,
          chats: result?.chats?.[0]?.contact1?.chats ?? [],
        },
        to: {
          email: result?.chats?.[0]?.contact2?.email,
          name: result?.chats?.[0]?.contact2?.name,
          chats: result?.chats?.[0]?.contact2?.chats ?? [],
        },
      };

      setChats(messages);
      setFromChats(result?.fromChats)
      setToChats(result?.toChats)

      return messages;
    } catch (error) {
      console.error("Error fetching chat data:", error);
      return null;
    }
  }, [user?.email, contactEmails]);

  console.log("fromChats : ", fromChats)
  console.log("toChats : ", toChats)

  useEffect(() => {
    if (user && contactEmails?.to) {
      fetchUserData();
    }
  }, [user, contactEmails?.to, fetchUserData]);

  const sendMessage = async (
    from,
    to,
    messageText,
    contactTarget
  ) => {
    if (!messageText?.trim()) return;

    try {
      const response = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          message: messageText,
          contactTarget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const updatedMessages = await fetchUserData();

      if (messageInput.current) {
        messageInput.current.value = "";
      }

      setMessage("");

      if (updatedMessages) {
        socket.emit("send_message", updatedMessages);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (!chats) return;

    const allChats = [
      ...(fromChats[0]?.contact1?.chats ?? []).map((chat) => ({
        ...chat,
        receiver: fromChats[0]?.contact1?.email,
      })),

      ...(toChats[0]?.contact2?.chats ?? []).map((chat) => ({
        ...chat,
        receiver: toChats[0]?.contact2?.email,
      })),
    ];

    allChats.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    console.log("allChats : ", allChats)

    const uniqueDates = [
      ...new Set(
        allChats.map((chat) => {
          const date = new Date(chat.createdAt);

          return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
        })
      ),
    ];

    console.log("uniqueDates : ", uniqueDates)

    setChatsDate(uniqueDates);
    setSortedChats(allChats);
  }, [chats, fromChats, toChats]);

  useEffect(() => {
    const groupedChats = chatsDate.map((dateString) => {
      const [day, month, year] = dateString.split("/");

      const sameDateChats = sortedChats.filter((chat) => {
        const date = new Date(chat.createdAt);

        return (
          date.getDate() === Number(day) &&
          date.getMonth() === Number(month) &&
          date.getFullYear() === Number(year)
        );
      });

      return {
        date: dateString,
        chats: sameDateChats,
      };
    });

    setSortedChatsWithDate(groupedChats);
  }, [chatsDate, sortedChats]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setChats(data);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  const deleteChat = async (chatToDelete) => {
    const container = document.querySelector(".chat-window");

    if (!container) {
      console.error(
        'Scrollable element with class "chat-window" was not found'
      );
      return;
    }

    previousScrollTop.current = container.scrollTop;

    try {
      const response = await fetch(`${API_URL}/delete-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: chatToDelete._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      restoreScroll.current = true;

      const updatedMessages = await fetchUserData();
      console.log("updatedMessages : ", updatedMessages)

      if (updatedMessages) {
        socket.emit("send_message", updatedMessages);
      } else {
        restoreScroll.current = false;
      }
    } catch (error) {
      restoreScroll.current = false;
      console.error("Error deleting chat:", error);
    }
  };

  useLayoutEffect(() => {
    if (!restoreScroll.current) return;

    const container = document.querySelector(".chat-window");

    if (container) {
      container.scrollTop = previousScrollTop.current;
    }

    restoreScroll.current = false;
  }, [sortedChatsWithDate]);

  return (
    <div>
      <div className="p-4">
        <table className="table">
          <tbody>
            <tr>
              <th scope="row">From</th>
              <td>{contactEmails?.from}</td>
            </tr>

            <tr className="chat-receiver">
              <th scope="row">To</th>
              <td>{contactEmails?.to} (You)</td>
            </tr>
          </tbody>
        </table>

        <div>
          {sortedChatsWithDate.map((chatGroup) => {
            const [day, month, year] =
              chatGroup.date.split("/");

            return (
              <div
                key={chatGroup.date}
                className="chats-box"
              >
                <div className="chats-date">
                  {day}/{Number(month) + 1}/{year}
                </div>

                {chatGroup.chats.map((chat, index) => {
                  const date = new Date(chat.createdAt);
                  const hour = date.getHours();
                  const minutes = String(
                    date.getMinutes()
                  ).padStart(2, "0");

                  return (
                    <div
                      key={index}
                      className={
                        chat.receiver === user?.email
                          ? "sent chat"
                          : "received chat"
                      }
                    >
                      <div
                        className={
                          chat.receiver === user?.email
                            ? "sent-chat"
                            : "received-chat"
                        }
                      >
                        {chat.message}
                      </div>

                      <span className="chat-time">
                        {hour}:{minutes}
                      </span>

                      <div
                        className="delete"
                        onClick={() => deleteChat(chat)}
                      >
                        <FaDeleteLeft />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="message-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border mr-2"
            placeholder="Type a message..."
            ref={messageInput}
          />

          <button
            onClick={() =>
              sendMessage(
                contactEmails?.from,
                contactEmails?.to,
                message,
                contactEmails?.contactTarget
              )
            }
            className="text-white rounded"
          >
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneToOneChat;