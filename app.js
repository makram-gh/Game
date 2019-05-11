const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
var mysql = require('mysql');
var sessionStorage= require("sessionstorage");
var localStorage=require("localStorage");
const app = express();
const{ ensureAuthenticated }=require('./config/auth');


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
    database:"csis279"
});

// Body-parser
app.use(express.urlencoded({extended:true}));

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
    res.locals.error= req.flash('error');
    next();
});

// Routes usage
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.get('/hall', ensureAuthenticated, (req,res) => {
	con.connect( (err) =>{
        console.log("Scores Retrieved");
        var sql = "SELECT * FROM highscore ORDER BY score DESC"
		con.query(sql, (err,result) => {
        res.render('hall',{scores:result});
        })
    })
})

app.get('/insert', ensureAuthenticated, (req,res)=>{
	con.connect((err)=>{
		console.log("Score Inserted");
		var scor = sessionStorage.getItem("mostRecentScore");
		var uname = sessionStorage.getItem("username");
		console.log(scor);
		var sql1 = "Insert INTO highscore (id,username,score) VALUES (null,'"+uname+"','"+scor+"')";
		con.query(sql1, (err,result)=>{
			if(err) throw err;
		})
	})
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server started on port ' + PORT));