// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")
const { createPage, deletePage, renamePage, getAllPages } = require("../controllers/pageController")

//validate access special routes
router.get("/validate-access", authMiddleware, validatePageAccess, (req, res) => {
    return res.status(200).json({ error: false })
})

// creating page 
router.post("/create", authMiddleware, validatePageAccess, createPage)

//get pages for a project
router.get("/list", authMiddleware, validatePageAccess, getAllPages)

// deleting page 
router.delete("/", authMiddleware, validatePageAccess, deletePage)

//update page/rename
router.put("/", authMiddleware, validatePageAccess, renamePage)

module.exports = router;
