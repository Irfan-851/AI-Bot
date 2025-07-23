const{ Router }= require('express');
const userController= require('../controllers/usercontroller.js');
const{ body }= require('express-validator');
const authMiddleware= require('../middleware/authmiddleware.js');

const router = Router();


//http://localhost:6000/api/userapi/register
router.post('/register',
    
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    userController.createUserController);


//http://localhost:6000/api/userapi/login
router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    userController.loginController);


//http://localhost:6000/api/userapi/profile
router.get('/profile', 
    authMiddleware,
      userController.profileController);


//http://localhost:6000/api/userapi/verify-token
router.get('/verify-token', 
    authMiddleware,
    userController.verifyTokenController);


//http://localhost:6000/api/userapi/logout
router.get('/logout', authMiddleware, userController.logoutController);



//http://localhost:6000/api/userapi/all
router.get('/all', authMiddleware, userController.getAllUsersController);


module.exports = router;