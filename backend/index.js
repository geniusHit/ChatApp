require("dotenv").config()
require("./database.js")
const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT

app.use(express.json())
app.use(cors())

// module.exports = app;

app.listen(port, ()=>{
    console.log(`App is listening at port ${port}.`)
})