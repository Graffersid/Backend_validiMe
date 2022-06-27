import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

import userSchema from "../models/User";

const signupUser = async (req: Request, res: Response, next: NextFunction) =>{
    const {fullName, email, contactNumber, password, confirmPassword} = req.body

    if(!fullName ||  !email || !contactNumber|| !password || !confirmPassword || fullName == "" || email == "" || contactNumber == "" || password == "" || confirmPassword == ""){
        return res.status(422).json({
            success: false,
            message: "Please add all fields"
        });
    }

    let existingContactNumber = await userSchema.findOne({"contactNumber": contactNumber});
    if(existingContactNumber) {
        return res.status(400).json({success: false, message: "mobile number already exists"});
    }

    let existingUser = await userSchema.findOne({"email": email});
    if(existingUser) {
        return res.status(400).json({success: false, message: "user already exists"});
    }
    else {
        if(contactNumber.length != 10) {
            return res.status(400).json({status: false, message: 'contact number must be 10 digits.'});
        }
        if (email) {
            var validRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var results = validRegex.test(email)
            if (results == false) {
                return res.status(400).json({success: false, message: "you have entered an invalid email address!"});
            }
        }
        if(password.length < 6 || password.length > 13) {
            return res.status(400).json({success: false, message: "password should be 6 to 13 character long"}); 
        }
        
        if (password != confirmPassword) {
            return res.status(400).json({success: false, message: "Password do not match!" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new userSchema({
            fullName, email, contactNumber, password: hashedPassword, 
        });
        return user
        .save()
        .then(user =>  res.status(201).json({
            status: true,
            message: 'user register successfully',
            data: {
                //_id: user._id,
                userId: user._id,
                email: user.email,
                fullName: user.fullName,
                contactNumber: user.contactNumber,
                token: generateToken(user._id)
            }
            //data: user
        })
        ).catch(error => res
        .status(400).json({error}))
    }
};


const loginUser = async (req: Request, res: Response, next: NextFunction) =>{
    const {email, password} = req.body
    if(!email || !password || email == "" || password == ""){
        return res.status(422).json({success: false, message: "Please add all fields"});
    }
    const user =  await userSchema.findOne({email})
    if (user && (await bcrypt.compare(password, user.password))) {4
        
        let payload = {
            "userId": user._id,
            "email": user.email
        }
        const token = jwt.sign({payload}, '9e703762cd254ed1420ad1be4884fd4d', {
            expiresIn: '30d'
        })

        let updateToken =  await userSchema.updateOne({_id: user._id}, { $set : {authToken: token}});

        return res.status(200).json({success: true,
            message: "Login Successfully", 
            data: {
                userId: user._id,
                email: user.email,
                fullName: user.fullName,
                contactNumber: user.contactNumber,
                authToken: token
                //authToken: generateToken(user._id)
            }
        });
    }
    else {
        return res.status(400).json({success: false, message: "Invalid credentials"});
    }
}

// Generate JWT
const generateToken = (userId: any) => {

    return jwt.sign({userId}, '9e703762cd254ed1420ad1be4884fd4d', {
        expiresIn: '30d'
    })
}


const  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		res.status(422).json({success: false, message: "userId cannot be blank" });
		return;
	}
    return userSchema.findById({_id: userId}).then((user) =>{
        if(user) {
            user.set(req.body)
            return user.save()
            .then(user =>  res.status(201).json({
                success: true,
                message: 'profile update successfully',
               // data: user
            })).catch(error => res.status(500).json({error}))
        }
        else {
            return res.status(404).json({success: false, message: 'Not found'});
        }
    }).catch(error => res.status(400).json({error}));
};

/* update Password */
const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const {userId, oldPassword, password, confirmPassword} = req.body
    if (userId == undefined || userId == null || userId == "") {
		res.status(422).json({success: false, message: "userId cannot be blank" });
		return;
	}
    if (oldPassword == undefined || oldPassword == null || oldPassword == "") {
		res.status(422).json({success: false, message: "oldPassword cannot be blank" });
		return;
	}

    let post: any = await userSchema.findOne({_id: userId});

    
    let  userPassword = post.password
    console.log('userPassword :', userPassword)
    if(userPassword != oldPassword) {
        return res.status(404).json({success: false, message: 'old password do not match'});
    }
    else {
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match!"
            });
        }
        return userSchema.findById({_id: userId}).then((user) =>{
            if(user) {
                user.set(req.body)
                return user.save()
                .then(user =>  res.status(201).json({
                    success: true,
                    message: 'password update successfully',
                   // data: user
                })).catch(error => res.status(400).json({error}))
            }
            else {
                return res.status(404).json({success: false, message: 'Not found'});
            }
        }).catch(error => res.status(400).json({error}));
    }
};






export default {signupUser, loginUser, updateProfile, updateUserPassword}