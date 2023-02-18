import { Router } from "express";
import { createEvaluation, createIndicator, deleteIndicator, getIndicator, deleteEvaluation } from "../controllers/indicator.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = Router(); 


//CRUD INDICADORES
router.post("/createindicador/:id", requireToken, createIndicator);
router.get("/indicators/:id", requireToken, getIndicator);
router.delete("/deleteindicator/:id", requireToken, deleteIndicator); 


//CRUD EVALUACIÓN
router.post("/evaluation/:id", requireToken, createEvaluation);
router.delete("/deleteevaluation/:id", requireToken, deleteEvaluation); 


export default router;