const Project = require('../models/Project');
const Team = require('../models/Team');
const TeamMember = require("../models/TeamMember")
const User = require("../models/User")
const Page = require("../models/Page")


const createPage = async (req, res) => {
    try {
        if (!req.body.pageName) return res.status(400).json({ message: "Bad Request" })

        const page = new Page({
            name: req.body.pageName,
            createdBy: req.user.id,
            projectId: req.projectId
        })
        await page.save()

        return res.status(201).json({ message: "New Page created", page })

    } catch (error) {
        console.log("Failed to create page:", error.message)
        res.status(500).json({ message: 'Error creating page', error });

    }
}

const deletePage = async (req, res) => {
    try {
        if (!req.query.pageId) {
            return res.status(400).json({ message: "Bad Request 1" })
        }

        const page = await Page.findById(req.query.pageId)
        if (!page) return res.status(404).json({ message: 'Page not found' });

        page.softDelete = true;
        await page.save()

        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting page', error });
    }
}

const renamePage = async (req, res) => {
    try {
        if (!req.body.newPageName || !req.body.pageId) return res.status(400).json({ message: "Bad Request" })

        const page = await Page.findById(req.body.pageId)
        if (!page) return res.status(404).json({ message: 'Page not found' });

        page.name = req.body.newPageName;
        page.save();
        res.status(200).json({ message: 'Page renamed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error renaming page', error });

    }
}

const getAllPages = async (req, res) => {
    try {
        const pages = await Page.find({ projectId: req.projectId, softDelete: false }).select('')
        return res.status(200).json({ message: "List fetched successfully", pages })
    } catch (error) {
        res.status(500).json({ message: 'Error listing all pages', error });

    }
}

module.exports = { createPage, deletePage, renamePage, getAllPages }
