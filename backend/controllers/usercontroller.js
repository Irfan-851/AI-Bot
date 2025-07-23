// const  userModel = require( '../model/usermodel.js');
// const   userService = require( '../services/userServices.js');
// const  { validationResult } = require( 'express-validator');
// const  redisClient = require( '../services/redisservices.js');

// // Create a new user
//  const createUserController = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//         let user = await userService.createUser(req.body);
//         const token = await user.generateJWT();
//         user = user.toObject();
//         delete user.password;
//         return res.status(201).json({ user, token });
//     } catch (error) {
//         console.error(error);
//         return res.status(400).send(error.message);
//     }
// }


// // Login a user
//  const loginController = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//         const { email, password } = req.body;
//         const user = await userModel.findOne({ email }).select('+password');
//         if (!user) {
//             return res.status(401).json({ errors: 'Invalid credentials' });
//         }
//         const isMatch = await user.isValidPassword(password);
//         if (!isMatch) {
//             return res.status(401).json({ errors: 'Invalid credentials' });
//         }
//         const token = await user.generateJWT();
//         let userObj = user.toObject();
//         delete userObj.password;
//         return res.status(200).json({ user: userObj, token });
//     } catch (err) {
//         console.error(err);
//         return res.status(400).send(err.message);
//     }
// }

// // Get user profile
//  const profileController = async (req, res) => {
//     try {
//         console.log(req.user);
//         return res.status(200).json({ user: req.user });
//     } catch (err) {
//         console.error(err);
//         return res.status(400).send(err.message);
//     }
// }

// // logout a user

//  const logoutController = async (req, res) => {
//     try {
//         let token;
//         if (req.cookies && req.cookies.token) {
//             token = req.cookies.token;
//         } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//             token = req.headers.authorization.split(' ')[1];
//         }
//         if (!token) {
//             return res.status(400).json({ message: 'No token provided' });
//         }
//         redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
//         return res.status(200).json({ message: 'Logged out successfully' });
//     } catch (err) {
//         console.error(err);
//         return res.status(400).send(err.message);
//     }
// }

// // Verify token and return user data
// const verifyTokenController = async (req, res) => {
//     try {
//         // The authUser middleware has already verified the token and attached user to req.user
//         const user = await userModel.findOne({ email: req.user.email }).select('-password');
//         if (!user) {
//             return res.status(401).json({ error: 'User not found' });
//         }
//         return res.status(200).json({ user });
//     } catch (err) {
//         console.error(err);
//         return res.status(401).json({ error: 'Token verification failed' });
//     }
// }

// //getall a user
//  const getAllUsersController = async (req, res) => {
//     try {
//         const loggedInUser = await userModel.findOne({
//             email: req.user.email
//         })

//         const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

//         return res.status(200).json({
//             users: allUsers
//         })

//     } catch (err) {
//         console.error(err)
//         return res.status(400).json({ error: err.message })
//     }
// }

// module.exports = {
//     createUserController,
//     loginController,
//     profileController,
//     logoutController,
//     getAllUsersController,
//     verifyTokenController
// }





const  userModel = require( '../model/usermodel.js');
const   userService = require( '../services/userServices.js');
const  { validationResult } = require( 'express-validator');
const  redisClient = require( '../services/redisservices.js');

// Create a new user
 const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let user = await userService.createUser(req.body);
        const token = await user.generateJWT();
        user = user.toObject();
        delete user.password;
        return res.status(201).json({ user, token });
    } catch (error) {
        console.error(error);
        return res.status(400).send(error.message);
    }
}


// Login a user
 const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        const token = await user.generateJWT();
        let userObj = user.toObject();
        delete userObj.password;
        return res.status(200).json({ user: userObj, token });
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.message);
    }
}

// Get user profile
 const profileController = async (req, res) => {
    try {
        console.log(req.user);
        return res.status(200).json({ user: req.user });
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.message);
    }
}

// logout a user

 const logoutController = async (req, res) => {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }
        // Redis removed: just return success
        // redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.message);
    }
}

// Verify token and return user data
const verifyTokenController = async (req, res) => {
    try {
        // The authUser middleware has already verified the token and attached user to req.user
        const user = await userModel.findOne({ email: req.user.email }).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Token verification failed' });
    }
}

//getall a user
 const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {
        console.error(err)
        return res.status(400).json({ error: err.message })
    }
}

module.exports = {
    createUserController,
    loginController,
    profileController,
    logoutController,
    getAllUsersController,
    verifyTokenController
}