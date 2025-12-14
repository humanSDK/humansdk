const Project = require('../models/Project');
const Team = require('../models/Team');
const TeamMember = require("../models/TeamMember")
const User = require("../models/User")
const Page = require("../models/Page")
const Note = require("../models/Note")

// Create a new project
const createProject = async (req, res) => {
    try {
        const owner = req.user.id;
        const { name, assignedTeam } = req.body;

        // Check if team exists
        const teamExists = await Team.findById(assignedTeam);
        if (!teamExists) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Create project
        const project = new Project({ name, owner, assignedTeam });
        await project.save();

        //Create a default page for the project
        const page = new Page({ name: "Page 1", projectId: project._id, createdBy: owner })
        await page.save();

        //create a default note for the project
        const note = new Note({ name: "Note 1", projectId: project._id, createdBy: owner })
        await note.save();

        res.status(201).json({ message: 'Project created successfully', project, page });
    } catch (error) {
        console.log("Error:", error.message)
        res.status(500).json({ message: 'Error creating project', error });
    }
};

// Delete a project
const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Find the project to check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the user is the owner
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this project' });
        }

        // Delete the project
        await project.deleteOne();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error });
    }
};

// Get all projects for the logged-in user
const getUserProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all projects where the owner matches the logged-in user
        const projects = await Project.find({ owner: userId })
            .populate('assignedTeam')
            .populate({ path: 'owner', select: 'name email' });

        // Map over each project to fetch its oldest associated page
        const projectsWithPages = await Promise.all(
            projects.map(async (project) => {
                const oldestPage = await Page.findOne({
                    projectId: project._id,
                    softDelete: false,
                })
                    .sort({ createdAt: 1 })
                    .select('id name');

                const associatedTeam = await Team.findById(project.assignedTeam).select('name')

                return {
                    id: project._id,
                    name: project.name,
                    createdAt: project.createdAt,
                    team: associatedTeam,
                    page: oldestPage || null,
                };
            })
        );

        res.status(200).json({ projects: projectsWithPages });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};

// Get simple project details
const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate('assignedTeam').populate({ path: 'owner', select: 'name email' });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ project });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project details', error });
    }
};

// Get full project details
const getFullProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('assignedTeam')
            .populate({ path: 'owner', select: 'name email' });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }


        // Get all team members except the owner
        const allTeamMembers = await TeamMember.find({
            teamId: project.assignedTeam,
        });

        // Fetch user details for each member
        const fullMemberDetails = await Promise.all(
            allTeamMembers.map(async (member) => {
                const user = await User.findOne({ email: member.email }); // Fetch user details
                return {
                    ...member._doc, // Include all original TeamMember fields
                    userName: user ? user.name : "Unknown User", // Add userName to the object
                };
            })
        );

        res.status(200).json({ project, members: fullMemberDetails });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching full project details', error });
    }
};

// Update project details
const updateProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, assignedTeam } = req.body;

        // Check if team exists if teamId is provided
        if (assignedTeam) {
            const teamExists = await Team.findById(assignedTeam);
            if (!teamExists) {
                return res.status(404).json({ message: 'Assigned team not found' });
            }
        }

        // Update project details
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { name, assignedTeam },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project details updated successfully', updatedProject });
    } catch (error) {
        res.status(500).json({ message: 'Error updating project details', error });
    }
};


const getProjectsAssociated = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all projects where the user is not the owner
        const projects = await Project.find({ owner: { $ne: userId } })
            .sort({ createdAt: 1 });


        // Filter projects based on TeamMember association
        const filteredProjects = await Promise.all(
            projects.map(async (project) => {
                const teamMemberExists = await TeamMember.findOne({
                    teamId: project.assignedTeam,
                    userId: userId,
                    status: "accepted"
                });

                if (teamMemberExists) {
                    return project;
                }

                return null;
            })
        );

        // Remove null values
        const validProjects = filteredProjects.filter(Boolean);

        // Map over each project to fetch its oldest associated page
        const projectsWithPages = await Promise.all(
            validProjects.map(async (project) => {
                const oldestPage = await Page.findOne({
                    projectId: project._id,
                    softDelete: false,
                })
                    .sort({ createdAt: 1 })
                    .select('id name');

                const associatedTeam = await Team.findById(project.assignedTeam).select('name')


                return {
                    id: project._id,
                    name: project.name,
                    createdAt: project.createdAt,
                    team: associatedTeam,
                    page: oldestPage || null,
                };
            })
        );

        res.status(200).json({ projects: projectsWithPages });
    } catch (error) {
        console.error('Error fetching projects with oldest pages:', error);
        res.status(500).json({ message: 'Failed to get projects with oldest pages', error });
    }
};

module.exports = {
    createProject,
    deleteProject,
    updateProjectDetails,
    getUserProjects,
    getProjectDetails,
    getFullProjectDetails,
    getProjectsAssociated
};

