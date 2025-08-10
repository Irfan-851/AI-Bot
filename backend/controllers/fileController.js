

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../model/filemodel');
const jwt = require('jsonwebtoken');

const fileUploadr = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract user info from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let userId = decoded.id;
        
        // For backward compatibility with old tokens that only have email
        if (!userId && decoded.email) {
            const User = require('../model/usermodel');
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            userId = user._id;
        }
        
        if (!userId) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        // Get projectId from request body or query
        const projectId = req.body.projectId || req.query.projectId;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const file = req.file;
        
        // Save file metadata to database
        const fileRecord = new File({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/temp-files/${file.filename}`,
            path: file.path,
            uploadedBy: userId,
            projectId: projectId
        });

        await fileRecord.save();

        // Return file metadata
        res.status(200).json({
            success: true,
            file: {
                id: fileRecord._id,
                name: file.originalname,
                filename: file.filename,
                type: file.mimetype,
                size: file.size,
                url: `/temp-files/${file.filename}`,
                path: file.path,
                uploadedBy: userId,
                projectId: projectId,
                uploadedAt: fileRecord.uploadedAt
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
};

// Get files for a project
const getProjectFiles = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Extract user info from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const files = await File.find({ 
            projectId: projectId, 
            isDeleted: false 
        }).populate('uploadedBy', 'email name').sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            files: files
        });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};

// Delete a file
const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Extract user info from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let userId = decoded.id;
        
        // For backward compatibility with old tokens that only have email
        if (!userId && decoded.email) {
            const User = require('../model/usermodel');
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            userId = user._id;
        }
        
        if (!userId) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if user owns the file or has permission
        if (file.uploadedBy.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this file' });
        }

        // Soft delete
        file.isDeleted = true;
        await file.save();

        // Optionally delete physical file
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (deleteError) {
            console.error('Physical file deletion error:', deleteError);
        }

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};

module.exports = { fileUploadr, getProjectFiles, deleteFile };