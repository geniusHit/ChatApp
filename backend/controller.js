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
    }
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
        const newContacts = new oneToOneContactsModel(req.body)
        await newContacts.save()

        res.json(newContacts)
        res.send()
    } catch (err) {
        console.log(`Contacts not saved : ${err.message}`)
    }
}

exports.sendMessage = async (req, res) => {
    try {
        console.log("req.body : ", req.body)
        const { from, to, message, contactTarget } = req.body
        const send = await oneToOneContactsModel.findOneAndUpdate({ "contact1.email": from, "contact2.email": to }, { $push: { "contact1.chats": { message: message, to: "", createdAt: new Date() }, "contact2.chats": { message: message, to: to, createdAt: new Date() } } }, { returnDocument: 'after' })

        res.json({ success: true, message: `Message sent`, data: send })
    } catch (err) {
        res.json({ success: false, message: `Unable to send message. ${err.message}` })
    }
}

exports.getContacts = async (req, res) => {
    try {
        const { email } = req.body;
        const contacts = await oneToOneContactsModel.find({
            $or: [
                { "contact1.email": email }, { "contact2.email": email }
            ]
        })

        res.json(contacts)
    } catch (err) {
        res.send({ success: false, message: `Cannot get contacts ${err.message}` })
    }
}

exports.getChats = async (req, res) => {
    try {
        console.log("req.body from getChats : ", req.body)
        const { from, to } = req.body
        const chats = await oneToOneContactsModel.find({ "contact1.email": from, "contact2.email": to })
        // const fromChats = await oneToOneContactsModel.aggregate([
        //     {
        //         $match: {
        //             "contact1.email": from,
        //             "contact2.email": to,
        //             "contact1.chats.to": { $ne: "" }
        //         }
        //     },
        //     {
        //         $project: {
        //             "contact1.email": 1,
        //             "contact1.chats": {
        //                 $filter: {
        //                     input: "$contact1.chats",
        //                     as: "chat",
        //                     cond: { $ne: ["$$chat.to", ""] }
        //                 }
        //             }
        //         }
        //     }
        // ]);
        const fromChats = await oneToOneContactsModel.aggregate([
            {
                $match: {
                    "contact1.email": from
                }
            },
            {
                $project: {
                    "contact1.email": 1,
                    "contact1.chats": {
                        $filter: {
                            input: "$contact1.chats",
                            as: "chat",
                            cond: {
                                $and: [
                                    { $ne: ["$$chat.to", ""] },
                                    { $eq: [{ $type: "$$chat.to" }, "string"] }
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        const toChats = await oneToOneContactsModel.aggregate([
            {
                $match: {
                    "contact1.email": from,
                    "contact2.email": to,
                    "contact2.chats.to": to
                }
            },
            {
                $project: {
                    "contact2.email": 1,
                    "contact2.chats": {
                        $filter: {
                            input: "$contact2.chats",
                            as: "chat",
                            cond: { $eq: ["$$chat.to", to] }
                        }
                    }
                }
            }
        ]);

        res.json({ chats, fromChats, toChats })
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
        const { _id } = req.body
        console.log("_id : ", _id)
        const object1 = await oneToOneContactsModel.findOne({
            $or: [
                { "contact1.chats._id": _id },
                { "contact2.chats._id": _id },
            ]
        },)
        console.log("object1 : ", object1)
        const chatToDelete1 = object1.contact1.chats.filter((chat) => chat._id.equals(_id))
        console.log("chatToDelete1 : ", chatToDelete1)
        const chatToDelete2 = object1.contact2.chats.filter((chat) => chat._id.equals(_id))
        console.log("chatToDelete2 : ", chatToDelete2)

        const deleteChatQuery = await oneToOneContactsModel.updateOne(
            {
                $or: [
                    { "contact1.chats._id": new mongoose.Types.ObjectId(`${_id}`) },
                    { "contact2.chats._id": new mongoose.Types.ObjectId(`${_id}`) }
                ]
            },
            {
                $pull: {
                    "contact1.chats": { _id: _id },
                    "contact2.chats": { _id: _id }
                }
            }
        )

        res.end()
    } catch (err) {
        console.log(`Couldn't delete chat : ${err}`)
    }
}