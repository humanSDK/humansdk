const Project = require('../models/Project');
const Team = require('../models/Team');
const TeamMember = require("../models/TeamMember")
const User = require("../models/User")
const Page = require("../models/Page")
const Note = require("../models/Note");
const Canvas = require('../models/Canvas');


const getAllPages = async (req, res) => {
    try {
        const pages = await Page.find({ projectId: req.projectId, softDelete: false })
        return res.status(200).json({ pages })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getPageDetail = async (req, res) => {
    try {
        if (!req.query.pageId) return res.status(400).json({ message: "Bad Request" })

        const page = await Page.findById(req.query.pageId)
        if (!page) return res.status(404).json({ message: "Not found" })

        return res.status(200).json({ page })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getAllTasksForPage = async (req, res) => {
    try {
        if (!req.query.pageId) return res.status(400).json({ message: "Bad Request" })

        const canvas = await Canvas.findOne({ projectId: req.projectId, pageId: req.query.pageId })
        if (!canvas) return res.status(404).json({ message: "Not found" })

        const allTasks = canvas.nodes;
        if (!allTasks) return res.status(404).json({ message: "Tasks Not found" })
        return res.status(200).json({ allTasks })
    } catch (error) {

    }
}

module.exports = { getAllPages, getPageDetail, getAllTasksForPage }