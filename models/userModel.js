// user model
// FIRST TIME WHEN WE USE MYSQL AND NODEJS WE NEED TO RUN THIS CODE AT WORKBENCH:
// // ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678'
const Joi = require("joi")
const jwt = require("jsonwebtoken")
const {config} = require("../secret/config")

exports.validateUser = (_reqBody) => {
    const joiSchema = Joi.object({
        name: Joi.string().min(2).max(150).required(),
        email: Joi.string().min(2).max(200).email().required(),
        password: Joi.string().min(3).max(150).required()
    })
    return joiSchema.validate(_reqBody);
}

exports.createToken = (_id, _role) => {
    return jwt.sign({user_id:_id, role: _role },config.secret, { expiresIn: "60000mins" });
}

exports.validateLogin = (_reqBody) => {
    const joiSchema = Joi.object({
        email: Joi.string().min(2).max(200).email().required(),
        password: Joi.string().min(3).max(150).required()
    })

    return joiSchema.validate(_reqBody);
}

exports.validateEmailSent = (_reqBody) => {
    const joiSchema = Joi.object({
        email: Joi.string().min(2).max(200).email().required(),
        subject: Joi.string().min(3).max(150).required(),
        text: Joi.string().min(3).max(500).required(),
    })

    return joiSchema.validate(_reqBody);
}
