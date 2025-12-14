const jwt = require('jsonwebtoken');

const generateInviteToken = (email, teamId) => {
    return jwt.sign({ email, teamId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

module.exports = { generateInviteToken };
