const User = require('../models/User')
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Canvas = require('../models/Canvas');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's projects
        const projects = await Project.find({ owner: userId });
        const projectIds = projects.map(project => project._id);

        // Get team members
        const teamMembers = await TeamMember.find({
            teamId: { $in: projects.map(p => p.assignedTeam) },
            status: 'accepted'
        });

        // Get tasks from canvas
        const canvases = await Canvas.find({ projectId: { $in: projectIds } });
        
        // Calculate project status based on tasks
        const projectStatus = projectIds.reduce((acc, projectId) => {
            const projectCanvas = canvases.find(canvas => 
                canvas.projectId.toString() === projectId.toString()
            );
            
            if (!projectCanvas || !projectCanvas.nodes.length) {
                acc.notStarted++;
                return acc;
            }

            const projectTasks = projectCanvas.nodes.filter(node => node.type === 'task');
            
            if (!projectTasks.length) {
                acc.notStarted++;
                return acc;
            }

            const completedTasks = projectTasks.filter(task => 
                task.data.status === 'Completed'
            ).length;

            const totalTasks = projectTasks.length;
            const completionPercentage = (completedTasks / totalTasks) * 100;

            if (completionPercentage === 0) {
                acc.notStarted++;
            } else if (completionPercentage === 100) {
                acc.completed++;
            } else {
                acc.inProgress++;
            }

            return acc;
        }, {
            completed: 0,
            inProgress: 0,
            notStarted: 0
        });

        // Get all tasks across all projects
        const tasks = canvases.flatMap(canvas => 
            canvas.nodes.filter(node => node.type === 'task')
        );

        const stats = {
            totalProjects: projects.length,
            activeTeams: new Set(teamMembers.map(m => m.teamId.toString())).size,
            completedTasks: tasks.filter(task => task.data.status === 'Completed').length,
            tasksInProgress: tasks.filter(task => task.data.status === 'In Progress').length,
            notStarted: tasks.filter(task => task.data.status == 'Not Started').length,
            // New fields for project status
            projectStatus: {
                fullycompleted: projectStatus.completed,
                fulyinProgress: projectStatus.inProgress,
                fullynotStarted: projectStatus.notStarted
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

exports.getProjectAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all user's projects
        const projects = await Project.find({ owner: userId });
        
        // Get all team members for all projects
        const allTeamMembers = await TeamMember.find({
            teamId: { $in: projects.map(p => p.assignedTeam) },
            status: 'accepted'
        }).populate('userId', 'name email avatar');

        // Process each project
        const pages = await Promise.all(projects.map(async (project) => {
            const canvas = await Canvas.findOne({ projectId: project._id });
            
            // Get team members for this specific project
            const projectTeamMembers = allTeamMembers.filter(member => 
                member.teamId.toString() === project.assignedTeam?.toString()
            );

            return {
                _id: canvas?._id || project._id,
                projectId: project._id,
                name: project.name,
                teamSize: projectTeamMembers.length,
                teamMembers: projectTeamMembers.map(member => ({
                    _id: member.userId?._id,
                    name: member.userId?.name || 'Unknown',
                    email: member.userId?.email,
                    avatar: member.userId?.avatar || null
                }))
            };
        }));

        // Create global team members list without duplicates
        const globalTeamMembers = Array.from(
            new Map(
                allTeamMembers.map(member => [
                    member.userId?._id.toString(),
                    {
                        _id: member.userId?._id,
                        name: member.userId?.name || 'Unknown',
                        email: member.userId?.email,
                        avatar: member.userId?.avatar || null,
                        projectsInvolved: projects.filter(project => 
                            allTeamMembers.some(tm => 
                                tm.teamId.toString() === project.assignedTeam?.toString() &&
                                tm.userId?._id.toString() === member.userId?._id.toString()
                            )
                        ).length
                    }
                ])
            ).values()
        );

        res.json({ 
            pages,
            totalTeamMembers: globalTeamMembers.length,
            globalTeamMembers
        });
    } catch (error) {
        console.error('Error fetching project analytics:', error);
        res.status(500).json({ message: 'Error fetching project analytics' });
    }
};

exports.getTaskAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all projects owned by the user
        const projects = await Project.find({ owner: userId });
        const projectIds = projects.map(project => project._id);

        // Get all canvases for user's projects
        const canvases = await Canvas.find({ 
            projectId: { $in: projectIds }
        }).populate('projectId', 'name');

        // Get all team memberships for the user
        const teamMemberships = await TeamMember.find({
            userId: userId,
            status: 'accepted'
        });
        const userTeamIds = teamMemberships.map(tm => tm.teamId.toString());

        // Process tasks for each project
        const projectAnalytics = await Promise.all(projects.map(async (project) => {
            const projectCanvases = canvases.filter(canvas => 
                canvas.projectId._id.toString() === project._id.toString()
            );

            // Get all tasks from all canvases in this project
            const projectTasks = projectCanvases.flatMap(canvas =>
                canvas.nodes.filter(node => 
                    node.type === 'task' && 
                    node.data.assignees?.some(assignee => assignee === req.user.email)
                )
            );

            // Calculate status counts
            const statusCounts = {
                completed: projectTasks.filter(task => task.data.status === 'Completed').length,
                inProgress: projectTasks.filter(task => task.data.status === 'In Progress').length,
                notStarted: projectTasks.filter(task => task.data.status === 'Not Started').length
            };

            // Get task details
            const taskDetails = projectTasks.map(task => ({
                taskId: task.id,
                taskName: task.data.label,
                status: task.data.status,
                assignees: task.data.assignees
            }));

            return {
                projectId: project._id,
                projectName: project.name,
                totalTasksAssigned: projectTasks.length,
                statusCounts,
                tasks: taskDetails
            };
        }));

        // Calculate overall statistics
        const overallStats = projectAnalytics.reduce((acc, project) => {
            acc.totalTasksAcrossProjects += project.totalTasksAssigned;
            acc.totalCompleted += project.statusCounts.completed;
            acc.totalInProgress += project.statusCounts.inProgress;
            acc.totalNotStarted += project.statusCounts.notStarted;
            return acc;
        }, {
            totalTasksAcrossProjects: 0,
            totalCompleted: 0,
            totalInProgress: 0,
            totalNotStarted: 0
        });

        res.json({
            overallStats,
            projectWiseAnalytics: projectAnalytics
        });

    } catch (error) {
        console.error('Error fetching task analytics:', error);
        res.status(500).json({ message: 'Error fetching task analytics' });
    }
};

exports.getRecentActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's projects
        const projects = await Project.find({ owner: userId });
        const projectIds = projects.map(project => project._id);
        
        // Get canvas changes from last 2 hours
        const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
        
        // Get recent canvas changes
        const recentCanvases = await Canvas.find({ 
            projectId: { $in: projectIds },
            updatedAt: { $gte: twoHoursAgo }
        })
        .populate('projectId', 'name')
        .populate('pageId', 'name')
        .sort({ updatedAt: -1 });

        // Transform canvas changes into activities
        const activities = recentCanvases.flatMap(canvas => {
            // Filter nodes that are tasks and have been changed
            const changedNodes = canvas.nodes.filter(node => 
                node.type === 'task' && 
                node.data && 
                (node.data.label || node.data.status || node.data.assignees)
            );

            return changedNodes.map(node => ({
                _id: node.id,
                projectName: canvas.projectId?.name || 'Unknown Project',
                pageName: canvas.pageId?.name || 'Unknown Page',
                taskName: node.data.label || 'Unnamed Task',
                userName: req.user.email,
                action: `updated task "${node.data.label}"`,
                target: node.data.label || 'item',
                timestamp: canvas.updatedAt,
                taskDetails: {
                    status: node.data.status || 'Not Set',
                    assignees: node.data.assignees || [],
                    taskType: node.type
                }
            }));
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Format the time for each activity
        const formattedActivities = activities.map(activity => ({
            ...activity,
            timeAgo: getTimeAgo(activity.timestamp)
        }));

        res.json({ 
            activities: formattedActivities,
            total: formattedActivities.length 
        });

    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ message: 'Error fetching recent activities' });
    }
};
function getTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    
    return 'Just now';
}