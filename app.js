const express = require("express");
const app = express();
const request = require("request");
const pool = require("./dbPool.js");

//express setup
app.set("view engine", "ejs");
app.use(express.static("public"));

//declares the port and IP for localhost and global
var port = process.env.PORT || 8080;
var ip = process.env.IP || "127.0.0.1";

//default route
app.get("/", function (req, res) {

    res.render("index");

});


//Starting the web server
app.listen(port, ip,
    function () {
        console.log("Express server is running");
    });