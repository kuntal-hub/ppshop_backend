import { Router } from "express";
import {
    createCustomerInfo,
    updateCustomerInfo,
    deleteCustomerInfo,
    findCustomer,
} from "../controllers/customerInfo.controller.js";

const router = Router();

router.route("/create").post(createCustomerInfo);
router.route("/update/:cId").patch(updateCustomerInfo);
router.route("/delete/:cId").delete(deleteCustomerInfo);
router.route("/find/:cId").get(findCustomer);


export default router;