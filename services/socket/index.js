// socketServer/index.js
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authMiddleware = require('./middleware/authMiddleware'); // Import auth middleware
const validatePageAccess = require('./middleware/validatePageAccess'); // Import validatePageAccess middleware
const socketRoutes = require('./routes/socketRoutes');
require('dotenv').config();

const PORT =9003; // Set port, default to 9003

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
        origin: [
            'http://localhost:3000',
            'https://app.rougeone.dev',
            'http://app.rougeone.dev',
            'https://socket.rougeone.dev',
            'http://socket.rougeone.dev'
        ],
        credentials: true,
        methods: ['GET', 'POST'],
    },
    allowEIO3: true,
});

// Use middleware for authentication
io.use(authMiddleware);
io.use(validatePageAccess);

//canvas events
socketRoutes(io);

console.log(`WebSocket server running on ws://localhost:${PORT}`);
