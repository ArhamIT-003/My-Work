//jshint esversion:6
require('dotenv').config();
const express = require ("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require ("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

/////   From Express session ////
app.use(session({
  secret: "This is our little secret.",
  resave: false,
  saveUninitialized: false
}));

//// intialize passport ///
app.use(passport.initialize());
app.use(passport.session());


// Database Connection //
mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

/// Initalize the plugin for passportLocalMongoose //
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

/// for session //
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////     Get Route . ///
app.get("/", (req,res)=>{
  res.render("home");
});
app.get("/login", (req,res)=>{
  res.render("login");
});
app.get("/register", (req,res)=>{
  res.render("register");
});
app.get("/secrets", (req, res)=>{

  if(req.isAuthenticated()){               /// request is authenticate //
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }

});
app.get("/logout", (req, res)=>{
  req.logout((err)=>{
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });
});
///// Post Route . //////

app.post("/register", (req, res)=>{

  User.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets");
      })
    }
  });

});

app.post("/login", (req, res)=>{

  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err)=>{
    if(err){
      console.log(err);
      res.redirect("/");
    }
      else{
        passport.authenticate("local")(req, res, ()=>{
          res.redirect("/secrets");
        })
      }
  });
});

app.listen(3000, ()=>{
  console.log("Successfully Server started on port 3000");
});
