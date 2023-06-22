const Joi = require("joi")

exports.validateEvent = (_reqBody) => {
    const joiSchema = Joi.object({
        title: Joi.string().min(2).max(45).required(),
        city: Joi.string().min(2).max(45).required(),
        adress: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(2).max(350).required(),
        max_paticipants: Joi.number().min(1).max(50).required(),
        event_date :Joi.date().required()
    })

    return joiSchema.validate(_reqBody);
}