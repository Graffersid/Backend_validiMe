import { NextFunction, Request, Response } from "express";
const asyncHandler = require('express-async-handler')
import { Result } from "express-validator";
import mongoose from "mongoose";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
import { config } from '../config/config';

import userSchema from "../models/User";
import ideaModel from '../models/Idea';
import validateIdeaModel from '../models/ValidateIdea';
import notificationModel from "../models/Notification";

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
            fullName, email, contactNumber, password: hashedPassword, point: 0, following: 0, followers: 0 
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
    if(!email || !password || email == "" || password == "") {
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
               data: user
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
        return res.status(404).json({success: false, message: "Invalid credentials"});
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

const removeProfilePicture = async(req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		res.status(422).json({success: false, message: "userId cannot be blank" });
		return;
	}
    return userSchema.findById({_id: userId}).then((user) =>{
        if(user) {
            user.set({images: null})
            return user.save()
            .then(user =>  res.status(201).json({
                success: true,
                message: 'profile picture remove successfully'
               //data: user
            })).catch(error => res.status(500).json({error}))
        }
        else {
            return res.status(404).json({success: false, message: 'Not found'});
        }
    }).catch(error => res.status(403).json({error}));
}

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
        var points: number = 5;
        let views: number = 0;
        const ideaDetails = {views, points, ...req.body }
        const newIdea = new ideaModel(ideaDetails);
        await newIdea.save().then((response: any) => {
            return res.status(201).json({
                status: 201, 
                message: "idea post successfully"
            });
        })
    } catch (e) {
        console.log('error :', e)
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
};


const getIdeaList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idea =  await ideaModel.find({status: true}).sort({"createdAt":-1}).limit(50);
        if(idea.length>0) {
            return res.status(201).json({
                success: true,
                message: " post idea list",
                data: idea
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "no idea found",
            }) 
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
};

const updateIdeaStatus = async (req: Request, res: Response, next: NextFunction) => {
    const {_id, status } = req.body
    console.log(req.body)
    // if (_id == undefined || _id == null || _id == "" || status == null || status == "") {
	// 	return res.status(422).json({success: false, message: "please fill all fields" });
	// }
    try {
        const idea =  await ideaModel.findOne({_id: _id})
        if(!idea) {
            return res.status(404).json({
                success: false, 
                message: "no idea found"
            });
        }
        else {
            let updatedStatus =  await ideaModel.updateOne({_id}, { $set : {status: req.body.status}});
            let validatedStatus =  await validateIdeaModel.updateMany({ideaId:req.body._id}, { $set : {status: req.body.status}});
            /*
                console.log('updatedStatus', updatedStatus)
                console.log('validatedStatus :', validatedStatus)
            */
            return res.status(201).json({
                success: true,
                message: "status update successfully"
            })
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        }); 
    }
};

const getIdeaByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		return res.status(422).json({success: false, message: "userId cannot be blank" });
	}

    try {
        const idea =  await ideaModel.find({userId})
        if(idea){
            return res.status(201).json({
                success: true,
                message: "idea list",
                data: idea
            })
        } 
        else {
            return res.status(404).json({
                status: 404, 
                message: "no idea found"
            });
        }
        
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
}

const searchAudience = async (req: Request, res: Response, next: NextFunction) => {
    //console.log(req.params.key);
    try {
        const data = await ideaModel.find( {
            $and: [
                {status: true},
                { $or: [
                    {"ageGroup":{$regex: req.params.key}},
                    {"gender":{$regex: req.params.key}},
                    {"maritalStatus":{$regex: req.params.key}},
                    {"occupption":{$regex: req.params.key}},
                    {"country":{$regex: req.params.key}},
                    {"state":{$regex: req.params.key}},
                    {"city":{$regex: req.params.key}},
                ]}
            ]
        }).populate('userId').sort({"createdAt": -1});
    
        if(data.length>0){
            return res.status(201).json({
                success: true,
                message: "target audience list",
                data: data
            })
        }
        else{
            return res.status(404).json({
                success: false,
                message: "no data found"
            })
        } 
        
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
}

/*
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
*/


//const idea =  await ideaModel.findOne({_id: _id});

const ideaDetailByIdeaId = async (req: Request, res: Response, next: NextFunction) => {
    const {_id } = req.body
    if (_id == undefined || _id == null || _id == "") {
		return res.status(422).json({success: false, message: "_id cannot be blank" });
	}

    try {
        const idea =  await ideaModel.findOne({_id});
        if (idea) {
            return res.status(200).json({
                success: true,
                data : idea
            })   
        } else {
            return res.status(404).json({
                success: false,
                message: "idea not found"
            })   
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
};

const validateIdea = async (req: Request, res: Response, next: NextFunction) => {
    const {userId, ideaId } = req.body
    if (userId == undefined || userId == null || userId == "" || ideaId == null || ideaId == "" || ideaId == undefined ) {
        return res.status(422).json({success: false, message: "please fill all mandatory fields" });
	}
    try {
        const validate =  await validateIdeaModel.findOne({ $and: [ { userId: userId }, { ideaId: ideaId } ] });
        if (validate) {

            let status: boolean = true;
            const points: any = 5;

            const validatedideaDetails = {status, points, ...req.body }
            const validateIdea = new validateIdeaModel(validatedideaDetails);
            await validateIdea.save()

            const postNotification = new notificationModel({
                userId: req.body.userId,
                fullName: req.body.fullName,
                imageURL: req.body.imageURL,
                message: req.body.message,
                notification_type: 'validate Idea',
            })
            await postNotification.save()

            const userDetails =  await userSchema.findOne({_id: userId})
            let maxPoint: any =  userDetails?.point + points
            let updatePoint =  await userSchema.updateOne({_id: userId}, { $set : {point: maxPoint}});

            return res.status(201).json({
                success: true,
                message: "idea validate successfully"
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "you have already validated this ideas"
            })
        }
    } catch (e) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
};

//const countQuestion = async (req: Request, res: Response, next: NextFunction) => {
const questionCount =  asyncHandler(async (req: Request , res: Response, next: NextFunction) => {  
    const { ideaId } = req.body
    //await isValidObjectId(ideaId);

    if (ideaId == "" || ideaId == null || ideaId == undefined ) {
        return res.status(422).json({success: false, message: "please fill all mandatory fields" });
	}
    try {
        const idea = await ideaModel.findOne({_id: req.body.ideaId})
        if (idea) {
            let question:any = idea?.validateQuestion
            const count:number = question.length
            return res.status(201).json({
                success: true,
                questions: count
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "ideaId not found"
            })
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
});

const getThePoint =  asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    try {
        const idea = await ideaModel.findOne({_id: req.body.ideaId});
        if (idea) {
            return res.status(200).json({
                success: true,
                point: idea?.points || 5
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "ideaId not found"
            })
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
});

const validateIdeaView = asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    console.log('call validated functionaliy');

});

const viewsIdea = asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    try {
        const ideaDetails = await ideaModel.findOne({_id: req.body.ideaId}).populate('userId')
        //console.log('ideaDetails', ideaDetails)
        if (ideaDetails) {
            const viewUser: any = 1;
            let views: any =  ideaDetails?.views + viewUser
            let updateViews =  await ideaModel.updateOne({_id: req.body.ideaId}, { $set : {views: views}});
            //console.log('updateViews :', updateViews)
            return res.status(201).json({
                success: true,
                ideaDetail: ideaDetails,
                //message: 'idea view successfully'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "ideaId not found"
            })
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        }); 
    }
});

const validateIdeaCount = asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    try {
        const validateIdea = await validateIdeaModel.find().count()
        if (validateIdea) {
            console.log('validateIdea :', validateIdea)
            return res.status(200).json({
                success: true,
                validated: validateIdea || 0
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "idea not validated"
            })
        } 
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
});

const getViewsIdeaCount = asyncHandler(async (req: Request , res: Response, next: NextFunction) => {
    try {
        const idea = await ideaModel.findOne({_id: req.body.ideaId});
        if (idea) {
            return res.status(200).json({
                success: true,
                validated: idea?.views || 0
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "ideaId not found"
            }) 
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
});


const myIdea = async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.body
    if (userId == undefined || userId == null || userId == "") {
		return res.status(422).json({success: false, message: "userId cannot be blank" });
	}

    try {
        const idea =  await ideaModel.find({userId})
        if(idea.length>0) {
            return res.status(201).json({
                success: true,
                message: "my Idea list",
                data: idea
            })
        } 
        else {
            return res.status(404).json({
                status: 404, 
                message: "no idea found"
            });
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
}

const getLeaderBoard = async (req: Request , res: Response, next: NextFunction) => {
    try {
        const topLeader = await userSchema.find({}, {_id: 0, fullName: 1, point: 1, images: 1} ).sort({point:-1})
        if(topLeader.length>0) {
           
           let rank: any = 1
           const datas = { rank, ...topLeader }

            return res.status(200).json({
                success: true,
                leaderBoard: datas
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "data not found"
            })
        }
    } catch (error) {
        return res.status(403).json({
            status: 403, 
            message: 'malformed request'
        });
    }
};
const validatedIdeaList = async (req: Request , res: Response, next: NextFunction) => {
    const list = await validateIdeaModel.find().sort({updatedAt:-1})
    if(list.length>0) {
        return res.status(200).json({
            success: true,
            validatedIdeaList: list
        })
    } else {
        return res.status(404).json({
            success: false,
            message: "data not found"
        })
    }
}

/* notification functionaliy */
const getNotification = async (req: Request , res: Response, next: NextFunction) => {
    const notificationList = await notificationModel.find({userId: req.body.userId, status: true}, {_id: 1, fullName: 1, imageURL: 1, message: 1, createdAt: 1} ).sort({_id:-1}).limit(10);
    if(notificationList.length>0) {
        return res.status(200).json({
            success: true,
            notification: notificationList
        })
    } else {
        return res.status(404).json({
            success: false,
            message: "notification not found"
        })
    }
}

const updateNotificationStatus = async (req: Request , res: Response, next: NextFunction) => {
    const notification = await notificationModel.findOne({_id: req.body._id})
    if (notification) {
        let updateStatus =  await notificationModel.updateOne({_id: req.body._id}, { $set : {status: false}});
        return res.status(404).json({
            success: true,
            message: "status update successfully"
        })
    } else {
        return res.status(404).json({
            success: false,
            message: "data not found"
        })
    }
}




export default {
    logout,
    loginUser,
    signupUser,
    getUserList,
    updateProfile,
    forgotPassword,
    updateUserPassword,
    removeProfilePicture,
    postIdea,
    getIdeaList,
    viewsIdea,
    ideaDetailByIdeaId,
    searchAudience,
    getIdeaByUserId,
    updateIdeaStatus,
    validateIdea,
    validatedIdeaList,
    questionCount,
    getThePoint,
    validateIdeaView,
    validateIdeaCount,
    getViewsIdeaCount,
    myIdea,
    getLeaderBoard,
    getNotification,
    updateNotificationStatus
}