import { Router } from "express";
import { createIndicator, deleteIndicator, getIndicator, deleteEvaluation, updateIndicator, updateEvaluation } from "../controllers/indicator.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = Router(); 


//CRUD INDICADORES
router.post("/createindicador/:id", requireToken, createIndicator);
router.get("/indicators/:id", requireToken, getIndicator);
router.delete("/deleteindicator/:id", requireToken, deleteIndicator); 
router.put("/updateindicator/:id", requireToken, updateIndicator)


//CRUD EVALUACIÓN
router.put("/evaluation/:id/:idt/:idc/:idi", requireToken, updateEvaluation);
//router.post("/evaluation/:id", requireToken, createEvaluation);
router.delete("/deleteevaluation/:id/:idt/:idc/:idi", requireToken, deleteEvaluation); 


export default router;