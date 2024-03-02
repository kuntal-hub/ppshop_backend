import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const customerInfoSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:"text",
        trim:true,
    },
    cId:{ // customer id
        type:String,
        unique:true,
        required:[true,"customer Id is required"],
        trim:true,
        index:true
    },
    aadhar:{
        type:String,
        trim:true,
        index:true
    },
    address:{
        type:String,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
},{timestamps: true});

customerInfoSchema.plugin(mongooseAggregatePaginate);

export const CustomerInfo = mongoose.model('CustomerInfo',customerInfoSchema);