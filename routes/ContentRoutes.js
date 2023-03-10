import { Router } from "express";
import { getHelp, postHelp } from "../controllers/ContentController.js";
import { auth } from "../middleware/RouterSecurity.js";

const router = new Router();

router.post("/posthelp", auth, postHelp);
router.post("/gethelp", auth, getHelp);

export default router;
