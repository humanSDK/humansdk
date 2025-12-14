const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")
const { getSprints } = require("../controllers/sprintController")

router.get("/", authMiddleware, validatePageAccess, getSprints)

module.exports = router;