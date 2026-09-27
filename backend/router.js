const express = require("express")
const router = express.Router()
const controller = require("./controller.js")

router.get("/add-user", controller.addUser)

module.exports = router