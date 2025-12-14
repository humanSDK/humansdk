const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose');

//routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())

// MONGODB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB:', err);
    });

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)

const PORT =9001;
app.listen(PORT, () => console.log("User Service Running on Port: ", PORT))