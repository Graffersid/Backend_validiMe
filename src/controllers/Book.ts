import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bookSchema from "../models/Book";

const createBook = (req: Request, res: Response, next: NextFunction) => {
    const {title, author} = req.body

    const book = new bookSchema({
        _id: new mongoose.Types.ObjectId(),
        title,
        author 
    });
    return book
    .save()
    .then(book =>  res.status(201).json({book}))
    .catch(error => res.status(500).json({error}));
};

const readBook = (req: Request, res: Response, next: NextFunction) => {
    return bookSchema.findById(req.params.bookId)
    .populate('author')
    .select('-_v')
    .then(book => book ? res.status(200).json({book}) : res.status(404).json({message: 'Not found'}))
    .catch(error => res.status(500).json({error}));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return bookSchema.find()
    .populate('author')
    .then((books) => res.status(200).json({books}))
    .catch((error) => res.status(500).json({error}));
}

const updateBook = (req: Request, res: Response, next: NextFunction) => {
    return bookSchema.findById(req.params.bookId).then((book) =>{
        if(book) {
            book.set(req.body)
            return book.save()
            .then(book =>  res.status(201).json({book}))
            .catch(error => res.status(500).json({error}))
        }
        else {
            return res.status(404).json({message: 'Not found'});
        }
    })
    .catch(error => res.status(500).json({error})); 
}

const deleteBook = (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId

    return bookSchema.findByIdAndDelete(bookId).then((book) => (book ? res.status(201).json({book}).json({message: 'deleted'}) : res.status(404).json({message: 'Not Found'})))
    .catch(error => res.status(500).json({error}));
}

export default {createBook, readBook, readAll, updateBook, deleteBook}