const Project = require('../model/projectmodel.js');
const mongoose = require('mongoose');

const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error('name is required');
    }
    if (!userId) {
        throw new Error('user is required');
    }

    let project;
    try {
        project = await Project.create({ name, users: [userId] });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }
    return project;
};

// get all projects 
const getAllProjectsid = async ({ userId }) => {
    if (!userId) {
        throw new Error('user is required');
    }
    const projects = await Project.find({
        users: userId
    });
    return projects;
}

// add user in project
const adduserinproject = async ({ projectId, users, userId }) => {
    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    if (!users) {
        throw new Error("users are required");
    }
    if (!Array.isArray(users) || users.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Invalid userId(s) in users array");
    }
    if (!userId) {
        throw new Error("userId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }

    const existingproject = await Project.findOne({
        _id: projectId,
        users: userId
    });

    if (!existingproject) {
        throw new Error("User not belong to this project");
    }

    const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );

    return updatedProject;
}

// get project detail
const getProjectDetail = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    const project = await Project.findOne({ _id: projectId }).populate('users');
    return project;
}

const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    if (!fileTree) {
        throw new Error("fileTree is required");
    }
    const project = await Project.findOneAndUpdate(
        { _id: projectId },
        { fileTree },
        { new: true }
    );
    return project;
}

module.exports = {
    createProject,
    getAllProjectsid,
    adduserinproject,
    getProjectDetail,
    updateFileTree
};