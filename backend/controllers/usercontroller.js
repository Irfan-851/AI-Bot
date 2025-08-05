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
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

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

//forgot passward 
// Improved forgotPassword to send a link that opens the frontend reset password page
const forgotPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user with that email' });
        }

        if (typeof user.getResetPasswordToken !== 'function') {
            return res.status(500).json({ success: false, message: 'User model misconfigured: missing getResetPasswordToken' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Use frontend URL for reset link
        // You can set FRONTEND_URL in your .env, fallback to localhost:3000
        const frontendUrl = process.env.FRONTEND_URL ;
        const resetUrl = `${frontendUrl}/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has 
requested the reset of a password. Please click the link below to reset your 
password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });
            return res.status(200).json({ success: true, data: 'Email sent' });
        } catch (emailErr) {
            console.error(emailErr);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err);
        if (res.headersSent) return next(err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};


// Reset password
const resetpassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { resetToken } = req.params;
    
        // Validate input
        if (!password || typeof password !== 'string' || password.length < 3) {
          return res.status(400).json({ success: false, message: 'Password must be at least 3 characters long.' });
        }
    
        if (!resetToken) {
          return res.status(400).json({ success: false, message: 'Reset token is missing from the URL.' });
        }
    
        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
        // Find user with valid token
        const user = await userModel.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpire: { $gt: Date.now() },
        });
    
        if (!user) {
          return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }
    
        // Set new password (hash it)
        user.password = await userModel.hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
    
        await user.save();
    
        return res.status(200).json({ success: true, message: 'Password reset successful.' });
      } 
    catch (err) {
        console.error(err);
        if (res.headersSent) return next(err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};


    

module.exports = {
    createUserController,
    loginController,
    profileController,
    logoutController,
    getAllUsersController,
    verifyTokenController,
    forgotPassword,
    resetpassword
}