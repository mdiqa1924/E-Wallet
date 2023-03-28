var express = require('express');
var router = express.Router();
var middlewares = require("../lib/middlewares");
var util = require("../lib/util");
var UserModel = require('../models/user');


/* GET home page. */
router.get('/', middlewares.requireAnyAuthentication, function (req, res, next) {
  if (req.session.admin == true) {
    res.redirect('/admin')
  }
  else {
    UserModel.findById(req.session.user._id, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        res.render('index', { user: user, status: util.getStatusString(user.status), requiredIdPhoto: user.status == 2 || user.frontIdPhoto == null || user.backIdPhoto == null ? true : null })
      }
    })
  }

});
module.exports = router;
