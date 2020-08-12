const express = require("express");
const app = express();
const request = require("request");
const pool = require("./dbPool.js");
const session = require('express-session');
const { response } = require("express");
const util = require('util');


//express setup & middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'uniqueSessionKeys',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


//declares the port and IP for localhost and global
const port = process.env.PORT || 8080;
const ip = process.env.IP || "127.0.0.1";

//default route
app.get("/", function (req, res) {
    console.log(req.session.isAdmin);
    let sql = "SELECT * FROM books LEFT JOIN authors ON books.id = authors.books_id ORDER BY id";
    var randNumbers = new Array();
    for(let i=0; i<3; ){
        let number = Math.floor((Math.random()*20)+1);
        if (!randNumbers.includes(number)){
            randNumbers[i] = number;
            i++;
            console.log("Number inserted: " + number);
        }
    }
    
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        //console.log(rows);
        //res.redirect("/getMovies");
        res.render("index", { isAdmin: req.session.isAdmin, "bookInfo":rows, "numbers":randNumbers, "success":0 });
    });
});

app.get("/shoppingCart", function (req, res) {
    console.log(req.session.isAdmin);
    let sql = "SELECT * FROM shopping_cart LEFT JOIN authors ON shopping_cart.bookID = authors.books_id LEFT JOIN books ON shopping_cart.bookID = books.id ";
    
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        res.render("cart", { isAdmin: req.session.isAdmin, "books":rows });
    });
});

app.get("/addToCartSuccess", function (req, res) {
    console.log(req.session.isAdmin);
    let sql = "SELECT * FROM books LEFT JOIN authors ON books.id = authors.books_id ORDER BY id";
    var randNumbers = new Array();
    for(let i=0; i<3; ){
        let number = Math.floor((Math.random()*20)+1);
        if (!randNumbers.includes(number)){
            randNumbers[i] = number;
            i++;
            console.log("Number inserted: " + number);
        }
    }
    
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        //console.log(rows);
        //res.redirect("/getMovies");
        res.render("index", { isAdmin: req.session.isAdmin, "bookInfo":rows, "numbers":randNumbers, "success":1 });
    });
});

app.get("/buyCartSuccess", function (req, res) {
    console.log(req.session.isAdmin);
    let sql = "SELECT * FROM books LEFT JOIN authors ON books.id = authors.books_id ORDER BY id";
    var randNumbers = new Array();
    for(let i=0; i<3; ){
        let number = Math.floor((Math.random()*20)+1);
        if (!randNumbers.includes(number)){
            randNumbers[i] = number;
            i++;
            console.log("Number inserted: " + number);
        }
    }
    
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        //console.log(rows);
        //res.redirect("/getMovies");
        res.render("index", { isAdmin: req.session.isAdmin, "bookInfo":rows, "numbers":randNumbers, "success":2 });
    });
});


/**************   Login routes *****************
 * ********************************************/
app.get("/login", function (req, res) {
    res.render("login", { isAdmin: req.session.isAdmin })
    
});

app.post("/logout", function (req, res) {
    req.session.destroy(function(err){
        if(err)throw err;
        res.render("index", { isAdmin: false });
    })
})

app.post("/login", function (req, res) {

    loginSql = "select * from admins where adm_email = ? and adm_pword = ?"
    pool.query(loginSql, [req.body.email, req.body.password], function (err, rows, fields) {
        if (err) {
            
            throw err;
        }
        req.session.isAdmin = true;
        console.log(req.session.isAdmin)
        res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: false, noRecords: false, login: true, isAdmin: req.session.isAdmin });

    });
});



/**************  Admin Routes *****************
 ********************************************/

app.get("/bookManager", function (req, res) {
    //console.log(req);
    res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: false, noRecords: false, login: false, isAdmin: req.session.isAdmin });

});

//api call for adding updating books

app.post("/addToCart", function(req, res){
    /*
    sqlSelect = "SELECT imageUrl, title, price, auth_name FROM books LEFT JOIN authors ON books.id = authors.books_id ORDER BY id";
    sqlParam = [req.body.id];
    */
    sqlSelect = "SELECT bookID  FROM shopping_cart WHERE bookID = ?";
    sqlSelectParams = [req.body.id];
    pool.query(sqlSelect, sqlSelectParams, function (err, rows, fields) {
        if (!rows.length >= 1){
            sqlInsert = "INSERT INTO shopping_cart (bookID) VALUES (?)";
            sqlInsertParams = [req.body.id];
            pool.query(sqlInsert, sqlInsertParams, function (err, rows, fields){
                if (err) {
                    throw err;
                }
            });
            
        }
    });
    console.log("Success!");
    res.send({redirect: '/addToCartSuccess'});
});

app.get("/removeFromCart", function(req,res){
    sqlDelete = "DELETE FROM shopping_cart WHERE bookID = ?";
    sqlDeleteParams = [req.query.id];
    pool.query(sqlDelete, sqlDeleteParams, function (err, rows, fields){
        if (err) {
            throw err;
        }
    });
    res.redirect("/shoppingCart");
});

app.post("/buyCart", function(req,res){
    sqlDelete = "DELETE FROM shopping_cart WHERE id=1";
    pool.query(sqlDelete, function (err, rows, fields){
        if (err) {
            throw err;
        }
    });
    res.send({redirect: '/buyCartSuccess'});
});

app.post("/bookUpdate", function (req, res) {

    sqlSelect = "Select isbn FROM books where isbn = ?";
    sqlSelectParams = [req.body.ISBN];
    pool.query(sqlSelect, sqlSelectParams, function (err, rows, fields) {


        if (rows.length >= 1) {
            console.log("entering the update function");
            sqlUpdate = "UPDATE books b, descriptors d, authors a "
                + "SET b.isbn = ?, b.imageUrl = ?, b.title = ?, d.genre = ?, a.auth_name = ?, b.stock = ? WHERE b.isbn = ?";
            sqlUpdateParams = [req.body.ISBN, req.body.imageURI, req.body.title, req.body.genre, req.body.author, req.body.stock, req.body.ISBN];

            pool.query(sqlUpdate, sqlUpdateParams, function (err, rows, fields) {
                if (err) {
                    //res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: true });
                    throw err;
                }
                //console.log(rows);
                res.render("bookManager", { bookUpdated: true, bookAdded: false, bookDeleted: false, error: false, noRecords: false, login: false, isAdmin: req.session.isAdmin });
            })

        }
        else {
            console.log("entering the insert side");
            sqlBooks = "INSERT INTO books (isbn, imageUrl, title, stock) VALUES (?,?,?,?)";
            sqlDescriptors = "INSERT INTO descriptors (books_id, genre) VALUES (?,?)";
            sqlAuthors = "INSERT INTO authors (books_id, auth_name) VALUES (?, ?)";
            bookId = null;

            pool.query(sqlBooks, [req.body.ISBN, req.body.imageURI, req.body.title, req.body.stock], function (err, rows, fields) {
                if (err) {
                    res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: true, noRecords: false, login: false, isAdmin: req.session.isAdmin });
                    throw err;
                }
                //console.log(rows.insertId);
                bookId = rows.insertId;

                pool.query(sqlDescriptors, [bookId, req.body.genre], function (err, rows, fields) {
                    if (err) {
                        res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: true, noRecords: false, login: false, isAdmin: req.session.isAdmin });
                        throw err;
                    }
                    // console.log(rows);

                    pool.query(sqlAuthors, [bookId, req.body.author], function (err, rows, fields) {
                        if (err) {
                            res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: true, noRecords: false, login: false, isAdmin: req.session.isAdmin });
                            throw err;
                        }
                        // console.log(rows);
                        res.render("bookManager", { bookUpdated: false, bookAdded: true, bookDeleted: false, error: false, noRecords: false, login: false, isAdmin: req.session.isAdmin });

                    });

                })

            });

        }

    });

});


app.post("/bookDelete", function (req, res) {
    sql = "DELETE FROM books where isbn = ?";
    var recordsFound = true;
    pool.query(sql, [req.body.ISBN2], function (err, rows, fields) {
        if (err) {
            res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: true, noRecords: false, login: false, isAdmin: req.session.isAdmin });
            throw err;
        }
        console.log(rows);
        if (rows.affectedRows >= 1) {
            recordsFound = false;
            res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: true, error: false, noRecords: recordsFound, login: false, isAdmin: req.session.isAdmin });
        } else {
            res.render("bookManager", { bookUpdated: false, bookAdded: false, bookDeleted: false, error: false, noRecords: recordsFound, login: false, isAdmin: req.session.isAdmin });
        }

    })

});



//Starting the web server
//NOte can't put in other info or heroku won't work
/* app.listen(port, ip,
    function () {
        console.log("Express server is running");
    }); */
    
app.listen(process.env.PORT, process.env.IP,
    function () {
        console.log("Express server is running");
    });

/*
app.listen(3000,function(){
    console.log("Express server is running");
});
*/
/********* Helpful Functions ***************
********************************************/

