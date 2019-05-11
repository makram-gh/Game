const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

var url = "mongodb://localhost:27017/";


//user model
const User = require('../models/User');


//login page
router.get('/login', (req, res) => res.render('login'));

//Register page
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const {name, Username, password, password2} = req.body;
    let errors = [];

    if (!name || !Username || !password || !password2) {
        errors.push({msg: 'Please Fill In All Fields!'});
    }

    if (password != password2) {
        errors.push({msg: "Passwords Do Not Match!"});
    }

    if (password.length < 6) {
        errors.push({msg: 'Password Should be at least 6 characters!'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            Username,
            password,
            password2
        });
    } else {
        // validation pass
        User.findOne({Username: Username})
            .then(user => {
                if (user) {
                    //user exists
                    errors.push({msg: 'Username Is Already Registered!'})
                    res.render('register', {
                        errors,
                        name,
                        Username,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        Username,
                        password
                    });
                    //hash password
                    bcrypt.genSalt(10, (error, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //Set password to hashed.
                        newUser.password = hash;
                        //save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now Registered, and can now log in!')
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err));

                    }))

                }
            });
    }
});

//login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are now Logged Out!');
    res.redirect('/users/login');
});

module.exports = router;