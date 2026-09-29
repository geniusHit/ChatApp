require("dotenv").config()
require("./database.js")
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const app = express()
const cors = require("cors")
const port = process.env.PORT

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });
});

const router = require("./router.js")
app.use(router)

// module.exports = app;

server.listen(port, () => {
    console.log(`App is listening at port ${port}.`)
})