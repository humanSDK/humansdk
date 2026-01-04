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

// Health check route
app.get("/health", (req, res) => {
    const healthStatus = {
        status: "healthy",
        service: "user-service",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    };
    
    const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
    res.status(statusCode).json(healthStatus);
});
console.log("User Service Health Check Route Added");
const PORT =9001;
app.listen(PORT, () => console.log("User Service Running on Port: ", PORT))