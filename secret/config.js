require("dotenv").config();

exports.config = {
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,   
    secret:process.env.SECRET,
    sg_api_key:process.env.SENDGRID_API_KEY,
    sg_sender:process.env.SENDGREID_SENDER,
    novu_api_key:process.env.NOVU_API_KEY
}