// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")
const { createNote, deleteNote, renameNote, getAllNotes, getNote } = require("../controllers/notesController")

//validate access special routes
router.get("/validate-access", authMiddleware, validatePageAccess, (req, res) => {
    return res.status(200).json({ error: false })
})

// creating page 
router.post("/create", authMiddleware, validatePageAccess, createNote)

//get pages for a project
router.get("/list", authMiddleware, validatePageAccess, getAllNotes)

// deleting page 
router.delete("/", authMiddleware, validatePageAccess, deleteNote)

//update page/rename
router.put("/", authMiddleware, validatePageAccess, renameNote)

//get a note by id
router.get("/", authMiddleware, validatePageAccess, getNote)

module.exports = router;
