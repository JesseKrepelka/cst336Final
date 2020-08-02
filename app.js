const express = require("express");
const app = express();
const request = require("request");
const pool = require("./dbPool.js");

//express setup & middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
  }));

//declares the port and IP for localhost and global
var port = process.env.PORT || 8080;
var ip = process.env.IP || "127.0.0.1";

//default route
app.get("/", function (req, res) {
    res.render("index");
});


 /**************   Login routes *****************
  * ********************************************/
app.get("/login", function (req, res) {
    res.render("login")
});



 /**************  Admin Routes *****************
  ********************************************/

app.get("/bookManager", function (req, res){
    res.render("bookManager");
});

app.post("/updateBook", function (req, res){
    console.log(req.body.title);
    console.log(req.body);

    res.render("bookManager");
    //if(req.body.title)
});


//Starting the web server
//NOte can't put in other info or heroku won't work
app.listen(port, ip,
    function () {
        console.log("Express server is running");
    });

/* app.listen(process.env.PORT, process.env.IP,
    function () {
        console.log("Express server is running");
    }); */