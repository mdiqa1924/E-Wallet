
var mongoose = require('mongoose');
const credentials = require('./credentials');
mongoose.connect(credentials.mongo.development.connectionString);
var UserModel = require('./models/user');



//erase all document if it exist
UserModel.deleteMany({}, (err, result) => {
    if (err) {
        console.log("an error happen when try to delete admin in mongodb initing");
    }
    else {
        if (result) {
            console.log("delete old user database success");
        }
    }
})







// add admin account
UserModel.create({
    username: "admin",
    password: "123456"
}, (err, user) => {
    if (err) {
        console.log("An error happen when trying to add admin account in mongodb initing");
    }
    else {
        if (user) {
            console.log("Add admin account successfully");
            process.exit()
        }
    }
})


// UserModel.findOneAndDelete({ username: "admin" }, (err, user) => {
//     if (err) {
//         console.log("an error happen when try to delete admin in mongodb initing");
//     }
//     else {
//         if (user) {
//           console.log("delete success full");      
//         }
//     }
// })

