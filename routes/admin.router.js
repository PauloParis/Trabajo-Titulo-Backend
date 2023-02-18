import express from "express";
import { allUsers, updateTypeUser, getMetric, getAllBoard } from "../controllers/admin.controller.js";
import { requireToken } from "../middlewares/requireToken.js";


const router = express.Router();

router.get('/allusers', requireToken, allUsers) 
router.put('/typeuser/:id', requireToken, updateTypeUser) 

router.get('/getMetric/:id', requireToken, getMetric) 

router.get("/allBoard", requireToken, getAllBoard)


export default router;