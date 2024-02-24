import { Router } from "express";
import {
    createReport,
    updateReport,
    deleteReport,
    getAllReports,
} from "../controllers/report.controller.js";

const router = Router();

router.route("/create").post(createReport);
router.route("/update/:rId").patch(updateReport);
router.route("/delete/:rId").delete(deleteReport);
router.route("/all").get(getAllReports);

export default router;