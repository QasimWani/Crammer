const express = require("express"),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      flash   = require("connect-flash"),
      moment  = require("moment"),
      compression = require('compression');
      request = require("request"),
      mailingSystem = require("./middleware/mails"),
      methodOverride    = require("method-override"),
      cookieSession     = require("cookie-session"),
      dotenv        = require("dotenv"),
      Account    = require("./models/account"),
      passport = require("passport"),
      expressSanitizer = require('express-sanitizer'),
      app = express();

app.use(flash());       
dotenv.config();
app.use(compression());
app.use(expressSanitizer());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('./public'));

var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

app.use(methodOverride("_method"));

app.use(cookieSession({
    maxAge : 360*3600*1000,
    keys   : ['questioning_the_state_of_my_descisions_October_25_2019']
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

var MemoryStore = require("memorystore")(require('express-session'));

app.use(require("express-session")({
   secret : "Dedicated to save myself time when procrastinating on my last minute ECE assignments. Instead of turning them in at 11:58 pm, I shall turn them in at 11:55 pm.",
   store: new MemoryStore({
    checkPeriod: 86400000 // prune expires entries every 24h
  }),
   resave : false,
   saveUninitialized : false
}));
setInterval(()=>{
    var i = 0;
    if(i == 0)
    {
      i++;
      request(process.env.emailConfirmationLink+"/about",(err, body, response)=>{
        console.log("Loaded the app again.");
      });
    }
    i++;
  }, 1000*60*9.99);


mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://"+process.env.mongoDB_Connect+"/crammer",{ useNewUrlParser: true, useUnifiedTopology: true});

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    res.locals.info = req.flash("info");
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });


const cramRoute = require("./routes/cram");
app.set('trust proxy', true);

app.use("/", cramRoute);

app.get("/", function(req, res){
return res.render("index", {err: ''});
});

// app.get("*",(req, res)=>{
//     res.render("partials/error");
//   });


  var server = app.listen(process.env.PORT || 2718, process.env.IP,()=>{
    console.log("Crammer Server Connected");
  });