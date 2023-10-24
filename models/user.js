const mongoose = require('mongoose');
//user schema
const UserSchema =  new mongoose.Schema({
    username: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    registerdate: {
        type: Date,
        required:true
    }
});
module.exports = mongoose.model('User', UserSchema )