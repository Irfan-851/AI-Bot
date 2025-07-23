const Project = require("../model/projectmodel");
const { validationResult } = require("express-validator");
const ProjectService = require("../services/projectServices");
const userModel = require("../model/usermodel");

// Create a new project
const createProjectController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Project name is required" });
        }
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = loginuser._id;
        const newproject = await ProjectService.createProject({ name, userId });
        return res.status(201).json({ newproject });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// Get all projects for the logged-in user
const getAllProjects = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = loginuser._id;
        const projects = await ProjectService.getAllProjectsid({ userId });
        return res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// Add users to a project
const adduserinproject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { projectId, users } = req.body;
        if (!projectId || !users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "projectId and users array are required" });
        }
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = loginuser._id;
        const project = await ProjectService.adduserinproject({ projectId, users, userId });
        return res.status(201).json({ project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// Get project detail
const getprojectdetail = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = loginuser._id;
        const projectId = req.params.Id;
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }
        const project = await ProjectService.getProjectDetail({ projectId, userId });
        if (!project) {
            return res.status(404).json({ error: "Project not found or access denied" });
        }
        return res.status(200).json({ project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// Update file tree of a project
const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { projectId, fileTree } = req.body;
        if (!projectId || !fileTree) {
            return res.status(400).json({ error: "projectId and fileTree are required" });
        }
        const project = await ProjectService.updateFileTree({ projectId, fileTree });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        return res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createProjectController,
    getAllProjects,
    adduserinproject,
    getprojectdetail,
    updateFileTree
};
