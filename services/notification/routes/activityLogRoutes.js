const { logActivity, getRecentActivities } = require('../controllers/activityLogController');

module.exports = (io) => {
    io.on("connection", (socket) => {
        // Debug middleware
        socket.use(([event, ...args], next) => {
            console.log(`Socket Event '${event}' received with data:`, args);
            next();
        });

        // Join room for specific entity
        socket.on("join_entity_room", (entityId) => {
            console.log(`Socket ${socket.id} joined room ${entityId}`);
            socket.join(entityId);
        });
        socket.on("join_activity_room", () => {
            socket.join('global_activities');
        });
       
        // Log activity with debugging
       // In your socket routes file
socket.on("log_activity", async (data) => {
    try {
        console.log('Received log_activity event with data:', data);
        console.log('Socket user:', socket.user); // Check if user data exists

        const log = await logActivity(socket, data);
        console.log('Activity logged successfully:', log);
        
        socket.emit("activity_logged", log);
    } catch (error) {
        console.error("Error in log_activity handler:", error);
        socket.emit("activity_error", { message: error.message });
    }
});

        // Get recent activities with debugging
        socket.on("get_recent_activities", async (data) => {
            try {
                console.log('Fetching recent activities:', data);
                const activities = await getRecentActivities(socket, data);
                console.log('Sending recent activities:', activities);
                socket.emit("recent_activities", activities);
            } catch (error) {
                console.error("Error getting activities:", error);
                socket.emit("activity_error", { message: error.message });
            }
        });
    });
};