import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomerInfo } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import { Entry } from "../models/entry.model.js";
import { Report } from "../models/report.model.js";

const createCustomerInfo = asyncHandler(async (req, res) => {

    const {name, cId, aadhar, address, phone} = req.body;

    if (!name || !cId) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const customerExists = await CustomerInfo.findOne({cId:cId});

    if (customerExists) {
        throw new ApiError(400, "Customer with same customer id or aadhar number already exists");
    }

    const customer = await CustomerInfo.create({
        name,
        cId,
        aadhar:aadhar || "",
        address: address || "",
        phone: phone || "",
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
    
        const customer = await CustomerInfo.findOne({cId});
    
        if (!customer) {
            throw new ApiError(404, "Customer not found");
        }

        if (newCId && newCId !== cId) {
            const customerExists = await CustomerInfo.findOne({cId: newCId});
            if (customerExists) {
                throw new ApiError(400, "Customer with same customer id already exists");
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
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
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
        throw new ApiError(404, "Customer not found!");
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

const getCustomerByCId = asyncHandler(async (req,res)=>{
    const {cId} = req.params;
    const {page=1,limit=20} = req.query;
    
    if(!cId){
        throw new ApiError(400,"Please provide customer id")
    }
    
    const customer = await CustomerInfo.findOne({cId});
    
    if(!customer){
        throw new ApiError(404 ,"Customer Not Found");
    }

    const aggregate = Entry.aggregate([
        {
            $match:{owner:customer._id}
        },
        {
            $lookup:{
                from:"reports",
                localField:"_id",
                foreignField:"entry",
                as:"report"
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    const entries = await Entry.aggregatePaginate(aggregate,{
        page:parseInt(page),
        limit:parseInt(limit),
    })

    const resData = {
        customer:customer,
        entries:entries,
    }
    
    return res
    .status(200)
    .json(new ApiResponce(200,resData,"Customer Found!"))
})

export { 
    createCustomerInfo, 
    updateCustomerInfo, 
    deleteCustomerInfo, 
    findCustomer,
    getAllCustomers,
    searchCustomer,
    getCustomerByCId,
};