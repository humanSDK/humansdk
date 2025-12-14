const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Project = require('../models/Project'); // Import Project model

exports.logActivity = async (socket, data) => {
    try {
        const { entityType, entityId, action, changes } = data;
        
        const user = await User.findById(socket.user.id).select('name avatar email');
        if (!user) {
            throw new Error('User not found');
        }

        // Fetch project name if entityType is 'project'
        let projectName = '';
        if (entityType === 'project') {
            const project = await Project.findById(entityId).select('name');
            projectName = project ? project.name : '';
        }

        const activityLog = new ActivityLog({
            userId: socket.user.id,
            entityType,
            entityId,
            action,
            changes
        });
        await activityLog.save();

        const log = {
            id: activityLog._id,
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            entityType,
            entityId,
            action,
            changes,
            timestamp: activityLog.timestamp,
            projectName,
            taskName: changes.taskName || ''
        };

        // Emit to specific project room (if applicable)
        if (entityType === 'project') {
            socket.to(entityId.toString()).emit('activity_update', log);
        }

        // Emit to the global activities room for all users
        socket.broadcast.emit('activity_update', log); 

        return log;
    } catch (error) {
        console.error("Failed to log activity:", error);
        throw error;
    }
};

exports.getRecentActivities = async (socket, data) => {
    try {
        const { entityType, entityId, limit = 10 } = data;

        const activities = await ActivityLog.find({
            entityType,
            entityId
        })
            .populate({
                path: 'userId',
                select: 'name avatar email'
            })
            .sort({ timestamp: -1 })
            .limit(limit);

        return activities.map(activity => ({
            id: activity._id,
            user: {
                name: activity.userId.name,
                email: activity.userId.email,
                avatar: activity.userId.avatar
            },
            entityType: activity.entityType,
            entityId: activity.entityId,
            action: activity.action,
            changes: activity.changes,
            timestamp: activity.timestamp,
            projectName: activity.changes.projectName || '',
            taskName: activity.changes.taskName || ''
        }));
        
    } catch (error) {
        console.error("Failed to get recent activities:", error);
        throw error;
    }
};