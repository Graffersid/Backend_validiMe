import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import userSchema from "../models/User";

const signupUser = async (req: Request, res: Response, next: NextFunction) =>{
    const {fullName, email, contactNumber, password, confirmPassword} = req.body

    if (fullName == undefined || fullName == null || fullName == "") {
		res.status(422).json({success: false, message: "fullName cannot be blank" });
		return;
	}
    if (email == undefined || email == null || email == "") {
		res.status(422).json({success: false, message: "email cannot be blank" });
		return;
	}
    if (contactNumber == undefined || contactNumber == null || contactNumber == "") {
		res.status(422).json({success: false, message: "contactNumber cannot be blank" });
		return;
	}
    if (password == undefined || password == null || password == "") {
		res.status(422).json({success: false, message: "password cannot be blank" });
		return;
	}
    if (confirmPassword == undefined || confirmPassword == null || confirmPassword == "") {
		res.status(422).json({success: false, message: "confirmPassword cannot be blank" });
		return;
	}

    let existingUser = await userSchema.findOne({"email": email});
    //let existingUser = await userSchema.findOne({ $and: [ {"email": email}, {"contactNumber": contactNumber} ] });
    if(existingUser) {
        return res.status(400).json({
            success: false,
            message: "user already exists"
        });
    }
    else {
        if(contactNumber.length != 10) {
            return res.status(400).json({
                status: false,
                message: 'contact number must be 10 digits.'
            });
        }
        if (email) {
            var validRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var results = validRegex.test(email)
            if (results == false) {
                return res.status(400).json({
                    success: false,
                    message: "you have entered an invalid email address!"
                });
            }
        }
        if(password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "password should be 6 to 13 character long"
            }); 
        }
        if(password.length > 13) { 
            return res.status(400).json({
                success: false,
                message: "password should be 6 to 13 character long"
            });
        }
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match!"
            });
        }
        const user = new userSchema({
            fullName,email,contactNumber, password, 
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
        .status(500).json({error}))
    }
};


const loginUser = async (req: Request, res: Response, next: NextFunction) =>{
    const {email, password} = req.body
    if (email == undefined || email == null || email == "") {
		res.status(422).json({success: false, message: "email cannot be blank" });
		return;
	}
    if (password == undefined || password == null || password == "") {
		res.status(422).json({success: false, message: "password cannot be blank" });
		return;
	}
    await userSchema.findOne({email: email}).then(user =>{
        if (!user) {
			return res.status(400).json({
                success: false,
                message: "email is not registered"
            });
		}
        if (password == user.password) {
            return res.status(200).json({
				success: true,
				message: "Login Successfully",
				//data: user 
				data: {
					//_id: user._id,
                    userId: user._id,
                    email: user.email,
					fullName: user.fullName,
					contactNumber: user.contactNumber
				}
			});
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Password not match"
            });
        }
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
    }).catch(error => res.status(500).json({error}));
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
                })).catch(error => res.status(500).json({error}))
            }
            else {
                return res.status(404).json({success: false, message: 'Not found'});
            }
        }).catch(error => res.status(500).json({error}));
    }
};









export default {signupUser, loginUser, updateProfile, updateUserPassword}