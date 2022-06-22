import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import authorSchema from "../models/Author";
import userSchema from "../models/User";

const updateProfile = (req: Request, res: Response, next: NextFunction) => {
    const {username, email, password} = req.body

}




const registerUser = (req: Request, res: Response, next: NextFunction) =>{
    const {username, email, password} = req.body

    const user = new userSchema({
        username,email, password
    });
    return user
    .save()
    .then(user =>  res.status(201).json({user})).catch(error => res
    .status(500).json({error}))
};

const createAuthor = (req: Request, res: Response, next: NextFunction) =>{
    const {name} = req.body

    const author = new authorSchema({
        _id: new mongoose.Types.ObjectId(),
        name
    });
    return author
    .save()
    .then(author =>  res.status(201).json({author})).catch(error => res
    .status(500).json({error}))
};

const readAuthor = (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.params.authorId

    return authorSchema.findById(authorId).then(author => author ? res.status(200).json({author}) : res.status(404).json({message: 'Not found'}))
    .catch(error => res.status(500).json({error}));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {

    return authorSchema.find()
    .then((authors) => res.status(200).json({authors}))
    .catch((error) => res.status(500).json({error}));
}

const updateAllAuthor = (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.params.authorId

    return authorSchema.findById(authorId).then((author) =>{
        if(author) {
            author.set(req.body)
            return author.save()
            .then(author =>  res.status(201).json({author}))
            .catch(error => res.status(500).json({error}))
        }
        else {
            return res.status(404).json({message: 'Not found'});
        }
    })
    .catch(error => res.status(500).json({error})); 
}

const deleteAllAuthor = (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.params.authorId

    return authorSchema.findByIdAndDelete(authorId).then((author) => (author ? res.status(201).json({author}).json({message: 'deleted'}) : res.status(404).json({message: 'Not Found'})))
    .catch(error => res.status(500).json({error}));
}

export default {updateProfile, registerUser, createAuthor, readAuthor, readAll, updateAllAuthor, deleteAllAuthor}