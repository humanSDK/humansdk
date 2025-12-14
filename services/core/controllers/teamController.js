const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const User = require("../models/User")


const createTeam = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { name } = req.body;
        const team = new Team({ name, owner: ownerId });
        await team.save();

        const ownerMember = new TeamMember({
            teamId: team._id,
            userId: ownerId,
            email: req.user.email,
            status: 'accepted',
            inviteToken: undefined,
            inviteExpiresAt: undefined,
        });
        await ownerMember.save();

        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);

        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        if (team.owner.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: 'Unauthorized' });

        await TeamMember.deleteMany({ teamId: id });
        await Team.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getTeamById = async (req, res) => {
    try {
        if (!req.query.teamId)
            return res.status(400).json({ message: "Bad Request" })
        const team = await Team.findById(req.query.teamId)
        if (!team)
            return res.status(404).send({ message: "Team Not Found" })
        const owner = await User.findById(team.owner).select('name email');

        return res.status(200).json({ error: false, team, owner })

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

const getTeamsByOwner = async (req, res) => {
    try {
        if (!req.user.id)
            return res.status(400).json({ message: "Bad Request" })
        const teams = await Team.find({ owner: req.user.id })
        if (!teams || teams.length == 0)
            return res.status(404).send({ message: "Teams Not Found" })

        return res.status(200).json({ error: false, teams })

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
module.exports = { createTeam, deleteTeam, getTeamById, getTeamsByOwner };
