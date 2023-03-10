import { Router } from "express";
import {
  getHelp,
  postHelp,
  uploadXML,
} from "../controllers/ContentController.js";
import { auth } from "../middleware/RouterSecurity.js";

const router = new Router();

router.post("/posthelp", auth, postHelp);
router.post("/gethelp", auth, getHelp);
router.post("/upload", uploadXML);

export default router;
