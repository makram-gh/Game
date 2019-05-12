const express=require('express');
const router=express.Router();
var sessionStorage= require('sessionstorage');
const{ ensureAuthenticated } = require('../config/auth');

var url = "mongodb://localhost:27017/";

// Welcome Page
router.get('/', (req,res)=>res.render('welcome'));

// Admin Page
router.get('/admin', (req,res)=>res.render('admin'));

//router.get('/editusers', (req,res)=>res.render('editusers'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req,res)=>{
	var name;
    res.render('dashboard',{
        name:req.user.name,
        date:req.user.date
    });
sessionStorage.setItem("username", req.user.name);
console.log("Username = " + sessionStorage.getItem("username"));
});

// Start Game
router.get('/start', ensureAuthenticated, (req,res)=>res.render('question'));

// End Game
router.get('/end', ensureAuthenticated, (req,res)=>res.render('end'));

module.exports=router;