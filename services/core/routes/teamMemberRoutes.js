const express = require('express');
const { addMembers, acceptInvite, acceptInviteNewUser, removeMember, getTeamMembers, getProjectTeamMembers } = require('../controllers/teamMemberController');
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")

const router = express.Router();

// Route to add members to a team
router.post('/:teamId/add-members', authMiddleware, addMembers);

// Route to accept an invite
router.post('/accept-invite', acceptInvite);
//Route to accept an invite for non-cos-theta guy
router.post('/accept-invite/join-cos-theta', acceptInviteNewUser);
// Route to remove a member from a team
router.delete('/remove/:email', authMiddleware, removeMember);


//get all Team Members without owner
router.get("/", authMiddleware, getTeamMembers)

//get all Team Members for a project
router.get("/get-project-members", authMiddleware, validatePageAccess, getProjectTeamMembers)

module.exports = router;
