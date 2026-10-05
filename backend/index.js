require("dotenv").config()
require("./database.js")

const express = require("express")
const cors = require("cors")
const app = express()
const http = require("http")
const { Server } = require("socket.io");

app.use(cors())
app.use(express.json())
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chat app backend is working"
    });
});

const router = require("./router.js")
app.use("/", router)

io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });
});

const port = process.env.PORT || 8000
server.listen(port, () => {
    console.log(`Server is running at port ${port}.`)
})