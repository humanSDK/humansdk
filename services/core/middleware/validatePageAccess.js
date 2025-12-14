const Project = require("../models/Project")
const TeamMember = require("../models/TeamMember")



exports.validatePageAccess = async (req, res, next) => {
    try {
        if (!req.query.projectId) return res.status(404).json({ message: 'Bad request' });

        req.projectId = req.query.projectId;
        const project = await Project.findById(req.projectId);

        if (!project) return res.status(404).json({ message: 'Bad request' });

        if (!project.assignedTeam) return res.status(404).json({ message: 'No Team Found For the project' });

        // Check if user is a valid team member
        const isTeamMember = await TeamMember.findOne({
            teamId: project.assignedTeam,
            userId: req.user.id,
            email: req.user.email,
            status: "accepted"
        });

        if (!isTeamMember) return res.status(403).json({ message: 'Access denied: User is not part of the team' });

        next()

    } catch (error) {
        res.status(500).json({ message: 'Error validating', error });
    }
}