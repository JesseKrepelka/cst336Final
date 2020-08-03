const express = require("express");
const app = express();
const request = require("request");
const pool = require("./dbPool.js");
const session = require('express-session');


//express setup & middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'nvurw23g24vn23',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


//declares the port and IP for localhost and global
const port = process.env.PORT || 8080;
const ip = process.env.IP || "127.0.0.1";

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

app.get("/bookManager", function (req, res) {
    //console.log(req);
    res.render("bookManager");

});

app.post("/bookManager", function (req, res) {
    console.log("This is Body: ", req.body);

    if (bookExists(req.body.ISBN)) {
        sqlUpdate = "UPDATE books b, descriptors d, authors a, inventory i"
            + "SET b.isbn = ?, b.imageUrl = ?, b.title = ?, d.genre = ?, a.auth_name = ?, i.stock = i";
        sqlUpdateParams = [req.body.ISBN, req.body.imageURI, req.body.title, req.body.genre, req.body.author, req.body.stock];

        pool.query(sqlUpdate, sqlUpdateParams, function (err, rows, fields) {
            if (err) throw err;
            console.log(rows);
            res.send("200");
        });
    } else {
        sqlBooks = "INSERT INTO books (isbn, imageUrl, title) VALUES (?,?,?)";
        sqlDescriptors = "INSERT INTO descriptors (books_id, genre) VALUES (?,?)";
        sqlAuthors = "INSERT INTO authors (books_id, auth_name) VALUES (?, ?)";
        sqlInventory = "INSERT INTO inventory (books_id, stock) VALUES (?, ?)";
        bookId = null;
        /*  sqlInsert = "INSERT INTO books AS b, descriptors AS d, authors AS a, inventory AS i (b.isbn, b.imageUrl," 
             + " b.title, d.genre, a.auth_name, i.stock)  VALUES (?,?,?,?,?,?)"; */

        pool.query(sqlBooks, [req.body.ISBN, req.body.imageURI, req.body.title], function (err, rows, fields) {
            if (err) throw err;
            console.log(rows.insertId);
            bookId = rows.insertId;

            pool.query(sqlDescriptors, [bookId, req.body.genre], function (err, rows, fields) {
                if (err) throw err;
                console.log(rows);

                pool.query(sqlAuthors, [bookId, req.body.author], function (err, rows, fields) {
                    if (err) throw err;
                    console.log(rows);

                    pool.query(sqlInventory, [bookId, req.body.stock], function (err, rows, fields) {
                        if (err) throw err;
                        console.log(rows);
                    });
                });
            });

        });

        res.send("200");
    }

    /* console.log("This is a query: ", req.query);
    console.log("This is Params: ", req.params);
    console.log("This is content-type: ", req.headers["content-type"]); */
    //console.log(req);

});

app.post("/bookDelete", function (req, res) {
    console.log("This is Body: ", req.body);

    res.render("bookManager");
})


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

function bookExists(isbn) {
    sqlSelect = "Select isbn FROM books where isbn = ?";
    sqlSelectParams = [isbn];

    pool.query(sqlSelect, sqlSelectParams, function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        if (rows >= 1) {
            return true;
        }
        return false;
    });
};

