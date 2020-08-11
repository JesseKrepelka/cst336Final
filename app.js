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
    res.render("index", { isAdmin: req.session.isAdmin });
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

})


/**************  Cart Routes *****************
 ********************************************/

app.get("/cart", function (req, res) {
    //console.log(cartArray)
    res.render("cart", { isAdmin: req.session.isAdmin})
});

app.get("/cartContents", async function (req, res) {
    let cartArray = await fillCart(req.query.cart);
    var totalPrice = 0;
    res.render("partials/cartContents", {isAdmin: req.session.isAdmin, "cartArray": cartArray, "totalPrice" : totalPrice});
});

function fillCart(cartIds){
    return new Promise(function(resolve, reject){
        let sql = "SELECT * FROM books WHERE id in (?)";
        let sqlSelectParams = [cartIds];//took like a half hour to realize this needed to be in brackets
        let cArray = [];
        console.log(sqlSelectParams);
        pool.query(sql, sqlSelectParams, function(err, rows, fields) {
            if (err) reject(err);
            console.log(rows);
            for (var i of rows){
                cArray.push(i);
            }
            resolve(cArray);
        });
    });
}


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


/********* Helpful Functions ***************
********************************************/

