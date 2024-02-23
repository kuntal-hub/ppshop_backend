import {ApiResponce} from "../utils/ApiResponce.js"

const errorHandler = (err, req, res, next) => {
    res.status(200)
    .json(new ApiResponce(err.statusCode || 500,null, err.message));
};

export default errorHandler;