import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Balance } from "../models/balance.model.js";
import mongoose from "mongoose";

const createBalance = asyncHandler(async (req, res) => {
    const balance = await Balance.create({total:0});

    if (!balance) {
        throw new ApiError(500, "Unable to create balance");
    }

    return res
    .status(201)
    .json(new ApiResponce(201,balance, "Balance created successfully"));
});

const updateBalance = asyncHandler(async (req, res) => {
    const balanceId = "65d5aab73a515bf6e0fcce30";

    const {
        fiveh = 0, 
        twoh = 0, 
        oneh = 0, 
        fifty = 0, 
        twenty = 0, 
        ten = 0, 
        others = 0, 
    } = req.body;

    const total = (fiveh*500) + (twoh*200) + (oneh*100) + (fifty*50) + (twenty*20) + (ten*10) + others;

    const balance = await Balance.findByIdAndUpdate(balanceId, {
        total,
        fiveh,
        twoh,
        oneh,
        fifty,
        twenty,
        ten,
        others,
    }, {new:true});

    if (!balance) {
        throw new ApiError(500, "Something Went Wrong, Unable to update balance");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,balance, "Balance updated successfully"));

});

const getBalance = asyncHandler(async (req, res) => {
    const balanceId = "65d5aab73a515bf6e0fcce30";

    const balance = await Balance.findById(balanceId);

    if (!balance) {
        throw new ApiError(500, "Unable to get balance");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,balance, "Balance fetched successfully"));
});

export { createBalance, updateBalance, getBalance };