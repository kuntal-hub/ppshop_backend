import mongoose from "mongoose";
import { Entry } from "../models/entry.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomerInfo } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Report } from "../models/report.model.js";
import { Account } from "../models/account.model.js";
import { Balance } from "../models/balance.model.js";
import {BALANCE_ID} from "../constants.js";

const createEntry = asyncHandler(async (req, res) => {
    const { customer_id, amount, cId, name, aadhar, phone, address, accountId="cash", remarks="" } = req.body;

    if(!amount) throw new ApiError(400, "Please provide amount");

    let entry;

    const createEntryAndReport = async (owner,amount) => {
        
        if (accountId !== "cash") {
            const account = await Account.findById(accountId);
            
            if (!account) {
                throw new ApiError(404, "Account not found");
            }
            const accountBalance = account.balance;
            account.balance += Number.parseInt(amount);

            if (account.balance < 0) {
                throw new ApiError(400, "Insufficient balance in account");
            }
            
            await account.save();
            
            entry = await Entry.create({
                amount:Number.parseInt(amount),
                owner:owner,
                from:account.name,
                remarks:remarks,
                ob:Number.parseInt(accountBalance),
            });
        } else {
            const balance = await Balance.findById(BALANCE_ID);

            if (!balance) {
                throw new ApiError(500, "Unable to get balance");
            }
            
            entry = await Entry.create({
                amount:Number.parseInt(amount),
                owner:owner,
                remarks:remarks,
                ob:balance.total,
            });
        }

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
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    const { eId } = req.params;

    if (!eId) {
        throw new ApiError(400, "Please provide entry id");
    }

    if (!mongoose.isValidObjectId(eId)) {
        throw new ApiError(400, "Invalid object id");
    }

    const entry = await Entry.findById(eId);

    if (!entry) {
        throw new ApiError(404, "Entry not found");
    }

    if (entry.from !== "cash") {
        const account = await Account.findOne({name:entry.from});

        if (!account) {
            throw new ApiError(404, "Account not found");
        }
        account.balance -= entry.amount;
        await account.save();
        
    }

    await Entry.findByIdAndDelete(eId);

    await Report.deleteOne({entry:entry._id});

    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Entry deleted successfully"));
});

const deleteAllEntries = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    await Entry.deleteMany({});
    await Report.deleteMany({});
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "All entries deleted successfully"));
});

const getEntriesByDate = asyncHandler(async (req, res) => {
    const { date } = req.params;

    const {page=1,limit=24} = req.query;

    if (!date) {
        throw new ApiError(400, "Please provide date");
    }

    const targetDate = new Date(date); // The date you want to find documents for

    // Define the start and end of the target date
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0); // Set time to beginning of the day
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999); 

    const entries = await Entry.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $lookup:{
                from:"customerinfos",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            createdAt:0,
                            updatedAt:0,
                            __v:0,
                        }
                    }
                ]
            }
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
            $addFields:{
                owner:{$arrayElemAt:["$owner",0]},
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:parseInt((page-1)*limit)
        },
        {
            $limit:parseInt(limit)
        }
    ]);

    const summary = await Entry.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group:{
                _id:"$from",
                total:{$sum:"$amount"}
            }
        },
        {
            $lookup:{
                from:"accounts",
                localField:"_id",
                foreignField:"name",
                as:"account"
            }
        },
        {
            $addFields:{
                account:{$arrayElemAt:["$account",0]},
            }
        },
        {
            $addFields:{
                ob:{
                    $subtract:["$account.balance","$total"]
                },
                cb:"$account.balance"
            }
        },
        {
            $project:{
                account:0
            }
        }
    ]);
    
    return res
    .status(200)
    .json(new ApiResponce(200,{entries,summary}, "Entries fetched successfully"));
});

const getAllEntriesByOwnerId = asyncHandler(async (req, res) => {
    const { cId } = req.params;

    const {page=1,limit=24} = req.query;

    if (!cId) {
        throw new ApiError(400, "Please provide customer id");
    }

    const customer = await CustomerInfo.findOne({cId});

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    const entries = await Entry.aggregate([
        {
            $match: {
                owner: customer._id
            }
        },
        {
            $lookup:{
                from:"customerinfos",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            createdAt:0,
                            updatedAt:0,
                            __v:0,
                        }
                    }
                ]
            }
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
            $addFields:{
                owner:{$arrayElemAt:["$owner",0]},
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:parseInt((page-1)*limit)
        },
        {
            $limit:parseInt(limit)
        }
    ]);


    if (!entries) {
        throw new ApiError(404, "Entries not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,entries, "Entries fetched successfully"));
})

const getAllEntriesByAccountName = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    const { accountName } = req.params;

    const {page=1,limit=24,fromDate, toDate} = req.query;

    if (!fromDate || !toDate) {
        throw new ApiError(400, "Please provide from date and to date");
    }

    if (!accountName) {
        throw new ApiError(400, "Please provide account name");
    }

    if (accountName !== "cash") {
        const account = await Account.findOne({name:accountName});

        if (!account) {
            throw new ApiError(404, "Account not found");
        }
    }

    const targetFormDate = new Date(fromDate);
    const targetToDate = new Date(toDate);

    // Define the start and end of the target date
    const startDate = new Date(targetFormDate);
    startDate.setHours(0, 0, 0, 0); // Set time to beginning of the day
    const endDate = new Date(targetToDate);
    endDate.setHours(23, 59, 59, 999); 

    const entries = await Entry.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                },
                from:accountName
            }
        },
        {
            $lookup:{
                from:"customerinfos",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            createdAt:0,
                            updatedAt:0,
                            __v:0,
                        }
                    }
                ]
            }
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
            $addFields:{
                owner:{$arrayElemAt:["$owner",0]},
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:parseInt((page-1)*limit)
        },
        {
            $limit:parseInt(limit)
        }
    ]);
    
    return res
    .status(200)
    .json(new ApiResponce(200,entries, "Entries fetched successfully"));
});

export { 
    createEntry, 
    deleteEntry, 
    deleteAllEntries, 
    getEntriesByDate, 
    getAllEntriesByOwnerId,
    getAllEntriesByAccountName,
};