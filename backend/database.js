require("dotenv").config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://rohitthakur792002_db_user:rZAwa3mCUMgrnnRj@cluster0.7hhtnwm.mongodb.net/ChatApp?appName=Cluster0")
.then(()=> {
    console.log("Connected to database.")
})
.catch((err)=> {
    console.log("Couldn't connect to database.")
    console.error(err)
})