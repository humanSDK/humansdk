const Note = require("../models/Note")

exports.joinNotes = (socket, roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined note room: ${roomId}`);
};


// handleDisconnect.js
exports.handleDisconnectFromNote = (socket) => {
    console.log(`Note User disconnected: ${socket.id}`);
};


// Create a new canvas (project and page)
exports.saveNote = async (socket, data) => {
    const { projectId, noteId, editorContent } = data;

    try {
        const existingNote = await Note.findById(noteId);
        if (existingNote) {
            return exports.updateNote(socket, data); // If note exists, update it
        }

    } catch (error) {
        console.error('Error creating note', error);
        socket.emit("error", { message: 'Error creating note', error });
    }
};

// Update an existing canvas (nodes and edges)
exports.updateNote = async (socket, data) => {
    const { noteId, editorContent } = data;
    console.log("exisitng note")


    try {
        const note = await Note.findOneAndUpdate(
            { _id: noteId },
            { editorContent },
            { new: true }
        );

        if (!note) {
            socket.emit("error", { message: 'note not found' });
            return;
        }

        console.log('note updated successfully');

        // Emit to the room about the note update
        socket.to(noteId).emit("note_updated", { note });
    } catch (error) {
        console.error('Error updating note', error);
        socket.emit("error", { message: 'Error updating note', error });
    }
};