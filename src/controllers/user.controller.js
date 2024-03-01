import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";
import {sendMail} from "../utils/nodemailer.js";

function validateEmail(email) {
    // Regular expression for a basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Test the email against the regular expression
    return emailRegex.test(email);
}

function isValidUsername(inputString) {
    // Check if the string starts or ends with "-"
    if (inputString.startsWith('-') || inputString.endsWith('-')) {
      return false;
    }
    // Check if the string contains spaces, special characters (except "-"), or capital letters
    if (/[\sA-Z!@#$%^&*()_+={}[\]:;<>,.?~\\\/]/.test(inputString)) {
      return false;
    }
    // Check if the string starts with a number
    if (/^\d/.test(inputString)) {
      return false;
    }
    // If all conditions are met, return true
    return true;
}


const createAdmin = asyncHandler(async (req, res) => {
    // get username,email,password,fullName from req.body
    const {username,email,password} = req.body;
    // check if username,email,password,fullName exists or not
    if(!username || !email || !password){
        throw new ApiError(400,"All fields are required");
    }
    // check if password is atleast 8 characters long or not
    if (password.length < 8) {
        throw new ApiError(400,"Password must be atleast 8 characters long");   
    }

    // validate email
    if (!validateEmail(email)) throw new ApiError(400,"Invalid email address");
    // validate username
    if (!isValidUsername(username.trim())) throw new ApiError(400,"Invalid username");
    // check if user already exists
    const existeduser = await User.findOne({$or:[{username:username},{email:email}]});
    
    if (existeduser) {
        throw new ApiError(400,"Admin already exists");
    }
    // create user
    const user = await User.create({
        username,
        email,
        password,
        role:"admin"
    });

    if (!user) {
        throw new ApiError(500,"Something went wrong while creating Admin");
    }

    // send response
    return res
    .status(201)
    .json(new ApiResponce(201,user,"Admin created successfully"));
});


const createUser = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // get username,email,password,fullName from req.body
    const {username,email,password} = req.body;
    // check if username,email,password,fullName exists or not
    if(!username || !email || !password){
        throw new ApiError(400,"All fields are required");
    }
    // check if password is atleast 8 characters long or not
    if (password.length < 8) {
        throw new ApiError(400,"Password must be atleast 8 characters long");   
    }

    // validate email
    if (!validateEmail(email)) throw new ApiError(400,"Invalid email address");
    // validate username
    if (!isValidUsername(username.trim())) throw new ApiError(400,"Invalid username");
    // check if user already exists
    const existeduser = await User.findOne({$or:[{username:username},{email:email}]});
    
    if (existeduser) {
        throw new ApiError(400,"User already exists");
    }
    // create user
    const user = await User.create({
        username,
        email,
        password,
        role:"user"
    });

    if (!user) {
        throw new ApiError(500,"Something went wrong while creating user");
    }

    // send response
    return res
    .status(201)
    .json(new ApiResponce(201,user,"User created successfully"));
})

const login = asyncHandler(async (req, res) => {
    // get username or email and password from req.body
    const {identifier,password} = req.body;
    // check if username or email and password exists
    if (!identifier) {
        throw new ApiError(400,"Username or email is required");
    }
    if (!password) {
        throw new ApiError(400,"Password is required");
    }
    // find user by username or email
    const user = await User.findOne({$or:[{username:identifier},{email:identifier}]}) // find user by username or email
    // check if user exists
    if (!user) {
        throw new ApiError(404,"user dose not exists");
    }
    // check if password is correct
    const isCorrectPassword = await user.isPasswordMatch(password)
    // if password is incorrect
    if (!isCorrectPassword) {
        throw new ApiError(400,"Invalid credentials");
    }
    // generate access token
    const accessToken = user.generateAccessToken();
    // find user by id and send response
    const logedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }
    // send response
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponce(200,{accessToken,user:logedInUser},"User logged in successfully"));
});


const logoutUser = asyncHandler(async(req,res)=>{
    // get user from req.user
    const user = req.user;

    if (!user) {
        throw new ApiError(404,"unauthorized request");
    }

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }
    // send response
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .json(new ApiResponce(200,{},"User logged out successfully"));
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    // get user from req.user
    const user = req.user;
    return res
    .status(200)
    .json(new ApiResponce(200,user,"User get successfully"));
})

const requestForgotPasswordEmail = asyncHandler(async(req,res)=>{
    // get email from req.body
    const {email} = req.body;
    // check if email exists or not
    if (!email) {
        throw new ApiError(400,"Email is required");
    }
    // validate email
    if (!validateEmail(email)) throw new ApiError(400,"Invalid email address");
    // find user by email
    const user = await User.findOne({email:email}).select("-password");
    // check if user exists or not
    if (!user) {
        throw new ApiError(400,"Email dose not exists");
    }
    let OTP="";
    const str = "1234567890";
    for (let i = 0; i < 6; i++) {
        OTP += str[Math.floor(Math.random()*10)]
    }

    const token = jwt.sign({email:user.email,username:user.username,_id:user._id,OTP:OTP},
        process.env.FORGOT_PASSWORD_SECRET,
        {expiresIn:process.env.FORGOT_PASSWORD_EXPIRY});
    // send OTP to user email
    await sendMail({otp:OTP,email:user.email,username:user.username});
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{token},"OTP sent successfully"));
})


const resetPassword = asyncHandler(async(req,res)=>{
    // get email,OTP,password from req.body
    const {token,OTP,password} = req.body;
    // check if Token exists or not
    if (!token) {
        throw new ApiError(400,"Unauthorized request");
    }
    // check if OTP,password exists or not
    if (!OTP || !password) {
        throw new ApiError(400,"All fields are required");
    }
    // verify token
    const decoded = jwt.verify(token,process.env.FORGOT_PASSWORD_SECRET);
    // check if OTP is valid or not
    if (!decoded) {
        throw new ApiError(400,"Invalid OTP");
    }
    // check if OTP is valid or not
    if (decoded.OTP !== OTP) {
        throw new ApiError(400,"Invalid OTP");
    }
    // find user by email
    const user = await User.findOne({email:decoded.email});
    // check if user exists or not
    if (!user) {
        throw new ApiError(400,"Email dose not exists");
    }
    // update password
    user.password = password;
    // save user
    await user.save();
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{},"Password reset successfully"));
})

const chengePassword = asyncHandler(async(req,res)=>{
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // get oldPassword,newPassword from req.body
    const {oldPassword,newPassword} = req.body;
    // check if oldPassword,newPassword exists or not
    if (!oldPassword || !newPassword) {
        throw new ApiError(400,"All fields are required");
    }
    // get user from req.user
    const user = await User.findById(req.user?._id);
    // check if user exists or not
    if (!user) {
        throw new ApiError(404,"User dose not exists");
    }
    // check user is admin or not
    if (user.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // check if oldPassword is correct or not
    const isCorrectPassword = await user.isPasswordMatch(oldPassword);
    // if oldPassword is incorrect
    if (!isCorrectPassword) {
        throw new ApiError(400,"Invalid old password");
    }
    // update password
    user.password = newPassword;
    // save user
    await user.save();
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{},"Password changed successfully"));
})


const changeEmail = asyncHandler(async(req,res)=>{
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // get email from req.body
    const {email} = req.body;
    // check if email exists or not
    if (!email) {
        throw new ApiError(400,"Email is required");
    }
    // validate email
    if (!validateEmail(email)) throw new ApiError(400,"Invalid email address");
    // get user from req.user
    const user = await User.findById(req.user?._id);
    // check if user exists or not
    if (!user) {
        throw new ApiError(404,"User dose not exists");
    }
    // check user is admin or not
    if (user.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // check if email is already exists or not
    const existeduser = await User.findOne({email:email});
    if (existeduser) {
        throw new ApiError(400,"Email already exists");
    }
    // update email
    user.email = email;
    // save user
    await user.save();
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{},"Email changed successfully"));
})


const changeUsername = asyncHandler(async(req,res)=>{
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // get username from req.body
    const {username} = req.body;
    // check if username exists or not
    if (!username) {
        throw new ApiError(400,"Username is required");
    }
    // validate username
    if (!isValidUsername(username.trim())) throw new ApiError(400,"Invalid username");
    // get user from req.user
    const user = await User.findById(req.user?._id);
    // check if user exists or not
    if (!user) {
        throw new ApiError(404,"User dose not exists");
    }
    // check user is admin or not
    if (user.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // check if username is already exists or not
    const existeduser = await User.findOne({username:username});
    if (existeduser) {
        throw new ApiError(400,"Username already exists");
    }
    // update username
    user.username = username;
    // save user
    await user.save();
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{},"Username changed successfully"));
})

const deleteUser = asyncHandler(async(req,res)=>{
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // get userId from req.params
    const {username} = req.params;
    // check if username exists or not
    if (!username) {
        throw new ApiError(400,"User id is required");
    }
    
    if (username === req.user.username) {
        throw new ApiError(400,"You can not delete Admin account");
    }
    // find user by id
    const user = await User.findOne({username:username});
    // check if user exists or not
    if (!user) {
        throw new ApiError(404,"User dose not exists");
    }
    // delete user
    const deletedUser = await User.findByIdAndDelete(user._id);
    // check if user deleted or not
    if (!deletedUser) {
        throw new ApiError(500,"Something went wrong while deleting user");
    }
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,{},"User deleted successfully"));
});


const getAllUsers = asyncHandler(async(req,res)=>{
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    // find all users
    const users = await User.aggregate([{
        $match:{
            role:"user"
        }
    }]);
    // check if users exists or not
    if (!users) {
        throw new ApiError(404,"No users found");
    }
    // send response
    return res
    .status(200)
    .json(new ApiResponce(200,users,"Users found"));
});

export {
    createAdmin,
    createUser,
    login,
    logoutUser,
    getCurrentUser,
    requestForgotPasswordEmail,
    resetPassword,
    chengePassword,
    changeEmail,
    changeUsername,
    deleteUser,
    getAllUsers,
}