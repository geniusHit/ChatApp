require("dotenv").config()
require("./database.js")
const express = require("express")
const app = express()
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io")
const port = process.env.PORT

app.use(express.json())
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    socket.on("send_message", (data)=>{
        io.emit("receive_message", data)
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    })
})

// module.exports = app;

server.listen(port, ()=>{
    console.log(`App is listening at port ${port}.`)
})