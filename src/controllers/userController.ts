import { NextFunction, Request, Response } from "express";
import { Result } from "express-validator";
import mongoose from "mongoose";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
import { config } from '../config/config';

import userSchema from "../models/User";
import ideaModel from '../models/Idea';
import { any } from "joi";
import User from "../models/User";

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
            return res.status(400).json({success: false, message: "password and confirm password do not match!" });
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
                contactNumber: user.contactNumber
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
    if (user && (await bcrypt.compare(password, user.password))) {
        
        let payload = {
            "userId": user._id,
            "email": user.email
        }
        const token = await jwt.sign({id: user._id}, config.token.JWT_SECRET, {
            expiresIn: config.token.JWT_TOKEN_EXPIRED
        })

        let updateToken =  await userSchema.updateOne({_id: user._id}, { $set : {authToken: token}});

        return res.status(200).json({success: true,
            message: "Login Successfully", 
            data: {
                userId: user._id,
                email: user.email,
                fullName: user.fullName,
                contactNumber: user.contactNumber,
                token: token
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

/* user list testing for auth api */
const getUserList = async (req: Request, res: Response, next: NextFunction) => {
    const user =  await userSchema.find()
    return res.send(user)
}

/* update Password */
const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const {userId, oldPassword, password, confirmPassword} = req.body

    if(!userId || !oldPassword || !password || !confirmPassword || userId == "" || oldPassword == "" || password == "" || confirmPassword == "") {
        return res.status(422).json({success: false, message: "Please add all fields"});
    }
    if (password != confirmPassword) {
        return res.status(400).json({success: false, message: "password and confirm password do not match!" });
    }
    const user =  await userSchema.findOne({_id: userId})
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        let updatedPassword =  await userSchema.updateOne({_id: user._id}, { $set : {password: hashedPassword}});
        return res.status(201).json({
            success: true,
            message: 'password update successfully',
        })
    } else {
        return res.status(400).json({success: false, message: "Invalid credentials"});
    }
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const {email} = req.body
    if (email == undefined || email == null || email == "") {
		res.status(422).json({success: false, message: "email cannot be blank" });
		return;
	}
    return res.status(201).json({
        success: true,
        message: "Thank you! An email has been sent to " + email + " email id. Please check your inbox."
    })
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		res.status(422).json({success: false, message: "userId cannot be blank" });
		return;
	}
    let updatedPassword =  await userSchema.updateOne({_id: userId}, { $set : {authToken: null}});
    return res.status(201).json({
        success: true,
        message: "logout successfully"
    })
};

const postIdea = async (req: Request, res: Response, next: NextFunction) => {
    const {userId, } = req.body
    if (userId == undefined || userId == null || userId == "") {
        return res.status(422).json({success: false, message: "userId cannot be blank" });
	}
    try {
        const newIdea = new ideaModel(req.body);
        await newIdea.save().then((response: any) => {
            return res.status(201).json({
                status: 201, 
                message: "idea post successfully" 
            });
        })
    } catch (e) {
        console.log('error :', e)
        return res.status(400).json({
            status: 400, 
            message: 'Some error occurred while post the Idea.'
        });
    }
};

const updateIdeaStatus = async (req: Request, res: Response, next: NextFunction) => {
    const {_id, status } = req.body
    if (_id == undefined || _id == null || _id == "" || status == null || status == "") {
		return res.status(422).json({success: false, message: "please fill all fields" });
	}
    try {
        const idea =  await ideaModel.findOne({_id: _id})
        if(!idea) {
            return res.status(400).json({
                status: 400, 
                message: "no idea found"
            });
        }
        else {
            let updatedStatus =  await ideaModel.updateOne({_id}, { $set : {status: req.body.status}});
            console.log('updatedStatus', updatedStatus)
            return res.status(201).json({
                success: true,
                message: "status update successfully"
            })
        }
    } catch (error) {
        return res.status(400).json({
            status: 400, 
            message: 'something went wrong'
        }); 
    }
};

const getIdeaByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		return res.status(422).json({success: false, message: "userId cannot be blank" });
	}
    const idea =  await ideaModel.find({userId})
    if(idea){
        return res.status(201).json({
            success: true,
            message: "idea list",
            data: idea
        })
    } 
    else {
        return res.status(400).json({
            status: 400, 
            message: "no idea found"
        });
    }
}
const searchWithTargetAudience = async (req: Request, res: Response, next: NextFunction) => {
    const {ageGroup, gender, maritalStatus, occupption, country, state, city } = req.body
    
    const target = await ideaModel.find({ $or : [
        {'ageGroup': new RegExp(ageGroup, 'i')},
        { 'gender': new RegExp(gender, 'i')},
        { 'maritalStatus': new RegExp(maritalStatus, 'i')},
        { 'occupption': new RegExp(occupption, 'i')},
        { 'country': new RegExp(country, 'i')},
        { 'state': new RegExp(state, 'i')},
        { 'city': new RegExp(city, 'i')},
        {status: true}
    ]}).populate('userId').sort({"createdAt": -1});

    //const targets = await ideaModel.find( { $or: [ { ageGroup: new RegExp(ageGroup, 'i') }, { status: true} ] } ).populate('userId')

    //const targetAudience = await ideaModel.find({ $or : [{'ageGroup': new RegExp(ageGroup, 'i') }, { 'gender': new RegExp(gender, 'i') }, {'maritalStatus': maritalStatus}, {'occupption': occupption},{'country': country},{'state': state},{'city': city} ]}).sort({"createdAt": -1});
    if(target.length>0){
        return res.status(201).json({
            success: true,
            message: "target audience list",
            data: target
        })
    }
    else {
        const target = await ideaModel.find({$and: [{ createdAt: -1 } ,{ status: true }]}).populate('userId');
        //const target = await ideaModel.find().sort({"createdAt": -1}).populate('userId');
        return res.status(201).json({
            success: true,
            message: "target audience list",
            data: target
        })
    }
};


export default {
    logout,
    loginUser,
    signupUser,
    getUserList,
    updateProfile,
    forgotPassword,
    updateUserPassword,
    postIdea,
    getIdeaByUserId,
    updateIdeaStatus,
    searchWithTargetAudience,  
}