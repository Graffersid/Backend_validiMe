import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
//const userModel = require('../models/User');
import userModel from "../models/User";

require("dotenv").config();

const protect = asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get Token from Header
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, '9e703762cd254ed1420ad1be4884fd4d')
            // Get User from the token
            await userModel.findById({_id: decoded.id}).select('-password')
            next()
        } catch (error) {
            console.log('error :', error)
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });  
        }
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no authToken"
        });
    }
})

module.exports = { protect }