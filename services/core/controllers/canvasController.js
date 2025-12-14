const Canvas = require('../models/Canvas')


const getCanvas = async (req, res) => {
    const { projectId, pageId } = req.query

    try {
        const canvas = await Canvas.findOne({ projectId, pageId })
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' })
        }

        res.status(200).json({ message: 'Canvas retrieved successfully', canvas })
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving canvas', error })
    }
}



// Add assignees to a node
const addAssignees = async (req, res) => {
    const { projectId } = req
    const { pageId, nodeId, assignees } = req.body

    try {
        const canvas = await Canvas.findOne({ projectId, pageId })
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' })
        }

        const node = canvas.nodes.find(node => node.id === nodeId)
        if (!node) {
            return res.status(404).json({ message: 'Node not found' })
        }

        node.data.assignees = [...new Set([...node.data.assignees, ...assignees])] // Avoid duplicates

        await canvas.save()
        res.status(200).json({ message: 'Assignees added successfully', canvas })
    } catch (error) {
        res.status(500).json({ message: 'Error adding assignees', error })
    }
}

// Remove assignees from a node
const removeAssignees = async (req, res) => {
    const { projectId } = req
    const { pageId, nodeId, assignees } = req.body

    try {
        const canvas = await Canvas.findOne({ projectId, pageId })
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' })
        }

        const node = canvas.nodes.find(node => node.id === nodeId)
        if (!node) {
            return res.status(404).json({ message: 'Node not found' })
        }

        node.data.assignees = node.data.assignees.filter(assignee => !assignees.includes(assignee))

        await canvas.save()
        res.status(200).json({ message: 'Assignees removed successfully', canvas })
    } catch (error) {
        res.status(500).json({ message: 'Error removing assignees', error })
    }
}

// Delete a canvas (project and page)
const deleteCanvas = async (req, res) => {
    const { projectId } = req
    const { pageId } = req.query

    try {
        const canvas = await Canvas.findOneAndDelete({ projectId, pageId })
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' })
        }

        res.status(200).json({ message: 'Canvas deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting canvas', error })
    }
}

module.exports = {
    getCanvas,
    addAssignees,
    removeAssignees,
    deleteCanvas,
}
