import { Router } from "express";
import {
    createEntry,
    deleteEntry,
    deleteAllEntries,
    getEntriesByDate,
    getAllEntriesByOwnerId
} from "../controllers/entry.controller.js";

const router = Router();

router.route("/create").post(createEntry);
router.route("/delete/:eId").delete(deleteEntry);
router.route("/alldelete").delete(deleteAllEntries);
router.route("/date/:date").get(getEntriesByDate);
router.route("/owner/:cId").get(getAllEntriesByOwnerId);

export default router;