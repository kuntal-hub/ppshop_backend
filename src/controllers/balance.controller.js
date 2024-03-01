import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Balance } from "../models/balance.model.js";
import {BALANCE_ID} from "../constants.js";

// const createBalance = asyncHandler(async (req, res) => {
//     const balance = await Balance.create({fiveh:0});

//     if (!balance) {
//         throw new ApiError(500, "Unable to create balance");
//     }

//     return res
//     .status(201)
//     .json(new ApiResponce(201,balance, "Balance created successfully"));
// });

const updateBalance = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }

    const {
        fiveh = 0, 
        twoh = 0, 
        oneh = 0, 
        fifty = 0, 
        twenty = 0, 
        ten = 0, 
        others = 0, 
    } = req.body;

    const balance = await Balance.findById(BALANCE_ID);
    
    if (!balance) {
        throw new ApiError(500, "Unable to get balance");
    }

    balance.fiveh = Number.parseInt(fiveh);
    balance.twoh = Number.parseInt(twoh);
    balance.oneh = Number.parseInt(oneh);
    balance.fifty = Number.parseInt(fifty);
    balance.twenty = Number.parseInt(twenty);
    balance.ten = Number.parseInt(ten);
    balance.others = Number.parseInt(others);

    const savedbalance = await balance.save();

    return res
    .status(200)
    .json(new ApiResponce(200,savedbalance, "Balance updated successfully"));

});

const getBalance = asyncHandler(async (req, res) => {

    const balance = await Balance.findById(BALANCE_ID);

    if (!balance) {
        throw new ApiError(500, "Unable to get balance");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,balance, "Balance fetched successfully"));
});

export { 
    // createBalance,
    updateBalance, 
    getBalance 
};