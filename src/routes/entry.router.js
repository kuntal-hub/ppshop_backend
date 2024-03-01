import { Router } from "express";
import {
    createEntry,
    deleteEntry,
    deleteAllEntries,
    getEntriesByDate,
    getAllEntriesByOwnerId,
    getAllEntriesByAccountName,
} from "../controllers/entry.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create").post(createEntry);
router.route("/delete/:eId").delete(deleteEntry);
router.route("/alldelete").delete(deleteAllEntries);
router.route("/date/:date").get(getEntriesByDate);
router.route("/owner/:cId").get(getAllEntriesByOwnerId);
router.route("/account/:accountName").get(getAllEntriesByAccountName);

export default router;