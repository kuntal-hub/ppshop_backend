import mongoose from "mongoose";
import { Entry } from "../models/entry.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomerInfo } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Report } from "../models/report.model.js";

const createEntry = asyncHandler(async (req, res) => {
    const { customer_id, amount, cId, name, aadhar, phone, address } = req.body;

    if(!amount) throw new ApiError(400, "Please provide amount");

    let entry;

    const createEntryAndReport = async (owner,amount) => {
        entry = await Entry.create({
            amount:Number.parseInt(amount),
            owner:owner,
        });

        if (!entry) {
            throw new ApiError(500, "Unable to create entry");
        }
    };

    if (!customer_id ) {

        if (!cId  || !name || !aadhar || !phone) {
            throw new ApiError(400, "Please provide all the required fields");
        }

        if (cId.length < 4) {
            throw new ApiError(400, "id should be atleast 4 characters long");
        }
    
        if (aadhar.length < 12 || isNaN(aadhar)) {
            throw new ApiError(400, "Invalid aadhar number");
        }

        if (phone.length < 10 ) {
            throw new ApiError(400, "Invalid phone number");
        }
    
        const customerExists = await CustomerInfo.findOne({$or: [{cId}, {aadhar}]});
    
        if (customerExists) {
            throw new ApiError(400, "Customer with same customer id or aadhar number already exists");
        }
    
        const customer = await CustomerInfo.create({
            name:name,
            cId:cId,
            aadhar:aadhar,
            address: address || "",
            phone:phone,
        })
    
        if (!customer) {
            throw new ApiError(500, "Unable to create customer");
        }

        await createEntryAndReport(customer._id,amount);

    } else if(customer_id) {
        if (!mongoose.isValidObjectId(customer_id)) {
            throw new ApiError(400, "Invalid object id");
        }

        const customer = await CustomerInfo.findById(customer_id);

        if (!customer) {
            throw new ApiError(404, "Customer not found");
        }

        await createEntryAndReport(customer._id,amount);
    }

    return res
    .status(201)
    .json(new ApiResponce(201,entry, "Entry created successfully"));
});


const deleteEntry = asyncHandler(async (req, res) => {
    const { eId } = req.params;

    if (!eId) {
        throw new ApiError(400, "Please provide entry id");
    }

    if (!mongoose.isValidObjectId(eId)) {
        throw new ApiError(400, "Invalid object id");
    }

    const entry = await Entry.findByIdAndDelete(eId);

    if (!entry) {
        throw new ApiError(404, "Entry not found");
    }

    await Report.deleteOne({entry:entry._id});

    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Entry deleted successfully"));
});

export { createEntry, deleteEntry };