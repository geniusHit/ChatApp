const express = require("express")
const router = express.Router()
const controller = require("./controller.js")

router.post("/add-user", controller.addUser)

router.post("/login", controller.login)

router.post("/save-user-jwt", controller.saveUserJwt)

router.post("/get-login", controller.getLoginUser)

module.exports = router