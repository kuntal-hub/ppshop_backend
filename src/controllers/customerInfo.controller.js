import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomerInfo } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import { Entry } from "../models/entry.model.js";
import { Report } from "../models/report.model.js";

const createCustomerInfo = asyncHandler(async (req, res) => {

    const {name, cId, aadhar, address, phone} = req.body;

    if (!name || !cId || !aadhar || !phone) {
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
        name,
        cId,
        aadhar,
        address: address || "",
        phone,
    })

    if (!customer) {
        throw new ApiError(500, "Unable to create customer");
    }

    return res
    .status(201)
    .json(new ApiResponce(201,customer, "Customer created successfully"));
});

const updateCustomerInfo = asyncHandler(async (req, res) => {
    
        const {name, newCId, aadhar, address, phone} = req.body;
        const {cId} = req.params;

        if (!cId) {
            throw new ApiError(400, "Please provide customer id");
        }
    
        if (!name || !aadhar || !phone || !newCId) {
            throw new ApiError(400, "Please provide all the required fields")
        }
    
        const customer = await CustomerInfo.findOne({cId});
    
        if (!customer) {
            throw new ApiError(404, "Customer not found");
        }

        if (newCId && newCId !== cId) {
            if (newCId.length < 4) {
                throw new ApiError(400, "Invalid customer id");
            }
            const customerExists = await CustomerInfo.findOne({cId: newCId});
            if (customerExists) {
                throw new ApiError(400, "Customer with same customer id already exists");
            }
        }

        if (aadhar && aadhar !== customer.aadhar) {
            if (aadhar.length < 12 || isNaN(aadhar)) {
                throw new ApiError(400, "Invalid aadhar number");
            }

            const customerExists = await CustomerInfo.findOne({aadhar: aadhar});

            if (customerExists && customerExists.cId !== cId) {
                throw new ApiError(400, "Customer with same aadhar number already exists");
            }
        }
    
        customer.name = name || customer.name;
        customer.cId = newCId || customer.cId;
        customer.aadhar = aadhar || customer.aadhar;
        customer.address = address !== undefined? address: customer.address;
        customer.phone = phone || customer.phone;
    
        await customer.save();
    
        return res
        .status(200)
        .json(new ApiResponce(200,customer, "Customer updated successfully"));
});

const deleteCustomerInfo = asyncHandler(async (req, res) => {
    const {cId} = req.params;

    if (!cId) {
        throw new ApiError(400, "Please provide customer id");
    }

    const customer = await CustomerInfo.findOneAndDelete({cId});

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }
    
    const entries = await Entry.find({owner:customer._id});

    const entryIds = [];

    for (let i = 0; i < entries.length; i++) {
        entryIds.push(entries[i]._id);
    }

    await Entry.deleteMany({owner:customer._id});

    await Report.deleteMany({entry:{$in:entryIds}});

    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Customer deleted successfully"))

})

const findCustomer = asyncHandler(async (req, res) => {
    const {cId} = req.params;

    if (!cId) {
        throw new ApiError(400, "Please provide customer id");
    }

    const customer = await CustomerInfo.findOne({cId});

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,customer, "Customer found successfully"))
});

const getAllCustomers = asyncHandler(async (req, res) => {
    const {page=1,limit=20} = req.query;
    const aggregate = CustomerInfo.aggregate([
        {
            $match:{}
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    const customers = await CustomerInfo.aggregatePaginate(aggregate,{
        page:parseInt(page),
        limit:parseInt(limit),
    })

    if (!customers) {
        throw new ApiError(500, "Something went wrong, please try again later");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,customers, "Customers found successfully"))
});

const searchCustomer = asyncHandler(async (req, res) => {
    const {page=1,limit=20,searchBy,search} = req.query;
    const aggregate = CustomerInfo.aggregate([
        {
            $match:{[searchBy]:{$regex:search, $options: 'i'}}
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    const customers = await CustomerInfo.aggregatePaginate(aggregate,{
        page:parseInt(page),
        limit:parseInt(limit),
    })

    if (!customers) {
        throw new ApiError(500, "Something went wrong, please try again later");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,customers, "Customers found successfully"))
});

export { 
    createCustomerInfo, 
    updateCustomerInfo, 
    deleteCustomerInfo, 
    findCustomer,
    getAllCustomers,
    searchCustomer,
};