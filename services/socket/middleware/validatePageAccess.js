// middleware/validatePageAccess.js
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');

module.exports = async (socket, next) => {
    const projectId = socket.handshake.query.projectId;

    if (!projectId) {
        return next(new Error('Bad request: No projectId provided'));
    }

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return next(new Error('Bad request: Project not found'));
        }

        if (!project.assignedTeam) {
            return next(new Error('No team found for the project'));
        }

        // Check if user is a valid team member
        const isTeamMember = await TeamMember.findOne({
            teamId: project.assignedTeam,
            userId: socket.user.id,
            email: socket.user.email,
            status: 'accepted',
        });

        if (!isTeamMember) {
            return next(new Error('Access denied: User is not part of the team'));
        }
        console.log("User Access Validated[+]")
        next(); // Proceed to the next middleware or event handler
    } catch (error) {
        return next(new Error('Error validating access to the page: ' + error.message));
    }
};
