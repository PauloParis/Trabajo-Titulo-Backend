import { Router } from "express";
import { saveHappyUser } from "../controllers/auth.controller.js";
import { saveHappyBoard } from "../controllers/board.controller.js";
import { saveHappyCycle } from "../controllers/cycle.controller.js";
import { saveHappyIndicator } from "../controllers/indicator.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = Router();

//TABLERO
router.put('/savehappyboard/:id', saveHappyBoard); 
//CICLO
router.put('/savehappycycle/:id', saveHappyCycle); 
//INDICADOR
router.put('/savehappyindicator/:id', saveHappyIndicator); 
//USUARIO
router.put('/savehappyuser/:id', requireToken, saveHappyUser); 


export default router;