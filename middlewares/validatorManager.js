import { validationResult, body } from "express-validator"

export const validationResultExpress = (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error: error.array()});
    }
    next();
}


export const bodyLoginValidator = [
    body('email', "formato del email inconrrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "Mínimo 6 carácteres").trim().isLength({ min: 6 }), 
    validationResultExpress,
];


export const bodyRegisterValidator = [
    body('email', "formato del email inconrrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password', "formato de password es incorrecto")
        .trim()
        .isLength({min: 6})
        .custom((value, {req}) =>{ //el value, es el password
            if (value !== req.body.repassword){
                throw new Error('No coiciden las contraseñas')
            }
            return value;
        }),
    validationResultExpress,
]

export const bodyEditValidator = [
    body('password_nueva', "formato de password es incorrecto")
        .trim()
        .isLength({min: 6})
        .custom((value, {req}) =>{ //el value, es el password
            if (value !== req.body.repassword){
                throw new Error('No coiciden las contraseñas')
            }
            return value;
        }),
    validationResultExpress,
]