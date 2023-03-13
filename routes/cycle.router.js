import { Router } from "express";
import { createCycle, deleteCycle, getCycles, updateCycle } from "../controllers/cycle.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = Router();

router.post("/createcycle/:id", requireToken, createCycle); 
router.get("/cycles/:id", requireToken, getCycles); 
router.delete("/deletecycle/:id/:idt", requireToken, deleteCycle)
router.put("/updatecycle/:id", requireToken, updateCycle);

export default router;
