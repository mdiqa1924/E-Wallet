var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const credentials = require('./credentials');
var mongoose = require('mongoose');
mongoose.connect(credentials.mongo.development.connectionString);
var UserModel = require('./models/user');

//check is admin account exist, if not add admin account
UserModel.findOne({ username: "admin" }, (err, data) => {
  if (err) {
    console.log(err);
  }
  if (data) {
    UserModel.findOneAndDelete({ username: "admin" }, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        UserModel.create({ username: "admin", password: "123456" }, (err, data) => {
          if (err) {
            console.log(err);
          }
          if (data) {
            console.log("admin account existence check: success! \nusername: admin password: 123456");
          }
        })

      }
    })

  }
})


//require session
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var walletRouter = require('./routes/wallet');
var adminRouter = require('./routes/admin');


//embedding session to app
var app = express();
app.use(session({
  secret: 'my secret',
  resave: true,
  saveUninitialized: true,

}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wallet', walletRouter);
app.use('/admin', adminRouter);
app.use(function (req, res, next) {
  // if there's a flash message, transfer // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
