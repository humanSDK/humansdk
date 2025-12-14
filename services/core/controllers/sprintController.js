
const Sprint = require("../models/Sprint")


exports.getSprints = async (req, res) => {
    try {
        if (!req.projectId) {
            return res.status(403).json({ message: "Unauthoriazed" })
        }
        const sprintboard = await Sprint.findOne({ projectId: req.projectId })
        if (!sprintboard) {
            return res.status(404).json({ message: "Sprint not found" })
        }
        return res.status(200).json({ error: false, sprint: sprintboard })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}