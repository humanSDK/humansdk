
const Note = require("../models/Note")


const createNote = async (req, res) => {
    try {
        if (!req.body.noteName) return res.status(400).json({ message: "Bad Request" })

        const note = new Note({
            name: req.body.noteName,
            createdBy: req.user.id,
            projectId: req.projectId
        })
        await note.save()

        return res.status(201).json({ message: "New note created", note })

    } catch (error) {
        console.log("Failed to create note:", error.message)
        res.status(500).json({ message: 'Error creating note', error });

    }
}

const deleteNote = async (req, res) => {
    try {
        if (!req.query.noteId) {
            return res.status(400).json({ message: "Bad Request 1" })
        }

        const note = await Note.findById(req.query.noteId)
        if (!note) return res.status(404).json({ message: 'note not found' });

        note.softDelete = true;
        await note.save()

        res.status(200).json({ message: 'note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error });
    }
}

const renameNote = async (req, res) => {
    try {
        if (!req.body.newNoteName || !req.body.noteId) return res.status(400).json({ message: "Bad Request" })

        const note = await Note.findById(req.body.noteId)
        if (!note) return res.status(404).json({ message: 'note not found' });

        note.name = req.body.newNoteName;
        note.save();
        res.status(200).json({ message: 'note renamed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error renaming note', error });

    }
}

const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ projectId: req.projectId, softDelete: false }).select('')
        return res.status(200).json({ message: "List fetched successfully", notes })
    } catch (error) {
        res.status(500).json({ message: 'Error listing all notes', error });

    }
}


const getNote = async (req, res) => {
    try {
        if (!req.query.noteId) {
            return res.status(400).json({ message: "Bad Request" })
        }
        const note = await Note.findById(req.query.noteId);
        if (!note) {
            return res.status(400).json({ message: "Note Not found" })
        }
        return res.status(200).json({ error: false, note })


    } catch (error) {
        res.status(500).json({ message: 'Error getting a note deta', error });

    }
}

module.exports = { createNote, deleteNote, renameNote, getAllNotes, getNote }
