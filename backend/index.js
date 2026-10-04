require("dotenv").config()
require("./database.js")

const express = require("express")
const cors = require("cors")
const app = express()

// app.use(cors())
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chat app backend is working"
    });
});

const router = require("./router.js")
app.use(router)

module.exports = app;

// const port = process.env.PORT || 8000
// app.listen(port, () => {
//     console.log(`App is listening at port ${port}.`)
// })