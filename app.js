const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
var mysql = require('mysql');
var sessionStorage = require("sessionstorage");
const app = express();
const {ensureAuthenticated} = require('./config/auth');

var url = "mongodb://localhost:27017/";

//facebook stuff
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Passport config
require('./config/passport')(passport);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Mongodb
const db = require('./config/keys').MongoURI;
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected (Users)'))
    .catch(err => console.log(err));

// mysql
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "csis279"
});

// Body-parser
app.use(express.urlencoded({extended: true}));

// Express session
app.use(session({
    secret: 'oh my god',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Connect
app.use(flash());

// Gloabl Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes usage
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

//facebook

app.get('/auth/facebook', passport.authenticate('facebook'))

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/users/login' }),
    function(req, res) {
        console.log('logged in to facebook');
        res.redirect('/dashboard');
    });

app.get('/editusers', function (req, res) {
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
        var dbo = db.db("CSIS279");
        dbo.collection('users').find().toArray(function(err,result){
            if(err)
                return console.log(err);
            console.log(result);
            res.render('editusers.ejs', {Users:result});
        });
    });
});


app.get('/hall', ensureAuthenticated, (req, res) => {
    con.connect((err) => {
        console.log("Scores Retrieved");

        var sql = "SELECT * FROM highscore ORDER BY score DESC"
        con.query(sql, (err, result) => {
            res.render('hall', {scores: result});
        })
    })
})

app.get('/insert', ensureAuthenticated, (req, res) => {
    con.connect((err) => {
        console.log("Score Inserted");
        var uname = sessionStorage.getItem("username");
        var sql1 = "Insert INTO highscore (id,username,score) VALUES (null,'" + uname + "',10)";
        con.query(sql1, (err, result) => {
            if (err) throw err;
        })
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server started on port ' + PORT));