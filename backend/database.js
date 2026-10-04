require("dotenv").config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI)
.then(()=> {
    console.log("Connected to database.")
})
.catch((err)=> {
    console.log("Couldn't connect to database.")
    console.error(err)
})