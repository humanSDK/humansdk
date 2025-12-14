// routes/projectRoutes.js
const express = require('express');
const {
    createProject,
    deleteProject,
    updateProjectDetails,
    getUserProjects,
    getProjectDetails,
    getFullProjectDetails,
    getProjectsAssociated
} = require('../controllers/projectController');
const { authMiddleware } = require("../middleware/authMiddleware")

const router = express.Router();

// Route to create a new project
router.post('/create', authMiddleware, createProject);

//Route to projects that user is associated as memeber
router.get('/teams-associated', authMiddleware, getProjectsAssociated)

// Route to delete a project
router.delete('/:projectId', authMiddleware, deleteProject);

// Route to get all projects for a user
router.get('/user', authMiddleware, getUserProjects);

// Route to get simple project details
router.get('/:projectId', getProjectDetails);

// Route to get full project details
router.get('/details/:projectId', getFullProjectDetails);

// Route to update project details
router.put('/:projectId', authMiddleware, updateProjectDetails);

module.exports = router;
