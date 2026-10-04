require("dotenv").config()
require("./database.js")

const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())
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

// const port = process.env.PORT
// app.listen(port, () => {
//     console.log(`App is listening at port ${port}.`)
// })