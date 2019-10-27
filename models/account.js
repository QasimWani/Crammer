var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var Account_Schema = new mongoose.Schema({
    mac_address : String,
    email_address : String,
    times_used : Number,
    images_taken : Number,
    last_used : String
});
Account_Schema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Account", Account_Schema);