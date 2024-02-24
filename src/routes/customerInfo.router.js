import { Router } from "express";
import {
    createCustomerInfo,
    updateCustomerInfo,
    deleteCustomerInfo,
    findCustomer,
    getAllCustomers,
    searchCustomer,
    getCustomerByCId,
} from "../controllers/customerInfo.controller.js";

const router = Router();

router.route("/create").post(createCustomerInfo);
router.route("/update/:cId").patch(updateCustomerInfo);
router.route("/delete/:cId").delete(deleteCustomerInfo);
router.route("/find/:cId").get(findCustomer);
router.route("/all").get(getAllCustomers);
router.route("/search").get(searchCustomer);
router.route("/get/:cId").get(getCustomerByCId);


export default router;