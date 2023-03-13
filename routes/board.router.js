import express from "express";
import { createBoard, deleteBoard, disassociateBoard, getguestBoards, getMyBoards, updateBoard, invitationUser, /* getIndicadorDissociated */ getInfoUserSocket, updateNotify } from "../controllers/board.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post("/createboard", requireToken, createBoard);
router.put("/updateboard/:id", requireToken, updateBoard); 
router.delete("/deleteboard/:id", requireToken, deleteBoard); 
router.delete("/disconnectboard/:idt/:idu", requireToken, disassociateBoard);
/* router.get("/getindicatorsdesconnect/:id", requireToken, getIndicadorDissociated); */

router.get("/myboards", requireToken ,getMyBoards);
router.get("/guestboards", requireToken, getguestBoards);

router.post("/invitationboard/:id", invitationUser)

router.get("/getInfoUserSocket/:id", requireToken, getInfoUserSocket);
router.put("/updateNotify/:id", requireToken, updateNotify);


export default router;