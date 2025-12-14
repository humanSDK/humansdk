// socketServer/index.js
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authMiddleware = require('./middleware/authMiddleware'); // Import auth middleware
const socketRoutes = require('./routes/socketRoutes');
const commentRoutes = require('./routes/CommentRoutes')
const activityLogRoutes = require('./routes/activityLogRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 9003; // Set port, default to 9003

// MONGODB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB:', err);
    });

const io = new Server(PORT, {
    cors: {
        origin: ['http://localhost:3000', 'https://app.humansdk.com'],
    },
});

// Use middleware for authentication
io.use(authMiddleware);

//canvas events
socketRoutes(io);
commentRoutes(io);
activityLogRoutes(io);
console.log(`WebSocket server running on ws://localhost:${PORT}`);
