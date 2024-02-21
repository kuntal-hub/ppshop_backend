import { Router } from "express";
import {
    createEntry,
    deleteEntry,
} from "../controllers/entry.controller.js";

const router = Router();

router.route("/create").post(createEntry);
router.route("/delete/:eId").delete(deleteEntry);

export default router;