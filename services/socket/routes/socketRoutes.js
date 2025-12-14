const { joinCanvas, handleDisconnectFromCanvas, saveCanvas, updateCanvas } = require("../controllers/canvasController");
const { joinSprint, saveSprint, handleDisconnectFromSprint } = require("../controllers/sprintController");
const { joinNotes, saveNote, handleDisconnectFromNote } = require("../controllers/NoteController");

module.exports = (io) => {

    // Listen for socket connections
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        //CANVAS
        // Event: Join a specific canvas room
        socket.on("join_canvas", (roomId) => {
            joinCanvas(socket, roomId);
        });

        // Event: Handle canvas save
        socket.on("save_canvas", (data) => {
            saveCanvas(socket, data);
        });

        // Handle disconnect event
        socket.on("disconnect", () => {
            handleDisconnectFromCanvas(socket);
        });

        //SPRINTS
        socket.on("join_sprint", (roomId) => {
            joinSprint(socket, roomId);
        });

        socket.on("save_sprint", (data) => {
            saveSprint(socket, data);
        });

        socket.on("disconnect_sprint", () => {
            handleDisconnectFromSprint(socket);
        });

        //NOTES
        socket.on("join_note", (roomId) => {
            joinNotes(socket, roomId);
        });

        socket.on("save_note", (data) => {
            saveNote(socket, data);
        });

        socket.on("disconnect_note", () => {
            handleDisconnectFromNote(socket);
        });

    });

};
