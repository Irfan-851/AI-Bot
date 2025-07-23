const express = require('express');
const projectController = require('../controllers/projectController');
const {body}= require('express-validator');
const authMiddleware= require('../middleware/authmiddleware.js');




const router = express.Router();

// Create a new project
//http://localhost:6000/api/projectapi/create
router.post('/create',     
    body('name').isString().withMessage('Name must be at least 3 characters long'),  
    authMiddleware,
    
    projectController.createProjectController);

// Get all projects
//http://localhost:6000/api/projectapi/getall
router.get('/getall',
    authMiddleware,
     projectController.getAllProjects);


     // add user in project
     //http://localhost:6000/api/projectapi/adduserinproject    
     router.put('/adduserinproject',
        body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
            authMiddleware,        
         projectController.adduserinproject);



         // Get a single project by ID
         //http://localhost:6000/api/projectapi/getproject/1         
         router.get('/getproject/:Id',
            authMiddleware,
             projectController.getprojectdetail);


             router.put('/updateFile',
                body('projectId').isString().withMessage('Project ID is required'),
                body('file').isString().withMessage('File is required'),
                authMiddleware,
                projectController.updateFileTree)

















//     // get all user
//     //http://localhost:6000/api/projectapi/getalluserinproject
//     router.get('/getalluserinproject',
//         body('projectId').isString().withMessage('Project ID is required'),
//         authMiddleware,
//         projectController.getalluserinproject);





// // Delete a project by ID
// router.delete('/delete/:id', projectController.deleteProject);

module.exports = router;