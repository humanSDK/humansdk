const express = require('express');
const { createTeam, deleteTeam, getTeamById, getTeamsByOwner } = require('../controllers/teamController');
const { authMiddleware } = require("../middleware/authMiddleware")
const router = express.Router();


//get one team
router.get('/', getTeamById);
//get all teams
router.get("/all", authMiddleware, getTeamsByOwner);
// Route to create a team
router.post('/create', authMiddleware, createTeam);
// Route to delete a team
router.delete('/:id', authMiddleware, deleteTeam);

module.exports = router;
