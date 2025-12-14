const express = require('express')
const router = express.Router()
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")
const {
    getCanvas,
    addAssignees,
    removeAssignees,
    deleteCanvas,
} = require('../controllers/canvasController')



//Router to get canvas
router.get('/', authMiddleware, validatePageAccess, getCanvas)

// Route to add assignees to a node
router.put('/assignees/add', authMiddleware, validatePageAccess, addAssignees)

// Route to remove assignees from a node
router.put('/assignees/remove', authMiddleware, validatePageAccess, removeAssignees)

// Route to delete a canvas (project and page)
router.delete('/', authMiddleware, validatePageAccess, deleteCanvas)

module.exports = router
