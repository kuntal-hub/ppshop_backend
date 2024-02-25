import { Router } from "express";
import {
    createAccount,
    updateAccount,
    getAccounts,
    deleteAccount,
} from "../controllers/account.controller.js";


const router = Router();

router.route("/create").post(createAccount);
router.route("/update/:accountId").patch(updateAccount);
router.route("/").get(getAccounts);
router.route("/delete/:accountId").delete(deleteAccount);

export default router;