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

    if (!eId || !mongoose.isValidObjectId(eId)) {
        throw new ApiError(400, "please provide valid entry id");
    }

    const report = await Report.create({
        entry: new mongoose.Types.ObjectId(eId),
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
    .json(new ApiResponce(201,report, "Report created successfully"));

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

    const grandTotal = (fiveh*500) + (twoh*200) + (oneh*100) + (fifty*50) + (twenty*20) + (ten*10) + others;

    const report = await Report.findById(rId);

    if (!report) {
        throw new ApiError(404, "Report not found");
    }

    if (report.total !== grandTotal) {
        const entry = await Entry.findOneAndUpdate({_id:report.entry}, {amount:grandTotal}, {new:true});

        if (!entry) {
            throw new ApiError(500, "Unable to update amount");
        }
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

    await balance.save();

    return res
    .status(200)
    .json(new ApiResponce(200,savedReport, "Report updated successfully"));
});


const deleteReport = asyncHandler(async (req, res) => {
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

export { createReport, updateReport, deleteReport };
