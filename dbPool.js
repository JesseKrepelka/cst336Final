const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: process.env.dbHost || "s9xpbd61ok2i7drv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.dbUser || "fxwtqjetkgq9pvek" ,
    password: process.env.dbPassword || "knkxbmu2lb28269b" ,
    database: process.env.database  || "uq150fxkd69erms1"
});

module.exports = pool;