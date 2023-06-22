const mysql = require("mysql2")
const {config} = require("../secret/config")

const sqlConfig = {
    host:config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl:{
        rejectUnauthorized: false
    }
}

const sqlCon = mysql.createConnection(sqlConfig);
sqlCon.connect((err) => {
    if (err) { return console.log(err); }
    console.log("SQL connection to  fullstack3 cloud establised");
})

module.exports = sqlCon;