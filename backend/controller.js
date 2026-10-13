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
    email: {
        type: String
    },
    password: {
        type: String
    },
    contacts: [{
        email: String,
        name: String,
        chats: [
            {
                message: String,
                to: String,
                createdAt: Date
            }
        ]
    }]
})
const usersModel = mongoose.model("user", userSchema)
exports.addUser = async (req, res) => {
    try {
        const user = new usersModel(req.body)
        await user.save()

        res.send(user)
    }
    catch (err) {
        res.send({ success: false, message: `User not added. ${err.message}` })
    }
}

exports.getUser = async (req, res) => {
    try {
        const { email } = req.body
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
        const { email, password } = req.body
        const user = await usersModel.findOne({ email: email, password: password })

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
        const deleteOldLogin = await usersJwtModel.deleteMany({ IP: IP })
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
        const getLogin = await usersJwtModel.findOne({ IP: IP })

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
        chats: [{
            message: {
                type: String
            },
            to: {
                type: String
            },
            createdAt: {
                type: Date
            }
        }]
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
        chats: [{
            message: {
                type: String
            },
            to: {
                type: String
            },
            createdAt: {
                type: Date
            }
        }]
    }
})
const oneToOneContactsModel = mongoose.model("oneToOneContacts", oneToOneContactsSchema)
exports.oneToOneContacts = async (req, res) => {
    try {
        const { email, name, newUserEmail } = req.body
        const newUser = await usersModel.findOne({ email: newUserEmail })
        const newContacts = await usersModel.updateOne({ email: email }, { $push: { contacts: { email: newUser.email, name: newUser.name } } })

        res.json(newContacts)
    } catch (err) {
        console.log(`Contacts not saved : ${err.message}`)
    }
}

exports.sendMessage = async (req, res) => {
    try {
        console.log("req.body : ", req.body)
        const { from, to, message } = req.body
        const send = await usersModel.updateOne({ email: from, "contacts.email": to }, { $push: { "contacts.$.chats": { message: message, to: to, createdAt: new Date() } } }, { new: true })
        const send2 = await usersModel.updateOne({ email: to, "contacts.email": from }, { $push: { "contacts.$.chats": { message: message, to: to, createdAt: new Date() } } }, { new: true })

        res.json({ success: true, message: `Message sent`, data: { data1: send, data2: send2 } })
    } catch (err) {
        res.json({ success: false, message: `Unable to send message. ${err.message}` })
    }
}

exports.getContacts = async (req, res) => {
    try {
        const { email } = req.body;
        const contacts = await usersModel.findOne({ email: email })

        res.json(contacts)
    } catch (err) {
        res.send({ success: false, message: `Cannot get contacts ${err.message}` })
    }
}

exports.getChats = async (req, res) => {
    try {
        console.log("req.body from getChats : ", req.body)
        const { to, email } = req.body
        const chats = await usersModel.aggregate([{
            $match: {
                email: email,
                "contacts.email": to
            }
        }])
        const chats2 = await usersModel.aggregate([{
            $match: {
                email: to,
                "contacts.email": email
            }
        }])

        res.send({ fromChats: chats, toChats: chats2 })
    } catch (err) {
        res.json({ success: false, message: `Couldn't get chats ${err.message}` })
    }
}

exports.logout = async (req, res) => {
    try {
        const { IP } = req.body;
        const logout = await usersJwtModel.deleteMany({ IP: IP })

        res.send({ success: true, message: `Logout success` })
    } catch (err) {
        res.status(400).send({ success: true, message: `Unable to logout. ${err.message}` })
    }
}

exports.deleteChat = async (req, res) => {
    try {
        console.log("req.body from deleteChat : ", req.body)
        const { _id, from, to } = req.body;
        const deleteChatQuery = await usersModel.updateOne({ email: from, "contacts.email": to }, {
            $pull: {
                "contacts.$.chats": { _id: new mongoose.Types.ObjectId(_id) }
            }
        })

        res.end()
    } catch (err) {
        console.log(`Couldn't delete chat : ${err}`)
    }
}