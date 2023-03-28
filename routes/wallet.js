var express = require('express');
var router = express.Router();
var middlewares = require("../lib/middlewares");
var util = require("../lib/util");
const user = require('../models/user');
var UserModel = require('../models/user');
var TransactionModel = require('../models/transaction');




router.get('/deposit', middlewares.requireAuthentication, middlewares.requireActivatedUser, function (req, res, next) {

    UserModel.findById(req.session.user._id, (err, user) => {
        res.render('deposit', { user: user })
    })
});


router.get('/approve/:id', middlewares.requireAdminAuthentication, function (req, res, next) {

    TransactionModel.findById(req.params.id, (err, transaction) => {
        if (err) {

        } else {


            switch (transaction.type) {
                case 1:

                    //update sender
                    UserModel.findById(transaction.senderId, (err, sender) => {
                        //check enough money to apply transaction
                        if (sender.balance < (transaction.amount + parseFloat(transaction.fee))) {
                            //if sender don't have enough money to approve the transaction
                            answer = {
                                type: 'danger',
                                message: "Tài khoản không đủ tiền để thực hiện giao dịch"
                            }
                            res.render('announcement', { answer: answer })

                        }
                        else {

                            //move money from sender to receiver

                            //cut money from sender include fee
                            sender.balance -= transaction.amount + parseFloat(transaction.fee)

                            //find receiver
                            UserModel.findById(transaction.receiverId, (err, receiver) => {
                                //add money to receiver account
                                receiver.balance += transaction.amount


                                //apply transfer to receiver
                                receiver.save((err) => {
                                    if (err) {
                                        answer = {
                                            type: 'danger',
                                            message: "Có lỗi khi chuyển tiền"
                                        }
                                        res.render('announcement', { answer: answer })

                                    }
                                    else {


                                        //after success apply transfer to receiver
                                        //apply transfer to sender
                                        sender.save((err) => {
                                            if (err) {
                                                answer = {
                                                    type: 'danger',
                                                    message: "Có lỗi khi chuyển tiền"
                                                }
                                                res.render('announcement', { answer: answer })
                                            }
                                            else {
                                                //after success apply transfer on both side
                                                //make this transaction status become success

                                                transaction.status = "success"
                                                transaction.save((err) => {
                                                    if (err) {
                                                        answer = {
                                                            type: 'danger',
                                                            message: "Có lỗi khi chuyển tiền"
                                                        }
                                                        res.render('announcement', { answer: answer })
                                                    }
                                                    else {
                                                        res.redirect('/admin')
                                                    }
                                                })

                                            }
                                        })
                                    }
                                })

                            })
                        }
                    })



                    break;
                case 2:
                    UserModel.findById(transaction.senderId, (err, user) => {
                        if (err) {

                        } else {
                            if (sender.balance > (transaction.amount + transaction.fee)) {
                                //make transaction success
                                transaction.status = "success"
                                transaction.save((err) => {
                                    if (err) {

                                    } else {
                                        //cut money from user
                                        user.balance -= transaction.amount + transaction.fee
                                        user.save((err) => {
                                            if (err) {

                                            } else {
                                                //message
                                                res.redirect('/admin')
                                            }
                                        })
                                    }
                                })
                            } else {
                                //if sender don't have enough money to approve the transaction
                                answer = {
                                    type: 'danger',
                                    message: "Tài khoản không đủ tiền để thực hiện giao dịch"
                                }
                                res.render('announcement', { answer: answer })

                            }


                        }
                    })


                    break;
                default:
                    break;
            }
        }
    })
});

router.post('/deposit', middlewares.requireAuthentication, middlewares.requireActivatedUser, function (req, res, next) {
    //check if user is activated before continue deposit

    console.log(req.body);
    if (req.body.cardNumber = "111111" && req.body.cvv == "411" && req.body.outDate == "2022-10-10") {
        if (req.body.amount > 0) {
            UserModel.findByIdAndUpdate(req.session.user._id, { balance: parseInt(req.session.user.balance) + parseInt(req.body.amount) }, (err, user) => {
                if (err) {
                    console.log(error);
                }
                else {
                    //nap tien voi the 111111 luon thanh cong
                    req.session.flash = {
                        type: 'success',
                        message: "Nạp thành công " + req.body.amount + " vnd"
                    }

                    TransactionModel.create({
                        type: 0,
                        action: "Nạp tiền",
                        amount: req.body.amount,
                        balance: parseInt(req.session.user.balance) + parseInt(req.body.amount),
                        time: Date.now(),
                        status: "success"
                    }, (err, transaction) => {
                        user.transactions.push(transaction._id)
                        user.save((err) => {
                            console.log(err);
                            util.sendEmail({
                                subject: "Nạp tiền thành công ",
                                html: "<h4>Nạp tiền thành công</h4> " + req.body.amount,
                                to: user.email,
                                from: "team2fluttertdt@gmail.com"
                            });
                            res.redirect("/")
                        })
                    })



                }
            })


        }
        else {
            answer = {
                type: 'danger',
                message: "Số tiền không hợp lệ"
            }
            res.render('deposit', { answer: answer })
        }


    }
    else if (req.body.cardNumber = "222222" && req.body.cvv == "443" && req.body.outDate == "2022-11-11") {
        if (req.body.amount > 1000000) {
            answer = {
                type: 'danger',
                message: "Nạp tối đa 1 triệu"
            }
            console.log("qua so tien");
            res.render('deposit', { answer: answer })
        } else if (req.body.amount < 0) {
            answer = {
                type: 'danger',
                message: "Số tiền không hợp lệ"
            }
            res.render('deposit', { answer: answer })

        }
        else {

            UserModel.findByIdAndUpdate(req.session.user._id, { balance: parseInt(req.session.user.balance) + parseInt(req.body.amount) }, (err, user) => {
                if (err) {
                    console.log(error);
                }
                else {
                    //type 0 nap tien, type 1 chuyen tien, 2 nap tien dien thoai
                    TransactionModel.create({
                        type: 0,
                        action: "Nạp tiền",
                        amount: req.body.amount,
                        balance: parseInt(req.session.user.balance) + parseInt(req.body.amount),
                        time: Date.now(),
                        status: "success"
                    }, (err, transaction) => {
                        user.transactions.push(transaction._id)
                        user.save((err) => {
                            console.log(err);
                            util.sendEmail({
                                subject: "Nạp tiền thành công ",
                                html: "<h4>Nạp tiền thành công</h4> " + req.body.amount,
                                to: user.email,
                                from: "team2fluttertdt@gmail.com"
                            });
                            req.session.flash = {
                                type: 'success',
                                message: "Nạp thành công " + req.body.amount + " vnd"
                            }
                            res.redirect("/")
                        })
                    })

                }
            })

        }


    } else if (req.body.cardNumber = "333333" && req.body.cvv == "577" && req.body.outDate == "2022-12-12") {
        answer = {
            type: 'danger',
            message: "Thẻ hết tiền"
        }
        res.render('deposit', { answer: answer })
    }
    else {
        answer = {
            type: 'danger',
            message: "Thông tin thẻ không hợp lệ"
        }
        res.render('deposit', { answer: answer })

    }

});

//chuyển tiền
router.get('/transfer', middlewares.requireAuthentication, middlewares.requireActivatedUser, (req, res, next) => {
    UserModel.findById(req.session.user._id, (err, user) => {
        res.render('transfer', { user: user })
    })
})


router.post('/transfer', middlewares.requireAuthentication, middlewares.requireActivatedUser, (req, res, next) => {
    console.log(req.body);
    UserModel.findById(req.session.user._id, (err, sender) => {


        if (parseInt(sender.balance) >= parseInt(req.body.amount)
            && parseInt(req.body.amount) > 0 && parseInt(req.body.amount) % 50000 == 0) {
            if (req.body.amount >= 5000000) {
                UserModel.findOne({ phone: req.body.phone }, (err, receiver) => {
                    if (err) {
                        console.log(err);
                    }
                    else {


                        TransactionModel.create({
                            type: 1,
                            action: "Chuyển tiền",
                            amount: req.body.amount,
                            balance: sender.balance,
                            time: Date.now(),
                            status: "waiting",
                            senderId: sender._id,
                            receiverId: receiver._id,
                            text: req.body.text,
                            fee: parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 0.05 : 0)

                        }, (err, transaction) => {
                            sender.transactions.push(transaction._id)
                            sender.save((err) => {
                                console.log(err);
                                util.sendEmail({
                                    subject: "Gửi yêu cầu chuyển tiền thành công ",
                                    html: "<h4>Gửi yêu cầu chuyển tiền thành công</h4> " + req.body.amount + " tới tài khoản " + receiver.phone + " Họ tên: " + receiver.fullname,
                                    to: sender.email,
                                    from: "team2fluttertdt@gmail.com"
                                });
                                req.session.flash = {
                                    type: 'success',
                                    message: "Gửi yêu cầu chuyển tiền thành công " + req.body.amount + " vnd"
                                }
                                res.redirect("/")
                            })
                        })
                        // transaction = {
                        //     type: 0,
                        //     action: "Chuyển tiền",
                        //     amount: req.body.amount,
                        //     balance: sender.balance,
                        //     time: Date.now(),
                        //     status: "waiting",
                        //     text: req.body.text,
                        //     fee: parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 0.05 : 0)

                        // }
                        // console.log(transaction);
                        // sender.transactions.push(transaction)
                        // sender.save((err) => {
                        //     if (err) {
                        //         console.log(err);
                        //     } else {
                        //         req.session.flash = {
                        //             type: 'success',
                        //             message: "Gửi yêu cầu chuyển tiền " + req.body.amount + " vnđ tới " + receiver.fullname
                        //         }
                        //         util.getUserInstance(req.session.user._id, (user) => { req.session.user = user; res.redirect("/wallet/history") })
                        //     }
                        // })

                    }
                })

            } else {
                UserModel.findOne({ phone: req.body.phone }, (err, receiver) => {
                    if (err) {
                        console.log(err);
                    } else {
                        receiver.balance = parseInt(receiver.balance) + parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 1 : 0.95)

                        TransactionModel.create({
                            type: 0,
                            action: "Nhận tiền",
                            amount: parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 1 : 0.95),
                            balance: receiver.balance,
                            time: Date.now(),
                            status: "success",
                            text: req.body.text
                        }, (err, transaction) => {
                            receiver.transactions.push(transaction._id)
                            receiver.save((err) => {
                                console.log(err);
                                util.sendEmail({
                                    subject: "Nhận chuyển tiền thành công ",
                                    html: "<h4>Nhận chuyển tiền thành công</h4> " + req.body.amount + "vnđ từ tài khoản " + sender.phone + " Họ tên: " + sender.fullname,
                                    to: receiver.email,
                                    from: "team2fluttertdt@gmail.com"
                                });
                                req.session.flash = {
                                    type: 'success',
                                    message: "Nạp thành công " + req.body.amount + " vnd"
                                }


                                sender.balance = parseInt(sender.balance) - parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 1.05 : 1)
                                TransactionModel.create({
                                    type: 1,
                                    action: "Chuyển tiền",
                                    amount: req.body.amount,
                                    balance: sender.balance,
                                    time: Date.now(),
                                    status: "success",
                                    text: req.body.text,
                                    fee: parseInt(req.body.amount) * (req.body.receiverPayFee == null ? 0.05 : 0)

                                }, (err, transaction) => {
                                    sender.transactions.push(transaction._id)
                                    sender.save((err) => {
                                        util.sendEmail({
                                            subject: "chuyển tiền thành công ",
                                            html: "<h4>chuyển tiền thành công</h4> " + req.body.amount + " tới tài khoản " + receiver.phone + " Họ tên: " + receiver.fullname,
                                            to: sender.email,
                                            from: "team2fluttertdt@gmail.com"
                                        });
                                        console.log(err);
                                        req.session.flash = {
                                            type: 'success',
                                            message: "Chuyển thành công " + req.body.amount + " vnd"
                                        }
                                        res.redirect("/")
                                    })
                                })


                            })
                        })

                    }
                })

            }


        }
        else {
            answer = {
                type: 'danger',
                message: "Xảy ra lỗi"
            }
            res.render('transfer', { answer: answer })
        }

    })

})



//rút tiền
router.get('/withdraw', middlewares.requireAuthentication, middlewares.requireActivatedUser, (req, res, next) => {
    UserModel.findById(req.session.user._id, (err, user) => {
        res.render('withdraw', { user: user })
    })
})
router.post('/withdraw', middlewares.requireAuthentication, middlewares.requireActivatedUser, (req, res, next) => {
    if (req.body.cardNumber = "111111" && req.body.cvv == "411" && req.body.outDate == "2022-10-10") {
        if (req.body.amount >= 50000 && req.body.amount < 5000000 && req.body.amount % 50000 == 0) {
            UserModel.findByIdAndUpdate(req.session.user._id, { balance: parseInt(req.session.user.balance) - parseInt(req.body.amount) * 1.05 }, (err, user) => {
                if (err) {
                    console.log(error);
                }
                else {
                    //nap tien voi the 111111 luon thanh cong
                    req.session.flash = {
                        type: 'success',
                        message: "Rút thành công " + req.body.amount + " vnđ"
                    }

                    TransactionModel.create({
                        type: 2,
                        action: "Rút tiền",
                        amount: req.body.amount,
                        balance: parseInt(user.balance) - parseInt(req.body.amount) * 1.05,
                        time: Date.now(),
                        status: "success",
                        fee: parseInt(req.body.amount) * 0.05
                    }, (err, transaction) => {
                        user.transactions.push(transaction._id)
                        user.save((err) => {
                            console.log(err);
                            util.sendEmail({
                                subject: "Rút tiền thành công ",
                                html: "<h4>Rút tiền thành công</h4> " + req.body.amount + "vnđ tới thẻ " + " 111111",
                                to: user.email,
                                from: "team2fluttertdt@gmail.com"
                            });
                            req.session.flash = {
                                type: 'success',
                                message: "Rút thành công " + req.body.amount + " vnd"
                            }
                            res.redirect("/")
                        })
                    })

                }
            })


        }
        else if (req.body.amount >= 5000000 && req.body.amount % 50000 == 0) {

            UserModel.findById(req.session.user._id, (err, user) => {
                if (err) {
                    console.log(error);
                }
                else {
                    //refresh user balance data

                    TransactionModel.create({
                        type: 2,
                        action: "Rút tiền",
                        amount: req.body.amount,
                        time: Date.now(),
                        status: "waiting",
                        senderId: user._id,
                        fee: parseInt(req.body.amount) * 0.05
                    }, (err, transaction) => {
                        user.transactions.push(transaction._id)
                        user.save((err) => {
                            console.log(err);
                            util.sendEmail({
                                subject: "Gửi yêu cầu rút tiền thành công ",
                                html: "<h4>Gửi yêu cầu rút rút tiền thành công</h4> " + req.body.amount + "vnđ tới thẻ 111111 ",
                                to: user.email,
                                from: "team2fluttertdt@gmail.com"
                            });
                            req.session.flash = {
                                type: 'success',
                                message: "Gửi yêu cầu rút tiền thành công " + req.body.amount + " vnd"
                            }
                            res.redirect("/")
                        })
                    })


                }
            })




        }
        else {
            answer = {
                type: 'danger',
                message: "Số tiền không hợp lệ"
            }
            res.render('withdraw', { answer: answer })
        }


    }
    else {
        answer = {
            type: 'danger',
            message: "Thông tin thẻ không hợp lệ"
        }
        res.render('withdraw', { answer: answer })
    }

})


//nạp điện thoại
router.get('/phoneCard', middlewares.requireAuthentication, middlewares.requireActivatedUser, (req, res, next) => {

    UserModel.findById(req.session.user._id, (err, user) => {
        res.render('phoneCard', { user: user })
    })
})


//nạp điện thoại
router.post('/phoneCard', middlewares.requireAuthentication, middlewares.requireActivatedUser, middlewares.verifyPhoneCardValueInput, (req, res, next) => {

    phone_card_fee = 0

    UserModel.findById(req.session.user._id, (err, user) => {
        if (user.balance >= req.body.amount) {
            switch (req.body.provider) {
                case "viettel":
                    cardNumber = "11111" + util.randomFromString("0123456789", 5)
                    break;
                case "mobifone":
                    cardNumber = "22222" + util.randomFromString("0123456789", 5)
                    break;
                case "vinaphone":
                    cardNumber = "33333" + util.randomFromString("0123456789", 5)
                    break;

                default:

                    break;
            }
            //
            TransactionModel.create({
                type: 3,
                action: "Mua thẻ điện thoại",
                amount: req.body.amount,
                time: Date.now(),
                status: "success",
                fee: phone_card_fee == 0 ? "0" : parseInt(req.body.amount) * phone_card_fee,
                text: "Thẻ " + req.body.provider + " Mã thẻ: " + cardNumber


            }, (err, transaction) => {
                util.sendEmail({
                    subject: "Mua thẻ cào thành công ",
                    html: "<h4>Mua thẻ cào thành công</h4>   " + "Thẻ " + req.body.provider + " Mã thẻ: " + cardNumber,
                    to: user.email,
                    from: "team2fluttertdt@gmail.com"
                });
                user.transactions.push(transaction._id)
                user.save((err) => {
                    console.log(err);

                    res.redirect("/")
                })
            })

            //

        }
        else {
            answer = {
                type: 'danger',
                message: "Tài khoản không đủ số dư"
            }
            res.render('phoneCard', { answer: answer })
        }

    })
})


//lịch sử giao dịch
router.get('/history', middlewares.requireAuthentication, (req, res, next) => {
    // user = req.session.user
    // user.transactions.forEach(transaction => {
    //     transaction.time = new Date(transaction.time * 1000).toISOString
    // });
    UserModel.findById(req.session.user._id).populate('transactions', null, {
        sort: {
            time: 1
        }
    }).exec((err, user) => {

        res.render("history", { user: user })
    })

})



module.exports = router;