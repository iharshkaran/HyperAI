import { validationResult } from 'express-validator';


export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorArray = errors.array();

        return res.status(400).json({
            success: false,
            message: errorArray[0].msg,
            // Return all validation errors in an array
            errors: errorArray.map((err) => ({
                field: err.path || err.param,
                message: err.msg,
            })),
        });
    }

    next();
};

export default validate;