const userModel = require('../model/usermodel.js');
const bcrypt = require('bcryptjs');

const createUser = async ({
    email, password
}) => {

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    return user;

}

const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    }).select('-password');
    return users;
}

module.exports = {
    createUser,
    getAllUsers
}