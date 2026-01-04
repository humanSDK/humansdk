const { handleComment, getTaskComments,clearTaskComments,handleFileUpload,togglePinMessage } = require('../controllers/commentController');
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Add error handler for debugging
        socket.on("error", (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });

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
                console.log("upload_files event received");
                console.log("Data received:", data ? "exists" : "null", data?.files ? `with ${data.files.length} files` : "no files");
                if (!data || !data.files) {
                    console.error("Invalid upload_files data:", data);
                    socket.emit('upload_error', { message: 'Invalid file data' });
                    return;
                }
                const files = data.files;
                console.log(`Processing ${files.length} file(s)`);
                const uploadedFiles = await handleFileUpload(socket, files);
                if (uploadedFiles) {
                    console.log("Files uploaded successfully, emitting files_uploaded");
                    socket.emit('files_uploaded', uploadedFiles);
                } else {
                    console.error("File upload returned null");
                }
            } catch (error) {
                console.error("Error in upload_files handler:", error);
                socket.emit('upload_error', { message: error.message || 'File upload failed' });
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