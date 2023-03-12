import express from "express";
import { register, login, infoUser, SaveUpdateUser, deleteUser, refreshToken, logout, updatePassword} from "../controllers/auth.controller.js";
import { bodyEditValidator, bodyLoginValidator, bodyRegisterValidator } from "../middlewares/validatorManager.js";
import { requireToken } from "../middlewares/requireToken.js";
import { requireRefreshToken } from "../middlewares/requireRefreshToken.js";

const router = express.Router();

router.post('/login', bodyLoginValidator, login) 
router.post('/register', bodyRegisterValidator, register)   

router.get('/protected', requireToken, infoUser)
router.put('/saveupdateuser', requireToken, SaveUpdateUser) 
router.put('/updatepassword', requireToken, bodyEditValidator, updatePassword)
router.delete('/deleteaccount', requireToken, deleteUser)

router.get('/refresh', requireRefreshToken, refreshToken); 
router.get('/logout', logout); 

export default router;