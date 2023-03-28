// số điện thoại, email, họ và tên, 
//ngày tháng năm sinh, địa chỉ, 
//upload ảnh mặt trước và mặt sau của chứng minh nhân dân. 

//Mỗi user phải có một địa chỉ email khác nhau và một số điện thoại khác nhau.
// Sau khi đăng ký thành công, user sẽ được tạo username và password ngẫu nhiên,
// trong đó username là một dãy gồm 10 chữ số từ 0-9, 
//còn password là chuỗi bất kỳ gồm
//6 ký tự.
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    dateCreated: Number,
    IdPhotoUpdateTime: Number,
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    lastLock: Number,
    wrongLogin: Number,
    balance: Number,
    status: Number,
    frontIdPhoto: {
        data: Buffer,
        contentType: String
    },
    backIdPhoto: {
        data: Buffer,
        contentType: String
    },
    isNewUser: Boolean,
    birthday: String,
    address: String,
    email: String,
    phone: String,
    username: String,
    password: String,
    fullname: String,
    idCardImageFrontPath: String,
    idCardImageBackPath: String,
})
var user = mongoose.model('User', userSchema);
module.exports = user;
