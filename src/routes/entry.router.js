import { Router } from "express";
import {
    createEntry,
    deleteEntry,
    deleteAllEntries,
} from "../controllers/entry.controller.js";

const router = Router();

router.route("/create").post(createEntry);
router.route("/delete/:eId").delete(deleteEntry);
router.route("/alldelete").delete(deleteAllEntries);

export default router;