import { Router } from "express";
import {
    //createBalance,
    updateBalance,
    getBalance,
} from "../controllers/balance.controller.js";

const router = Router();

//router.route("/create").post(createBalance);
router.route("/update").patch(updateBalance);
router.route("/").get(getBalance);

export default router;