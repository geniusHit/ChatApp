const express = require("express")
const router = express.Router()
const controller = require("./controller.js")

router.post("/add-user", controller.addUser)

router.post("/login", controller.login)

router.post("/save-user-jwt", controller.saveUserJwt)

router.post("/get-login", controller.getLoginUser)

router.post("/get-user", controller.getUser)

router.post("/get-contacts", controller.getContacts)

router.post("/oto-contact", controller.oneToOneContacts)

router.post("/send-message", controller.sendMessage)

router.post("/get-chats", controller.getChats)

router.post("/logout", controller.logout)

router.post("/delete-chat", controller.deleteChat)

module.exports = router