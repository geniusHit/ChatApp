require("dotenv").config()
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    gender: {
        type: String
    },
    age: {
        type: Number
    },
    password: {
        type: String
    }
})
const usersModel = mongoose.model("user", userSchema)
exports.addUser = async (req, res) => {
    try {
        console.log("req.body : ", req.body)
        const user = new usersModel(req.body)
        await user.save()
        console.log("user : ", user)

        res.send(user)
    }
    catch (err) {
        res.send({ success: false, message: `User not added. ${err.message}` })
    }
}

exports.login = async (req, res) => {
    try {
        const { name, password } = req.body
        const user = await usersModel.findOne({ name: name, password: password })

        if (user) {
            res.status(200).json({ success: true, message: user })
        }
        else {
            res.status(400).json({ success: false, message: `User not available.` })
        }
    }
    catch (err) {
        res.json({ success: false, message: err.message })
    }
}

const usersJwtSchema = mongoose.Schema({
    IP: {
        type: String
    },
    jwt: {
        type: String
    }
})
const usersJwtModel = mongoose.model("usersJwt", usersJwtSchema)
exports.saveUserJwt = async (req, res) => {
    try {
        const { user, IP } = req.body
        const userJwt = jwt.sign(user, JWT_SECRET, { expiresIn: "12h" })

        const newUserJwt = new usersJwtModel({ IP: IP, jwt: userJwt })
        await newUserJwt.save()

        res.send({ success: true, message: `User jwt saved.` })
    }
    catch (err) {
        console.log(`User jwt not saved. ${err.message}`)
    }
}

exports.getLoginUser = async (req, res) => {
    try {
        const { IP } = req.body;
        console.log("IP : ", IP)
        const getLogin = await usersJwtModel.findOne({ IP: IP })
        console.log("getLogin : ", getLogin)
        res.json(getLogin)
    }
    catch (err) {
        console.log(`Unable to find login user ${err.message}`)
    }
}