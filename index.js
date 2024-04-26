if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

// Import dependencies
const express = require("express");
const app = express();
const home = require("./routes/home");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const path = require("path");
const methodOverride = require('method-override');
const passport = require("passport");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const User = require("./models/user");
const LocalStrategy = require("passport-local");
const userR = require("./routes/user");
const flash = require("connect-flash");
const ExpressError=require("./views/utils/expressError")


// Set up view engine and static files
app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const db=process.env.MONGODB_URL;
// Connect to MongoDB
const port = 3000;
main().catch((err) => { console.log(err.message); });

async function main() {
  await mongoose.connect(db);
  console.log("connected");
}
const store=MongoStore.create({
  mongoUrl:db,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600,
})
store.on("error",()=>{
  console.log("Session error",error);
})
// Configure session middleware
app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60*1000,
    maxAge: 7 * 24 * 60 * 60*1000
  }
}));

// Set up flash messages middleware
app.use(flash());

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up Passport Local Strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up locals middleware for flash messages and user data
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curUser = req.user;
  res.locals.req = req;
  next();
});

// Set up routes
app.use("/notes", home);
app.use("/notes", userR);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Some error occurred" } = err;
  res.render("error.ejs", { message });
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});