import { Router } from "express";
import {
    createAccount,
    updateAccount,
    getAccounts,
    deleteAccount,
} from "../controllers/account.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create").post(createAccount);
router.route("/update/:accountId").patch(updateAccount);
router.route("/").get(getAccounts);
router.route("/delete/:accountId").delete(deleteAccount);

export default router;