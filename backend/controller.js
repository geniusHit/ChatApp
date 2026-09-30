require("dotenv").config()
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const { MongoCryptInvalidArgumentError } = require("mongodb")
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
    email: {
        type: String
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

exports.getUser = async (req, res) => {
    try {
        const { email } = req.body
        console.log("email : ", email)
        const user = await usersModel.findOne({ email: email })

        if (user) {
            res.status(200).json(user)
        } else {
            res.status(400).json({ success: false, message: `No User available for provided email.` })
        }
    }
    catch (err) {
        res.json({ success: false, message: `No User available for provided email. ${err.message}` })
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
const usersJwtModel = mongoose.model("loggedusers", usersJwtSchema)
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


const oneToOneContactsSchema = mongoose.Schema({
    contact1: {
        name: {
            type: String
        },
        gender: {
            type: String
        },
        age: {
            type: Number
        },
        email: {
            type: String
        },
        chats: {
            message: {
                type: [String]
            },
            to: {
                type: [String]
            },
            createdAt: {
                type: [Date]
            }
        }
    },

    contact2: {
        name: {
            type: String
        },
        gender: {
            type: String
        },
        age: {
            type: Number
        },
        email: {
            type: String
        },
        chats: {
            message: {
                type: [String]
            },
            to: {
                type: [String]
            },
            createdAt: {
                type: [Date]
            }
        }
    }
})
const oneToOneContactsModel = mongoose.model("oneToOneContacts", oneToOneContactsSchema)
exports.oneToOneContacts = async (req, res) => {
    try {
        const newContacts = new oneToOneContactsModel(req.body)
        await newContacts.save()

        res.json(newContacts)
    } catch (err) {
        console.log(`Contacts not saved : ${err.message}`)
    }
}

exports.sendMessage = async (req, res) => {
    try {
        console.log("req.body from sendMessage : ", req.body)
        const { contact, message } = req.body
        const send = await oneToOneContactsModel.findOneAndUpdate({ "contact1.email": contact?.contact1?.email, "contact2.email": contact?.contact2?.email }, { $push: { "contact1.chats": { message: message, to: contact?.contact2?.email, createdAt: new Date() } } })
        console.log("send : ", send)

        res.json({ success: true, message: `Message sent` })
    } catch (err) {
        res.json({ success: false, message: `Unable to send message. ${err.message}` })
    }
}

exports.getContacts = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("req.body : ", req.body)
        const contacts = await oneToOneContactsModel.find({ "contact1.email": email })
        res.json(contacts)
    } catch (err) {
        res.send({ success: false, message: "Cannot get contacts" })
    }
}

exports.getChats = async (req, res) => {
    try {
        const { emails } = req.body
        let conditions=[];
        emails.map((em) => {
            conditions = [...conditions, {"contact1.email": em[0], "contact2.email": em[1]}]
        })
        console.log("conditions : ", conditions)
        console.log("emails : ", emails)
        const chats = await oneToOneContactsModel.find({$or: conditions})
        console.log("chats : ", chats)

        res.json(chats)
    } catch (err) {
        res.json({success: false, message: `Couldn't get chats ${err.message}`})
    }
}