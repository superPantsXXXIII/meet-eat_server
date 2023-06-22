require("dotenv").config();

exports.config = {
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,   
    secret:process.env.SECRET   
}