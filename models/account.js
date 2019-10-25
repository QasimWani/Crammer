var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var Account_Schema = new mongoose.Schema({
    ip_address : String,
    times_used : Number,
    images_taken : Number
});
RetractSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Account", Account_Schema);