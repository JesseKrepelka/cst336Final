const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: process.env.dbHost || "ofcmikjy9x4lroa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.dbUser || "grc5vg5b95vt0otr" ,
    password: process.env.dbPassword || "x0txo9avldwzn578" ,
    database: process.env.database  || "a65eyuwjnkfu86or"
});

module.exports = pool;