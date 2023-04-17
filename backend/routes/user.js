
const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

require('dotenv').config();



router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')"
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Sucessfully Registered" })
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: "Email Already Exist." })
            }
        }
        else {
            return res.status(500).json(err)
        }

    })

});


router.post('/login',(req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect username or password" });
            }
            else if (results[0].status === 'false') {
                return res.status(401).json({ message: "waiting for admin approval" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accessToken });
            }
            else {
                return res.status(400).json({ mesaage: "something went wrong" });
            }
        }
        else {
            return res.status(500).json(err);
        }


    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(200).json({ message: "password sent sucessfully to your email" })
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Cafe Management System',
                    html: '<p><b>Your Login Details for Cafe Management System</b><br><b>Email:</b>' + results[0].email + '<br><b>Password:</b>' + results[0].password + '<br><a href ="http://localhost:4200">Click Here to Login</a></p>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error)
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }

                });
                return res.status(200).json({ message: "password sent sucessfully to your email" })
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
});

router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id,name,email,contactNumber,status from user where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results)
        }
        else {
            return res.status(500).json(err);
        }
    })

})

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(400).json({ message: "user does not exist" });
            }
            else {
                return res.status(200).json({ message: "user updated sucessfully" })
            }

        } else {
            return res.status(500).json(err)
        }

    })

})

router.get('/checkToken', auth.authenticateToken,(req, res) => {
    return res.status(200).json({ message: "true" });
})

router.post('/changePassword',auth.authenticateToken, (req, res) => {

    const user = req.body;
    const email = res.locals.email;
    console.log(email)
    var query = "select *from user where email =? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect Old Password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update user set password=? where email=?";
                connection.query(query, [email, user.newPassword], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password Updated Successfully" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }

    })

})


module.exports = router;