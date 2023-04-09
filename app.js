const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const ejs = require("ejs");
var flash = require("connect-flash");
const mongoose = require("mongoose");
const app = express();

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(flash());
mongoose.set("strictQuery", false);
// configure session
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// configure EJS as the template engine
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/LMS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

  
// define a user schema

const userSchema = new mongoose.Schema({
name:{
    type:String,
},
email:{
    type:String,
    require:true,
    unique:true,
},
password:{
    type:String,
    require:true,
},
roll_no:{
    type:String,
    
}
})

const bookSchema = new mongoose.Schema({
    bookcode:{
        type:String,
    },
    bookname:{
        type:String,
    },
    author1:{
        type:String,
        
    },
    author2:{
        type:String,
    
    },
    subject:{
        type:String,
        
    },
    tag:{
        type:String,
        
    },

    })


// define a User model based on the user schema
const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);

// define a User model based on the user schema
// const Admin = mongoose.model("Admin", userSchema);

passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email }, (err, user) => {
        // console.log(user);
        if (err) return done(err);
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      });
    })
  );

  // serialize user for session storage
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // deserialize user from session storage
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) return done(err);
      done(null, user);
    });
  });

app.get("/",function(req,res){
    res.render("index");
})  

app.get("/admin_login",function(req,res){
    res.render("admin_login");
})  

app.get("/user_login",function(req,res){

    res.render("user_login");
})  

app.get("/user_sign_up",function(req,res){
    res.render("user_sign_up");
})  

app.get("/show_user",function(req,res){
    User.find({ email: { $ne: "admin@gmail.com" }},function(err,foundusers){
    return res.render("show_user",{ users: foundusers});     
    })
})

app.get("/home",function(req,res){
    if(req.user.email=="admin@gmail.com"){
        Book.find({},function(err,foundbooks){
            // console.log(foundbooks);
        // const founduser =  User.find({ email: { $ne: "admin@gmail.com" }})
        return res.render("admin_home",{ books: foundbooks});
            
        })
    }

    Book.find({},function(err,foundbooks){
        // console.log(foundbooks);
        res.render("user_home",{username: req.user.email,books: foundbooks});
    })

}) 



app.post("/user_sign_up",function(req,res){
    // console.log(req.body)
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        roll_no:req.body.roll_no,

    })

    user.save((err) => {
            if (err) {
              console.log(err);
              req.flash("error", "Error creating user");
              return res.redirect("/user_sign_up");
            }
            // console.log(user);
            res.redirect("/user_login");
          });
})

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/user_login",
    failureFlash: true,
    usernameField: "email",
  })
);

app.get("/add_book",function(req,res){
    res.render("add_book"); 
})

app.post("/add_book",function(req,res){

    const book = new Book({
        bookcode:req.body.bookcode,
        bookname:req.body.bookname,
        author1:req.body.author1,
        author2:req.body.author2,
        subject:req.body.subject,
        tag:req.body.tag,
    })

    book.save((err) => {
            if (err) {
              console.log(err);
              req.flash("error", "Error creating book");
              return res.redirect("/add_book");
            }
            // console.log(user);
            res.redirect("/home");
          });
})


// start the server
app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });