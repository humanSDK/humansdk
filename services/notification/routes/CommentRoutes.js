const { handleComment, getTaskComments,clearTaskComments,handleFileUpload,togglePinMessage } = require('../controllers/commentController');
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join personal room (from your existing code)
        socket.on("join_personal_room", () => {
            console.log(`${socket.id} joined ${socket.user.id}`);
            socket.join(socket.user.id);
        });

        // Add these new event handlers
        socket.on("join_task_room", (taskId) => {
            socket.join(taskId);
            console.log(`${socket.id} joined task room: ${taskId}`);
            getTaskComments(socket, { taskId });
        });

        socket.on("send_comment", (data) => {
            handleComment(socket, data);
        });
        socket.on("toggle_pin_message", (data) => {
            togglePinMessage(socket, data);
          });
        socket.on("upload_files", async (data) => {
            try {
                const files = data.files;
                const uploadedFiles = await handleFileUpload(socket, files);
                if (uploadedFiles) {
                    socket.emit('files_uploaded', uploadedFiles);
                }
            } catch (error) {
                socket.emit('upload_error', { message: 'File upload failed' });
            }
        });

        socket.on("get_task_comments", (data) => {
            getTaskComments(socket, data);
        });
        socket.on("clear_task_comments", (data) => {
            clearTaskComments(socket, data);
        });

        socket.on("leave_task_room", (taskId) => {
            socket.leave(taskId);
            console.log(`${socket.id} left task room: ${taskId}`);
        });

        socket.on("disconnect", () => {
            console.log(`${socket.id} disconnected`);
        });
    });
};