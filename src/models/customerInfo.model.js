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
        minLength:4,
        unique:true,
        required:[true,"customer Id is required"],
        trim:true,
        index:true
    },
    aadhar:{
        type:String,
        unique:true,
        minLength:12,
        required:[true,"Aadhar number is required"],
        trim:true,
        index:true
    },
    address:{
        type:String,
        trim:true
    },
    phone:{
        type:String,
        minLength:10,
        required:[true,"Phone number is required"],
        trim:true
    },
},{timestamps: true});

customerInfoSchema.plugin(mongooseAggregatePaginate);

export const CustomerInfo = mongoose.model('CustomerInfo',customerInfoSchema);