import { useEffect, useState, useCallback, useRef } from 'react'
import "./App.css"
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import NewContact from './Pages/NewContact';
import OneToOneChat from "./Pages/OneToOneChat";
import { jwtDecode } from "jwt-decode"
import { GiHamburgerMenu } from "react-icons/gi";
import { SiGnuprivacyguard } from "react-icons/si";
import { RiLoginCircleFill } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";

const App = () => {

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://chat-app-backend-three-ashen.vercel.app";

  const [user, setUser] = useState()
  const [IP, setIP] = useState()
  const [currentTab, setCurrentTab] = useState("home")
  const [allContacts, setAllContacts] = useState([])
  const [contactTarget, setContactTarget] = useState([])
  const [emails, setEmails] = useState([])
  const [from, setFrom] = useState()
  const [to, setTo] = useState()
  const main = useRef()

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
      const decodedUser = result?.jwt ? jwtDecode(result?.jwt) : []
      setUser(decodedUser)
    }
  }

  useEffect(() => {
    loginUser()
  }, [API_URL, IP])

  const fetchUserData = useCallback(async () => {
    if (!user?.email) return;

    try {
      const contactsRes = await fetch(`${API_URL}/get-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const contactsData = await contactsRes.json();
      setFrom(contactsData[0]?.contact1?.email)
      setAllContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const userName = user?.name?.split(" ")[0] || "";

  useEffect(() => {
    let emailsArray = []
    allContacts.map((c) => {
      let contactTarget = c?.contact1?.email === user?.email ? "contact1" : "contact2"
      emailsArray = [...emailsArray, { email: c?.contact2?.email, name: c?.contact1?.email!==user?.email? c?.contact1?.name : c?.contact2?.name, contactTarget: contactTarget }]
    })
    let emailsSet = new Set(emailsArray)
    let emailsArray2 = [...emailsSet]
    const uniqueByEmail = [...new Map(emailsArray2.map(item => [item.email, item])).values()];
    setEmails(uniqueByEmail)
  }, [allContacts])

  const logout = async () => {
    const logoutQuery = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IP: IP })
    })

    window.location.reload();
  }

  return (
    <div className='home'>
      <div className='sidebar'>
        <div className='logo' onClick={() => setCurrentTab("home")}>Swing</div>

        <div className='flex items-center justify-between header'>
          <h3 className='text-black'>{userName}</h3>

          <div className="dropdown">
            <button className="hamburger" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <GiHamburgerMenu />
            </button>
            <ul className="dropdown-menu">
              <li className="dropdown-item" onClick={() => { setCurrentTab("login") }}>Login</li>
              <li className="dropdown-item" onClick={() => { setCurrentTab("signup") }}>Signup</li>
              <li className="dropdown-item" onClick={() => { setCurrentTab("newcontact") }}>New Contact</li>
              <li className="dropdown-item" onClick={logout}>Logout</li>
            </ul>
          </div>
        </div>

        <div className='contacts'>
          {
            emails.map((em, index) => {

              return <div key={index} className='contact' onClick={
                () => {
                  setCurrentTab("onochat")
                  setTo(em?.email)
                  setContactTarget(em?.contactTarget)
                }
              }>
                {em?.name}
              </div>
            })
          }
        </div>
      </div>

      <div className={currentTab === "onochat" ? 'chat-window main' : 'window main'} ref={main}>
        {
          currentTab === "login" ? <Login /> :
            currentTab === "signup" ? <Signup /> :
              currentTab === "onochat" ? <OneToOneChat contactEmails={{ from: from, to: to, contactTarget: contactTarget }} /> :
                currentTab === "newcontact" ? <NewContact /> : <div className='home-icons'>
                  <div className='icon' onClick={() => setCurrentTab("login")}>
                    <RiLoginCircleFill />
                    <span className='link-text'>Login</span>
                  </div>
                  <div className='icon' onClick={() => setCurrentTab("signup")}>
                    <SiGnuprivacyguard />
                    <span className='link-text'>Signup</span>
                  </div>
                  <div className='icon' onClick={() => setCurrentTab("newcontact")}>
                    <MdAccountCircle />
                    <span className='link-text'>Account</span>
                  </div>
                </div>
        }
      </div>
    </div>
  )

}

export default App