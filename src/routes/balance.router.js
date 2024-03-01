import { Router } from "express";
import {
    //createBalance,
    updateBalance,
    getBalance,
} from "../controllers/balance.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

//router.route("/create").post(createBalance);
router.route("/update").patch(updateBalance);
router.route("/").get(getBalance);

export default router;