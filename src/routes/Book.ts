import express  from "express";
import controller from '../controllers/Book'
import { Schema, ValidateSchema } from "../library/ValidateSchema";
import isAuthenticated from "../server";

const router = express.Router();

router.post('/create', ValidateSchema(Schema.author.create), controller.createBook);
router.get('/get/:bookId', controller.readBook);
router.get('/get', controller.readAll);
router.patch('/update/:bookId', ValidateSchema(Schema.author.update), controller.updateBook);
router.delete('/delete/:bookId', controller.deleteBook);

export = router;
