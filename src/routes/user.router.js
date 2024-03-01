import { Router } from "express";
import {
    createAdmin,
    createUser,
    login,
    logoutUser,
    getCurrentUser,
    requestForgotPasswordEmail,
    resetPassword,
    chengePassword,
    changeEmail,
    changeUsername,
    deleteUser,
    getAllUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createAdmin").post(createAdmin);
router.route("/createUser").post(verifyJWT,createUser);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/me").get(verifyJWT,getCurrentUser);
router.route("/forgotPassword").post(requestForgotPasswordEmail);
router.route("/resetPassword").post(resetPassword);
router.route("/changePassword").post(verifyJWT,chengePassword);
router.route("/changeEmail").post(verifyJWT,changeEmail);
router.route("/changeUsername").post(verifyJWT,changeUsername);
router.route("/deleteUser/:username").delete(verifyJWT,deleteUser);
router.route("/getAll").get(verifyJWT,getAllUsers);

export default router;