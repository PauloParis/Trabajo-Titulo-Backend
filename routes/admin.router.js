import express from "express";
import { allUsers, updateTypeUser, getMetric, getAllBoard, getUsersBoard, updateCategory } from "../controllers/admin.controller.js";
import { requireToken } from "../middlewares/requireToken.js";


const router = express.Router();

router.get('/allusers', requireToken, allUsers) 
router.put('/typeuser/:id', requireToken, updateTypeUser) 

router.get('/getMetric/:id', requireToken, getMetric) 

router.get('/allBoard', requireToken, getAllBoard)
router.get('/usersBoard/:id', requireToken, getUsersBoard)

router.put("/changeCategory/:id/:idt", requireToken, updateCategory)

export default router;