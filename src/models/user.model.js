import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        index:true,
        minLength:4,
        loawercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true,
        trim:true
    },
    password:{
        type:String,
        minLength:8,
        required:[true,"Password is required"],
        trim:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if (!this.isModified("password")) {
        return next(); 
    }

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordMatch = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);