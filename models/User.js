const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    Username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
	type: {
		type: Number,
		default: 0
	}
});

const User = mongoose.model('User', UserSchema);
module.exports = User;