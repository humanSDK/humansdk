// authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (socket, next) => {
    const token = socket.handshake.query.token; // Retrieve token from handshake

    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = decoded;
        console.log("JWT Verified")
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log("token epxired")
            return next(new Error('Authentication error: Token Expired'));
        }
        return next(new Error('Authentication error: Invalid token'));
    }
};
