require("dotenv").config()
require("./database.js")
const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT

app.use(cors())
app.use(express.json())

const router = require("./router.js")
app.use(router)

// module.exports = app;

app.listen(port, ()=>{
    console.log(`App is listening at port ${port}.`)
})