const { Router } = require('express');
const { fileUploadr, getProjectFiles, deleteFile } = require('../controllers/fileController.js');
const upload = require('../middleware/fileUploadMiddleware.js');

const router = Router();

// POST /api/fileUploadapi/upload
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 100MB limit' });
      }
      if (err.message.includes('File type')) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, fileUploadr);

// GET /api/fileUploadapi/project/:projectId
router.get('/project/:projectId', getProjectFiles);

// DELETE /api/fileUploadapi/:fileId
router.delete('/:fileId', deleteFile);



    module.exports = router;