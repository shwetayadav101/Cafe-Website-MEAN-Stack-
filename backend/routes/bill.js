const express = require('express');
const connection = require('../connection');
let ejs = require('ejs');
const router = express.Router();
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res, next) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
   
    var productDetailsReport = JSON.parse(orderDetails.productDetails);


    var query = "insert into bill (name ,uuid,email, contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?) ";
    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, 
        orderDetails.paymentMethod, orderDetails.total, orderDetails.productDetails, res.locals.email], (err, results) => {
        if (!err) {
                    ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                     productDetails: productDetailsReport, name: orderDetails.name,
                     email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod,
                     totalAmount:orderDetails.totalAmount},
            (err, results)=>{
                if (err) {
                    console.log(err)
                    return res.status(500).json(err);
                }
                else {
                    pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
                        if (err) {
                            console.log(err);
                            return res.status(500).json(err);
                        }
                        else {
                            return res.status(200).json({ uuid: generatedUuid })
                        }
                    })
                }
            });
        }
        else {
            return res.status(500).json(err);
        }
    })
})


router.post('/getbill',(req,res,next)=>{
    const orderDetails=req.body;
    const pdfPath = './generated_Pdf/'+ orderDetails.uuid+'.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }
    else{
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
            productDetails: productDetailsReport, name: orderDetails.name,
            email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod,
            totalAmount:orderDetails.totalAmount},
   (err, results)=>{
       if (err) {
           console.log(err)
           return res.status(500).json(err);
       }
       else {
           pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
               if (err) {
                   console.log(err);
                   return res.status(500).json(err);
               }
               else {
                res.contentType("application/pdf");
                fs.createReadStream(pdfPath).pipe(res);
                   
               }
           })
       }
   });

    }

})

router.get('/getAllbills',auth.authenticateToken,(req,res,next)=>{
    var query= "select *from bill order by id DESC";
    connection.query(query,(err,results)=>{
        if(!err){
            res.status(200).json(results);

        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.delete('/delete/:id',auth.authenticateToken,(req,res,next)=>{
    const id= req.params.id;
    var query="delete from bill where id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({Message:"bill not found"});
            }
            else{
                return res.status(200).json({Message:"Bill deleted Successfully"})
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;