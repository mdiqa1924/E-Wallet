var express = require('express');
var router = express.Router();
var middlewares = require("../lib/middlewares");
var util = require("../lib/util");
var UserModel = require('../models/user');
var TransactionModel = require('../models/transaction');
const transaction = require('../models/transaction');





router.get('/', middlewares.requireAdminAuthentication, function (req, res, next) {
    UserModel.find({}, null, {
        sort: {
            IdPhotoUpdateTime: -1, dateCreated: -1,
        }
    }, (err, users) => {
        waitForActiveUsers = []
        activeUsers = []
        deactiveUsers = []
        lockedUsers = []

        approveList = []

        users.forEach(user => {
            if (user.lastLock != 0 && user.wrongLogin >= 3) {
                lockedUsers.push(user)
            }
            else if (user.status == 0) {
                waitForActiveUsers.push(user)
            }
            else if (user.status == 1) {
                activeUsers.push(user)
            }
            else if (user.status = 3) {
                deactiveUsers.push(user)
            }

        });

        TransactionModel.find({}, (err, transactions) => {
            if (err) {

            } else {
                transactions.forEach(transaction => {
                    if (transaction.status == "waiting") {
                        approveList.push(transaction)
                    }
                });


                res.render('adminHome', { admin: true, activeUsers: activeUsers ? activeUsers : null, waitForActiveUsers: waitForActiveUsers, deactiveUsers: deactiveUsers, lockedUsers: lockedUsers, approveList: approveList })
            }
        })


    });
})



router.get('/transaction/:id', (req, res) => {
    TransactionModel.findById(req.params.id, (err, transaction) => {
        //get sender
        UserModel.findById(transaction.senderId, (err, sender) => {
            if (transaction.receiverId) {
                UserModel.findById(transaction.receiverId, (err, receiver) => {
                    res.render('detailTransaction', { admin: true, sender: sender, transaction: transaction, receiver: receiver })

                })
            }
            else {
                res.render('detailTransaction', { admin: true, sender: sender, transaction: transaction })
            }
        })
    })

})









module.exports = router;