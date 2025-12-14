const jwt = require('jsonwebtoken');
const Team = require("../models/Team");
const TeamMember = require('../models/TeamMember');
const User = require("../models/User")
const Project = require("../models/Project")
const { generateInviteToken } = require('../helpers/jwtHelper');
const { sendInviteEmail } = require('../helpers/emailHelper');

const addMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { emails } = req.body;

        const team = await Team.findById(teamId)
        if (!team) return res.status(400).json({ message: "Bad Request" })

        for (const email of emails) {
            const existingMember = await TeamMember.findOne({ email: email, teamId: teamId })
            if (existingMember && existingMember.status == "accepted") {
                console.log(email, " already accepted[-]")
                continue;
            }

            const token = generateInviteToken(email, teamId);
            const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            if (existingMember) {
                existingMember.status = "invited";
                existingMember.inviteToken = token;
                existingMember.inviteExpiresAt = inviteExpiresAt;
                await existingMember.save()
            }
            else {
                const member = new TeamMember({ teamId, email, inviteToken: token, inviteExpiresAt });
                await member.save();
            }

            let inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${teamId}?token=${token}`
            const IsCosThetaUser = await User.findOne({ email: email, isVerified: true })
            if (!IsCosThetaUser)
                inviteLink = `${process.env.FRONTEND_URL}/accept-invite/join-cos-theta/${teamId}?token=${token}`

            await sendInviteEmail(email, team.name, inviteLink);
        }

        res.status(200).json({ success: true, message: 'Invites sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const acceptInvite = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const member = await TeamMember.findOne({
            email: decoded.email,
            teamId: decoded.teamId,
            inviteToken: token,
            status: 'invited'
        });  

        if (!member || !member.inviteExpiresAt || member.inviteExpiresAt < Date.now())
            return res.status(400).json({ success: false, message: 'Invalid or expired invite token' });

        const user = await User.findOne({ email: decoded.email });
        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired invite token' });

        member.status = 'accepted';
        member.userId = user.id;
        member.inviteToken = undefined;
        member.inviteExpiresAt = undefined;
        await member.save();

        res.status(200).json({ success: true, message: 'Invite accepted' });
    } catch (error) {
        console.log("Err: ", error.message)
        res.status(500).json({ success: false, error: error.message });
    }
};
//if new cos-theta memebr
const acceptInviteNewUser = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //create new cos theta user
        const { name, password } = req.body;
        const isExistingUser = await User.findOne({ email: decoded.email })
        if (isExistingUser) {
            return res.status(400).json({ success: false, message: 'Invalid or expired invite token' });
        }
        const member = await TeamMember.findOne({
            email: decoded.email,
            teamId: decoded.teamId,
            inviteToken: token,
            status: 'invited'
        });

        if (!member || !member.inviteExpiresAt || member.inviteExpiresAt < Date.now())
            return res.status(400).json({ success: false, message: 'Invalid or expired invite token' });

        // const refreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNjgzOTcwNDAwLCJleHAiOjE2ODQ1NzUyMDB9.4QdEZ2q6E2gl5P9_hGj4aXMqMmCpX-a9c7FbSvqlxZk"
        const user = new User({ email: decoded.email, name, password, usageType: 'organization', isVerified: true })
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        user.refreshToken=refreshToken
        await user.save()
        member.status = 'accepted';
        member.userId = user._id;
        member.inviteToken = undefined;
        member.inviteExpiresAt = undefined;
        await member.save();

        const authToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });

        res.status(200).json({ error: false, token: authToken, refreshToken });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const { email } = req.params;
        if (!req.query.teamId) {
            return res.send(400).json({ message: "Bad Request" })
        }

        const member = await TeamMember.findOne({ email: email, teamId: req.query.teamId });

        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

        member.status = 'removed';
        await member.save();

        res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.log('->', error.message)
        res.status(500).json({ success: false, error: error.message });
    }
};

const getTeamMembers = async (req, res) => {
    try {
        if (!req.query.teamId) {
            return res.status(400).json({ message: "Bad Request" });
        }

        // Check if the team exists
        const team = await Team.findById(req.query.teamId);
        if (!team) {
            return res.status(404).send({ message: "Team Not Found" });
        }

        // Get all team members except the owner
        const allTeamMembers = await TeamMember.find({
            teamId: req.query.teamId,
            userId: { $ne: req.user.id }, // Exclude owner,
        });

        // Fetch user details for each member
        const membersWithNames = await Promise.all(
            allTeamMembers.map(async (member) => {
                const user = await User.findOne({ email: member.email }); // Fetch user details

                // If user exists, spread their relevant fields
                if (user) {
                    return {
                        ...member._doc,
                        userName: user.name,
                        avatar: user.avatar || "unknown" // If avatar exists use it, otherwise "unknown"
                    };
                }

                // If user doesn't exist in the User collection
                return {
                    ...member._doc,
                    userName: "Unknown User",
                    avatar: "unknown"
                };
            })
        );

        return res.status(200).json({ error: false, members: membersWithNames });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getProjectTeamMembers = async (req, res) => {
    try {
        if (!req.projectId) {
            return res.status(400).json({ message: "Bad Request(Prpject ID)" });
        }

        const project = await Project.findById(req.projectId)
        if (!project) {
            return res.status(404).send({ message: "Project Not Found" });
        }
        // Check if the team exists
        const team = await Team.findById(project.assignedTeam);
        if (!team) {
            return res.status(404).send({ message: "Team Not Found" });
        }

        // Get all team members except the owner
        const allTeamMembers = await TeamMember.find({
            teamId: project.assignedTeam,
        });

        // Fetch user details for each member
        const membersWithNames = await Promise.all(
            allTeamMembers.map(async (member) => {
                const user = await User.findOne({ email: member.email }); // Fetch user details

                // If user exists, spread their relevant fields
                if (user) {
                    return {
                        ...member._doc,
                        userName: user.name,
                        avatar: user.avatar || "unknown" // If avatar exists use it, otherwise "unknown"
                    };
                }

                // If user doesn't exist in the User collection
                return {
                    ...member._doc,
                    userName: "Unknown User",
                    avatar: "unknown"
                };
            })
        );

        return res.status(200).json({ error: false, members: membersWithNames });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { addMembers, acceptInvite, acceptInviteNewUser, removeMember, getTeamMembers, getProjectTeamMembers };
