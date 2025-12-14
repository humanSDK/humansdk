const Sprint = require('../models/Sprint');


// joinCanvas.js
exports.joinSprint = async (socket, roomId) => {
    await socket.join(roomId);
    console.log(`User ${socket.id} joined Sprint room: ${roomId}`);
};

// handleDisconnect.js
exports.handleDisconnectFromSprint = (socket) => {
    console.log(`Sprint User disconnected: ${socket.id}`);
};


// Create a new sprint (project and page)
exports.saveSprint = async (socket, data) => {
    const { projectId, nodes } = data;

    try {
        const existingsprint = await Sprint.findOne({ projectId });
        if (existingsprint) {
            return exports.updateSprint(socket, data); // If sprint exists, update it
        }

        const sprint = new Sprint({
            projectId,
            nodes
        });

        await sprint.save();
        console.log('sprint created successfully', sprint);

        // Emit to the room that sprint is created
        socket.to(projectId).emit("sprint_updated", { nodes });

    } catch (error) {
        console.error('Error creating sprint', error);
        socket.emit("error", { message: 'Error creating sprint', error });
    }
};

// Update an existing sprint (nodes and edges)
exports.updateSprint = async (socket, data) => {
    const { projectId, nodes } = data;

    try {
        const sprint = await Sprint.findOneAndUpdate(
            { projectId },
            { nodes },
            { new: true }
        );

        if (!sprint) {
            socket.emit("error", { message: 'sprint not found' });
            return;
        }

        console.log('sprint updated successfully');

        // Emit to the room about the sprint update
        socket.to(projectId).emit("sprint_updated", { nodes: sprint.nodes });
    } catch (error) {
        console.error('Error updating sprint', error);
        socket.emit("error", { message: 'Error updating sprint', error });
    }
};
