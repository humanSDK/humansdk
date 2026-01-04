const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose');
//team routes
const teamRoutes = require("./routes/teamRoutes")
const teamMemberRoutes = require("./routes/teamMemberRoutes")
//project-routes
const projectRoutes = require("./routes/projectRoutes")
const pageRoutes = require("./routes/pageRoutes")
const noteRoutes = require("./routes/notesRoutes")
const canvasRoutes = require("./routes/canvasRoutes")
const sprintRoutes = require("./routes/sprintRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const analyticsRoutes = require("./routes/analyticRoutes")
const meetingRoutes = require("./routes/meetingRoutes")
const session = require('express-session');

// Initialize session middleware

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

//express-session
app.use(session({ secret: 'secretkey', resave: false, saveUninitialized: true }));

// Health check route
app.get("/health", (req, res) => {
    const healthStatus = {
        status: "healthy",
        service: "core-service",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    };
    
    const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
    res.status(statusCode).json(healthStatus);
});
console.log("Core Service Health Check Route Added");
//apis
app.use("/api/v1/team", teamRoutes)
app.use("/api/v1/team-members", teamMemberRoutes)
app.use("/api/v1/project", projectRoutes)
app.use("/api/v1/page", pageRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/canvas", canvasRoutes)
app.use("/api/v1/sprint", sprintRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/analytics", analyticsRoutes)
app.use("/api/v1/meetings",meetingRoutes)

// app.get("/sample",async(req,res)=>{
//     console.log(new Date().getMinutes())
//     res.send({
//         "user": {
//           "id": 1,
//           "name": "Harry potter",
//           "email": "johndoe@example.com",
//           "isActive": true
//         }
//       }
//       )
// })

const PORT = 9002;
app.listen(PORT, () => console.log("Core Service Running on Port: ", PORT))