const async = require('hbs/lib/async');
var UserModel = require('../models/user');
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const OAuth2 = google.auth.OAuth2;

//tao email sender function
const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        "465599173496-vlaocmo7ombo58on9jcu5218i0junvt0.apps.googleusercontent.com",
        "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",
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: "1//04mRdm2I9fnemCgYIARAAGAQSNwF-L9IrPU_otrgCFfA4pJ-CiTlfFjGAkyua-hOGhYxdF20nK3vRpcOwkS3agzVHQSbR49WbxI4"
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject("Failed to create access token :(");
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "team2fluttertdt@gmail.com",
            accessToken,
            clientId: "465599173496-vlaocmo7ombo58on9jcu5218i0junvt0.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken: "1//04mRdm2I9fnemCgYIARAAGAQSNwF-L9IrPU_otrgCFfA4pJ-CiTlfFjGAkyua-hOGhYxdF20nK3vRpcOwkS3agzVHQSbR49WbxI4"
        }
    });

    return transporter;
};



module.exports = {
    sendEmail: async (emailOptions) => {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail(emailOptions);
    },
    getUserInstance: function (id, callback) {
        UserModel.findById(id, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                console.log(user);

                callback(user);
            }
        })
    },
    randomFromString: function (characters, length) {
        var result = '';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    },

    getStatusString: function (i) {
        switch (i) {
            case 0:
                return "Chờ xác minh"
                break;
            case 1:
                return "Đã xác minh"
                break;
            case 2:
                return "Chờ cập  nhật"

            case 3:
                return "Vô hiệu hoá"
            default:
                break;
        }
        return "Không xác  định"

    }
}