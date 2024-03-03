import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Account } from "../models/account.model.js";

const createAccount = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }

    const {name,balance=0} = req.body;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    if (name.toLowerCase().trim() === "cash") {
        throw new ApiError(400, "Account Name cannot be cash");
    }
    
    const accountExist = await Account.findOne({name});
    
    if(accountExist){
        throw new ApiError(400, "Account already exist");
    }

    const account = await Account.create({name,balance:Number.parseInt(balance)});

    if(!account){
        throw new ApiError(500, "Account not created");
    }

    return res
    .status(201)
    .json(new ApiResponce(201,account, "Account created successfully"));
})

const getAccounts = asyncHandler(async (req, res) => {
    const targetDate = new Date(); // The date you want to find documents for

    // Define the start and end of the target date
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0); // Set time to beginning of the day
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999); 

    const accounts = await Account.aggregate([
        {
            $sort:{
                createdAt:1
            }
        },
        {
            $lookup:{
                from:"entries",
                localField:"name",
                foreignField:"from",
                as:"entries",
                pipeline:[
                    {
                        $match:{
                            createdAt:{
                                $gte:startDate,
                                $lte:endDate
                            }
                        }
                    },
                    {
                        $sort:{
                            createdAt:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                totalTurnover:{
                    $sum:"$entries.amount"
                },
                firstEntry:{
                    $arrayElemAt:["$entries",0]
                },
            }
        },        
        {
            $project:{
                name:1,
                balance:1,
                totalTurnover:1,
                firstEntry:1
            }
        }
    ]);

    if(!accounts){
        throw new ApiError(404, "No accounts found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,accounts, "Accounts found"));
});

const updateAccount = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    const {balance} = req.body;

    const {accountId} = req.params;

    if(!accountId){
        throw new ApiError(400, "Account ID is required");
    }

    if(balance === undefined || balance === null || balance === "" || isNaN(balance)){
        throw new ApiError(400, "Balance is required and must be a number");
    }

    const account = await Account.findByIdAndUpdate(accountId,{balance:Number.parseInt(balance)},{new:true});

    if(!account){
        throw new ApiError(404, "Account not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,account, "Account updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    const {accountId} = req.params;

    if(!accountId){
        throw new ApiError(400, "Account ID is required");
    }

    const account = await Account.findByIdAndDelete(accountId);

    if(!account){
        throw new ApiError(404, "Account not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,account, "Account deleted successfully"));
});

export {
    createAccount, 
    getAccounts, 
    updateAccount, 
    deleteAccount
};
