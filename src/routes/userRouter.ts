import express  from "express";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import userModel from "../models/User";
import userController from '../controllers/userController';
const {protect} = require('../middleware/authMiddleware');
//import {protect} from '../middleware/authMiddleware';

const router = express.Router();

/* SET STORAGE MULTER */
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads')
	},
	filename: function (req, file, cb) {
		var fileExtension = file.originalname.split('.');
		cb(null, `${file.fieldname}-${Date.now()}.${fileExtension[fileExtension.length - 1]}`);
	}
})
const upload = multer({ storage: storage })

const imgURL = 'http://192.168.1.79/uploads/'

/* user routes */
router.post('/signup',  userController.signupUser);
router.post('/login', userController.loginUser);
router.put('/updateProfile', userController.updateProfile);
router.post('/forgotPassword', protect, userController.forgotPassword);
router.put('/updatePassword', protect, userController.updateUserPassword);
router.get('/userList', protect, userController.getUserList);
router.post('/logout', protect, userController.logout);

/* idea routes */
router.post('/postIdea', protect, userController.postIdea);
router.post('/updateStatus', protect, userController.updateIdeaStatus);
router.post('/getIdeaByUser', protect, userController.getIdeaByUserId);
router.post('/searchTargetAudience', protect, userController.searchWithTargetAudience);


router.post('/uploadProfilePicture', upload.single('image'),  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.userId == undefined || req.body.userId == null || req.body.userId == "") {
		res.status(422).json({success: false, error_msg: "userId cannot be blank" });
		return;
	}
    let userDetails = await userModel.findOne({"_id": req.body.userId});
    if(userDetails){
        if(req.file) {
            const images = req.file;
            const profileImg = await userModel.updateOne({_id: userDetails._id },
            {
                $set: {
                    images: imgURL+images.filename,
                }
            });
			return res.status(200).json({success: true,	message: "Profile uploaded Successfully"})
        }
        else {
			return res.status(400).json({success: false, message: "profile image is require"});	
		}
    }
    else {
        return res.status(400).json({success: false, message: "User not found"});
    }
})





export = router;