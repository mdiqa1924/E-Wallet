var express = require('express');
var router = express.Router();
var fs = require('fs');

const path = require("path");
const credentials = require('../credentials');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt')
var util = require("../lib/util");
var middlewares = require("../lib/middlewares");



var formidable = require('formidable')
router.use(function (req, res, next) {
  // if there's a flash message, transfer // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

/* GET users listing. */

// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

mongoose.connect(credentials.mongo.development.connectionString);
var UserModel = require('../models/user');
var TransactionModel = require('../models/transaction');
const async = require('hbs/lib/async');


router.get('/resetPassword/:id', (req, res) => {
  UserModel.findById(req.params.id, (err, data) => {
    if (err) {
      console.log(err)

    }
    else (
      res.render('changePassword')
    )
  })
})


router.post('/resetPassword/:id', (req, res) => {
  UserModel.findByIdAndUpdate(req.params.id, { password: req.body.password }, (err, data) => {
    if (err) {
      console.log(err);
    }
    else {
      req.session.flash = {
        type: 'success',
        message: 'Đổi mật khẩu thành công cho tài khoản ' +
          user.email
      };
      res.redirect("/users/login")
    }
  })
})


router.get('/requestForgotPassword', (req, res) => {
  res.render('requestForgotPassword')
})



router.post('/requestForgotPassword', async (req, res) => {
  UserModel.findOne({ email: req.body.email }, (err, user) => {
    if (err) {

    } else {
      if (user != null)
        util.sendEmail({
          subject: "Change your password on Cloud Wallet ",
          html: "<h4>I am from Cloud Wallet</h4> Reset your password\n<a href='http://localhost:3000/users/resetPassword/" + user._id + "' >Click here </a>",
          to: req.body.email,
          from: "team2fluttertdt@gmail.com"
        });
      req.session.flash = {
        type: 'success',
        message: 'Đã gửi email đổi mật khẩu tới ' +
          user.email
      };
      res.redirect('/users/login')

    }
  })


})


//request user update their Id photo again require admin auth
router.get('/requestIdPhoto/:id', middlewares.requireAdminAuthentication, function (req, res, next) {
  UserModel.findByIdAndUpdate(req.params.id, { status: 2, $unset: { frontIdPhoto: 1, backIdPhoto: 1 } }, (err, user) => {
    res.redirect("/admin")
  })
});

//dactive user but require admin auth
router.get('/deactive/:id', middlewares.requireAdminAuthentication, function (req, res, next) {
  UserModel.findByIdAndUpdate(req.params.id, { status: 3, }, (err, user) => {
    res.redirect("/admin")
  })
});

//active user but require admin auth
router.get('/active/:id', middlewares.requireAdminAuthentication, function (req, res, next) {
  UserModel.findByIdAndUpdate(req.params.id, { status: 1 }, (err, user) => {
    res.redirect("/admin")
  })
});

router.get('/logout', function (req, res, next) {
  req.session.destroy((err) => {
    res.redirect('/users/login')
  });
});

//unlock user but require admin auth
router.get('/unlock/:id', middlewares.requireAdminAuthentication, function (req, res, next) {
  UserModel.findByIdAndUpdate(req.params.id, { lastLock: 0, wrongLogin: 0 }, (err, user) => {
    res.redirect("/admin")
  })
});

router.get('/uploadIdPhoto', function (req, res, next) {
  res.render('uploadIdPhoto')
});
router.post('/uploadIdPhoto', function (req, res, next) {
  // console.log("ok");
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) return res.redirect(303, '/error'); if (err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: 'There was an error processing your submission. ' +
          'Pelase try again.',
      };
      return res.redirect(303, '/');
    }
    var frontIdPhoto = files.frontIdPhoto;
    var backIdPhoto = files.backIdPhoto;
    console.log(files)
    // var obj = fields
    // obj.frontIdPhoto = {
    //   data: fs.readFileSync(frontIdPhoto.filepath).toString('base64'),
    //   contentType: 'image/png'
    // }
    // obj.backIdPhoto = {
    //   data: fs.readFileSync(backIdPhoto.filepath).toString('base64'),
    //   contentType: 'image/png'
    // }

    UserModel.findByIdAndUpdate(req.session.user._id, {
      frontIdPhoto: {
        data: fs.readFileSync(frontIdPhoto.filepath).toString('base64'),
        contentType: 'image/png'
      }, backIdPhoto: {
        data: fs.readFileSync(backIdPhoto.filepath).toString('base64'),
        contentType: 'image/png'
      }
      , IdPhotoUpdateTime: Date.now()
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        req.session.flash = {
          type: 'success',
          message: 'Bổ sung chứng minh nhân dân thành công!',
        };
        util.getUserInstance(req.session.user._id, (user) => { req.session.user = user; res.redirect("/") })
      }
    })
  });
});

router.get('/login', (req, res) => {
  if (req.session.admin == true || req.session.user == true) {
    res.redirect('/')
  }
  else {
    res.render('login');
  }

})


//login 
router.post('/login', (req, res, next) => {
  if (req.body.username == "admin") {
    if (req.body.password == "123456") {
      req.session.admin = true
      res.redirect("/admin");
    }
    else {
      answer = {
        type: 'danger',
        message: "Sai tài khoản hoặc mật khẩu"
      }
      res.render('login', { answer: answer })
    }

  }
  else {
    UserModel.findOne({ username: req.body.username }, (err, user) => {
      //if username is not found
      if (err || !user) {
        req.session.flash = {
          type: 'danger',
          message: "username is not found"
        }
        res.redirect('/users/login');
        console.log(err)
      }
      //if account locked once time before and then still log in failed 3 times more their will be lock forever
      else if (user.lastLock != 0 && user.wrongLogin >= 3) {
        answer = {
          type: 'danger',
          message: "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ"
        }
        res.render('login', { answer: answer })
      }
      //if account locked in 1 minute
      else if (Date.now() < parseInt(user.lastLock) + 60000) {
        answer = {
          type: 'danger',
          message: "Tài khoản của bạn bị khoá 1 phút Do đăng nhập sai quá 3 lần"
        }
        res.render('login', { answer: answer })
      }
      else {

        if (user.password != req.body.password) {
          //increase failed login by 1
          UserModel.findByIdAndUpdate(user._id, { wrongLogin: parseInt(user.wrongLogin) + 1 }, (err, data) => {

            answer = {
              type: 'danger',
              message: "Bạn đã đăng nhập sai " + (parseInt(user.wrongLogin) + 1) + " lần"
            }
            //lock user if they already log in failed 3 times
            if (data.wrongLogin >= 3) {
              if (data.lastLock != 0) {
                //if account locked once time before and then still log in failed 3 times more their will be lock forever
                answer = {
                  type: 'danger',
                  message: "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ"
                }
                res.render('login', { answer: answer })

              }
              answer = {
                type: 'danger',
                message: "Tài khoản của bạn bị khoá 1 phút Do đăng nhập sai quá 3 lần"
              }
              UserModel.findByIdAndUpdate(user._id, { lastLock: Date.now(), wrongLogin: 0 }, (err, data) => {
                res.render('login', { answer: answer })
              })
            }
            res.render('login', { answer: answer })
          })
        }
        //lock in success
        else {
          //refresh wrong log in record
          UserModel.findByIdAndUpdate(user._id, { lastLock: 0, wrongLogin: 0 }, (err, data) => {
            req.session.user = user
            //if this first time user log in
            if (user.isNewUser) {
              req.session.flash = {
                type: 'danger',
                message: "Vui lòng đổi mật khẩu lần đầu của quý khách"
              }
              res.redirect('/users/changePassword/' + user._id)
            }
            else {
              if (user.status == 4) {
                req.session.flash = {
                  type: 'danger',
                  message: "Tài khoản bị vô hiệu hoá"
                }
                res.redirect('/users/login')
              }
              else {
                res.redirect('/')
              }
            }
          })


        }


      }

    })
  }

});

router.get('/register', (req, res) => {
  res.render('register');
})

router.post('/register', (req, res) => {



  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) return res.redirect(303, '/error'); if (err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: 'There was an error processing your submission. ' +
          'Pelase try again.',
      };
      return res.redirect(303, '/');
    }
    var frontIdPhoto = files.frontIdPhoto;
    var backIdPhoto = files.backIdPhoto;
    console.log(files)
    console.log(fields)

    // hashed_password = bcrypt.hashSync(fields.password, 10)

    // console.log('oke ne', hash)
    // console.log('oke nha', hashed_password);
    var obj = fields
    //if Id photo are attach
    if (frontIdPhoto.size != 0) {
      obj.IdPhotoUpdateTime = Date.now()
      obj.frontIdPhoto = {
        data: fs.readFileSync(frontIdPhoto.filepath).toString('base64'),
        contentType: 'image/png'
      }
    }
    //if Id photo are attach
    if (backIdPhoto.size != 0) {
      obj.IdPhotoUpdateTime = Date.now()
      obj.backIdPhoto = {
        data: fs.readFileSync(backIdPhoto.filepath).toString('base64'),
        contentType: 'image/png'
      }
    }
    // obj.password = hashed_password
    obj.username = util.randomFromString("0123456789", 10)
    obj.password = util.randomFromString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 6)
    obj.isNewUser = true;
    obj.status = 0;
    obj.balance = 0;
    obj.wrongLogin = 0;
    obj.transfer = [];
    obj.lastLock = 0;
    obj.dateCreated = Date.now();
    console.log(obj);
    UserModel.create(obj, (err, item) => {
      if (err) {
        console.log(err);
      }
      else {
        // item.save();
        // callback(err);
        util.sendEmail({
          subject: "Mật khẩu và Tên đăng nhập vào hệ thống Cloud Wallet",
          html: "<h3>Tên đăng nhập: </h3> <strong>" + obj.username + "</strong>\n<h3>Mật khẩu: </h3> <strong>" + obj.password + "</strong>\n",
          to: obj.email,
          from: "team2fluttertdt@gmail.com"
        });
        req.session.flash = {
          type: 'success',
          message: "Email chứa tên đăng nhập và mật khẩu đã được gửi tới <strong>" + obj.email + "</strong> "
        }
        res.redirect('/users/login')

      }
    });

    // save_path = vacationPhotoDir + '/' + ;
    // save_path2 = 
    // console.log(save_path)
    // fs.renameSync(frontIdPhoto.filepath, save_path);
    // saveContestEntry(fields.email, save_path, () => {
    //   req.session.flash = {
    //     type: 'success',
    //     intro: 'Good luck!',
    //     message: 'You have been entered into the contest.',
    //   };
    //   return res.redirect(303, '/');
    // });
  });






  // if(req.body.username == 'admin' &&
  // req.body.password == 'admin'){
  //       console.log("oke")
  //       console.log(req.session.returnBack)
  //       req.session.admin = 'admin';
  //
  //       console.log(req.session.admin)
  //       if(req.session.returnBack){
  //         console.log(req.session.returnBack)
  //         res.redirect(req.session.returnBack)
  //         delete req.session.returnBack;
  //       }
  //       res.redirect('/')
  //
  // }
  // else{
  //   res.render('login',    {username: req.body.username, message: 'Sai tên đăng nhập hoặc mật khẩu'})
  // }
});

router.get('/forgotpassword', (req, res) => {
  res.render('forgotPassword')
})

//change password
router.get('/changePassword/:id', (req, res) => {
  UserModel.findById(req.params.id, (err, data) => {
    if (err) {
      console.log(err)

    }
    else (
      res.render('changePassword', { isNewUser: data.isNewUser == false ? "old user" : null })
    )
  })
})
router.post('/changePassword/:id', (req, res) => {
  console.log("passwork is changing");
  let userType = true;
  UserModel.findById(req.params.id, (err, data) => {
    if (err) {
      console.log(err)

    }
    else (
      userType = data.isNewUser
    )
  })
  console.log(userType)

  //change password at the first time
  if (userType == true) {
    UserModel.findByIdAndUpdate(req.params.id, { isNewUser: false, password: req.body.password }, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/")
      }
    })
  }
  //change password normally
  else {
    //current password is wrong
    if (req.body.currentPassword != user.password) {
      //password message
    }
    else {
      //new password and confirm password do not match
      if (req.body.password != req.body.r_password) {
        //password message
      }
      else {
        //success change password
        UserModel.findById(req.params.id, { password: req.body.password }, (err, data) => {
          if (err) {
            console.log(err);
          }
          else {
            res.redirect("/")
          }
        })
      }
    }
  }
})




//get user instance but require admin auth
router.get('/:id', middlewares.requireAdminAuthentication, function (req, res, next) {
  UserModel.findById(req.params.id).populate('transactions').exec((err, user) => {

    res.render("adminUserView", { admin: true, selectedUser: user, status: util.getStatusString(user.status), inWaitList: user.status == 0 ? true : null, isDeactivated: user.status == 3 ? true : null, isActived: user.status == 1 ? true : null, isLocked: (user.wrongLogin >= 3 && user.lastLock != 0) ? true : null })
  })
});

module.exports = router;
