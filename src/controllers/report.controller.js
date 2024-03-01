import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Report } from "../models/report.model.js";
import { Entry } from "../models/entry.model.js";
import { Balance } from "../models/balance.model.js";
import {BALANCE_ID} from "../constants.js"

const createReport = asyncHandler(async (req, res) => {
    const {
        eId,
        fiveh = 0, 
        twoh = 0, 
        oneh = 0, 
        fifty = 0, 
        twenty = 0, 
        ten = 0, 
        others = 0,
    } = req.body;

    const entry = await Entry.findById(eId);

    if (!entry) {
        throw new ApiError(404, "Entry not found");
    }

    const report = await Report.create({
        entry: entry._id,
        fiveh,
        twoh,
        oneh,
        fifty,
        twenty,
        ten,
        others,
    });

    if (!report) {
        throw new ApiError(500, "Unable to create report");
    }

    const balance = await Balance.findById(BALANCE_ID);

    if (!balance) {
        throw new ApiError(500, "Unable to get balance");
    }

    balance.fiveh += fiveh;
    balance.twoh += twoh;
    balance.oneh += oneh;
    balance.fifty += fifty;
    balance.twenty += twenty;
    balance.ten += ten;
    balance.others += others;

    await balance.save();

    return res
    .status(201)
    .json(new ApiResponce(201,{report,balance}, "Report created successfully"));

});

const updateReport = asyncHandler(async (req, res) => {
    const { rId } = req.params;
    const { 
        fiveh = 0, 
        twoh = 0, 
        oneh = 0, 
        fifty = 0, 
        twenty = 0, 
        ten = 0, 
        others = 0,
    } = req.body;

    if (!rId || !mongoose.isValidObjectId(rId)) {
        throw new ApiError(400, "please provide valid report id");
    }

    // const grandTotal = (fiveh*500) + (twoh*200) + (oneh*100) + (fifty*50) + (twenty*20) + (ten*10) + others;

    const report = await Report.findById(rId);

    if (!report) {
        throw new ApiError(404, "Report not found");
    }

    // if (report.total !== grandTotal) {
    //     const entry = await Entry.findOneAndUpdate({_id:report.entry}, {amount:grandTotal}, {new:true});

    //     if (!entry) {
    //         throw new ApiError(500, "Unable to update amount");
    //     }
    // }

    const balance = await Balance.findById(BALANCE_ID);

    if (!balance) {
        throw new ApiError(500, "Unable to get balance");
    }

    balance.fiveh += fiveh - report.fiveh;
    balance.twoh += twoh - report.twoh;
    balance.oneh += oneh - report.oneh;
    balance.fifty += fifty - report.fifty;
    balance.twenty += twenty - report.twenty;
    balance.ten += ten - report.ten;
    balance.others += others - report.others;

    const savedBalance = await balance.save();

    if (!savedBalance) {
        throw new ApiError(500, "Unable to update balance");
    }

    report.fiveh = fiveh;
    report.twoh = twoh;
    report.oneh = oneh;
    report.fifty = fifty;
    report.twenty = twenty;
    report.ten = ten;
    report.others = others;

    const savedReport = await report.save();

    if (!savedReport) {
        throw new ApiError(500, "Unable to update report");
    }


    return res
    .status(200)
    .json(new ApiResponce(200,{balance:savedBalance,report:savedReport}, "Report updated successfully"));
});


const deleteReport = asyncHandler(async (req, res) => {
    // check user is admin or not
    if (req.user?.role !== "admin") {
        throw new ApiError(403,"You are not authorized to perform this action");
    }
    const { rId } = req.params;

    if (!rId || !mongoose.isValidObjectId(rId)) {
        throw new ApiError(400, "please provide valid report id");
    }

    const report = await Report.findByIdAndDelete(rId);

    if (!report) {
        throw new ApiError(404, "Report not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Report deleted successfully"));
});

const getAllReports = asyncHandler(async (req, res) => {

    const { page=1, limit=20 } = req.query;
    
    const aggregate = Entry.aggregate([
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
        }
    ])

    const reports = await Entry.aggregatePaginate(aggregate,{
        page:Number.parseInt(page),
        limit:Number.parseInt(limit),
    });

    if (!reports) {
        throw new ApiError(404, "Reports not found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,reports, "Reports found"));
});

export { createReport, updateReport, deleteReport, getAllReports};
