import { Router } from "express";
import {
    createReport,
    updateReport,
    deleteReport,
    getAllReports,
} from "../controllers/report.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create").post(createReport);
router.route("/update/:rId").patch(updateReport);
router.route("/delete/:rId").delete(deleteReport);
router.route("/all").get(getAllReports);

export default router;