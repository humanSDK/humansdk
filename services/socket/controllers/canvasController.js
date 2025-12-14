
const Canvas = require('../models/Canvas');


// joinCanvas.js
exports.joinCanvas = (socket, roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined canvas room: ${roomId}`);
};

// handleDisconnect.js
exports.handleDisconnectFromCanvas = (socket) => {
    console.log(`User disconnected: ${socket.id}`);
};

// Create a new canvas (project and page)
exports.saveCanvas = async (socket, data) => {
    const { projectId, pageId, nodes, edges } = data;

    try {
        const existingCanvas = await Canvas.findOne({ projectId, pageId });
        if (existingCanvas) {
            return exports.updateCanvas(socket, data); // If canvas exists, update it
        }

        const canvas = new Canvas({
            projectId,
            pageId,
            nodes,
            edges,
        });

        await canvas.save();
        console.log('Canvas created successfully', canvas);

        // Emit to the room that canvas is created
        socket.to(pageId).emit("canvas_updated", { nodes, edges });

    } catch (error) {
        console.error('Error creating canvas', error);
        socket.emit("error", { message: 'Error creating canvas', error });
    }
};

// Update an existing canvas (nodes and edges)
exports.updateCanvas = async (socket, data) => {
    const { projectId, pageId, nodes, edges } = data;

    try {
        const canvas = await Canvas.findOneAndUpdate(
            { projectId, pageId },
            { nodes, edges },
            { new: true }
        );

        if (!canvas) {
            socket.emit("error", { message: 'Canvas not found' });
            return;
        }

        console.log('Canvas updated successfully');

        // Emit to the room about the canvas update
        socket.to(pageId).emit("canvas_updated", { nodes: canvas.nodes, edges: canvas.edges });
    } catch (error) {
        console.error('Error updating canvas', error);
        socket.emit("error", { message: 'Error updating canvas', error });
    }
};


