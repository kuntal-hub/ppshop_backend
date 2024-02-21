import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Report } from "../models/report.model.js";
import { Entry } from "../models/entry.model.js";

const createReport = asyncHandler(async (req, res) => {
    const {
        total, 
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

    if (!total || total < 0) {
        throw new ApiError(400, "Please provide valid total amount");
    }

    const grandTotal = (fiveh*500) + (twoh*200) + (oneh*100) + (fifty*50) + (twenty*20) + (ten*10) + others;

    if (grandTotal !== total) {
        throw new ApiError(400, "Total amount and sum of all other amounts do not match");
    }

    const report = await Report.create({
        entry:new mongoose.Types.ObjectId(eId),
        total:grandTotal,
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

    return res
    .status(201)
    .json(new ApiResponce(201,report, "Report created successfully"));

});

const updateReport = asyncHandler(async (req, res) => {
    const { rId } = req.params;
    const {
        total, 
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

    if (!total || total < 0) {
        throw new ApiError(400, "Please provide valid total amount");
    }

    const grandTotal = (fiveh*500) + (twoh*200) + (oneh*100) + (fifty*50) + (twenty*20) + (ten*10) + others;

    if (grandTotal !== total) {
        throw new ApiError(400, "Total amount and sum of all other amounts do not match");
    }

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

    const savedReport = await Report.findByIdAndUpdate(rId, {
        total:grandTotal,
        fiveh,
        twoh,
        oneh,
        fifty,
        twenty,
        ten,
        others,
    }, {new:true});

    if (!savedReport) {
        throw new ApiError(500, "Unable to update report");
    }

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
