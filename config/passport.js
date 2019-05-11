const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const configAuth = require('./auth-facebook');

//Load User Model
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({usernameField: 'Username'}, (Username, password, done) => {
            //Match User
            User.findOne({Username: Username})
                .then(user => {
                    if (!user) {
                        return done(null, false, {message: 'That Username is not Registered'});
                    }
                    // Match Password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'Password Incorrect.'});
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL
        },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    if(err){
                        return done(err);
                    }
                    if(user)
                        return done(null, user);
                    else {
                        // validation pass
                        User.findOne({Username:profile.displayName})
                            .then(user => {
                                if (user) {
                                    //user exists
                                    return done(null, user);
                                } else {
                                    var newUser = new User();
                                    newUser.name = profile.displayName;
                                    newUser.password=accessToken;
                                    newUser.Username=profile.displayName;

                                    newUser.save()
                                        .then(user => {
                                            return done(null, newUser);
                                        })
                                        .catch(err => console.log(err));

                                }
                            });

                    }
                });
            });
        }
    ));
};

//return done(null, newUser);