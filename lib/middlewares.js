const { Utils } = require("hbs")
const util = require("./util")

module.exports.requireAnyAuthentication = (req, res, next) => {
  if (req.session.user) {
    next()
  }
  else if (req.session.admin) {
    next()
  }
  else {
    req.session.returnBack = '/'
    res.redirect('/users/login')
  }
}

module.exports.requireAuthentication = (req, res, next) => {

  if (req.session.user) {
    next()
  }
  else {
    req.session.returnBack = '/'
    res.redirect('/users/login')

  }
}

module.exports.checkActivatedUser = (req, res, next) => {
  if (req.session.user.status == 1) {
    next()
  }
  else {
    res.redirect('/')

  }
}


module.exports.requireAdminAuthentication = (req, res, next) => {
  if (req.session.admin) {
    next()
  }
  else {
    req.session.returnBack = '/'
    res.redirect('/users/login')

  }
}

module.exports.requireActivatedUser = (req, res, next) => {
  util.getUserInstance(req.session.user._id, (user) => {
    req.session.user = user
    if (req.session.user.status == 1) {
      next()
    }
    else {
      answer = {
        type: 'danger',
        message: "Tính năng này chỉ dành cho các tài khoản đã được xác minh hoặc không bị vô hiệu hoá"
      }
      res.render('announcement', { answer: answer })
    }
  })


}


module.exports.verifyPhoneCardValueInput = (req, res, next) => {
  console.log(req.body.provider);
  console.log(req.body.amount);
  legalValue = [10000, 20000, 50000, 100000]
  provider = ["vinaphone", "viettel", "mobifone"]
  if (legalValue.includes(parseInt(req.body.amount)) && provider.includes(req.body.provider)) {
    next()
  }
  else {
    answer = {
      type: 'danger',
      message: "Dữ liệu mua thẻ cào  không hợp lệ"
    }
    res.render('announcement', { answer: answer })
  }
}

