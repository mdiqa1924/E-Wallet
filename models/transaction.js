var mongoose = require('mongoose');
var transactionSchema = mongoose.Schema({
    type: Number,
    action: String,
    amount: Number,
    senderId: String,
    receiverId: String,
    time: Number,
    status: String,
    fee: String,
    text: String
})
var transaction = mongoose.model('Transaction', transactionSchema);
module.exports = transaction;
