const jsSHA = require('jssha');
const CryptoJS = require("crypto-js");
const Crypto = require('simple-crypto-js').default;
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mysql = require('mysql');
const serialize = require('node-serialize');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


// Crypto instance created 
const crypto = new Crypto("secret key");


// MySQL Connection Created
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abcd1234",
    database: "agathsya"
});
  
con.connect(function(err) {
    if (err) 
        throw err;
}); 


var count = 1;
function calcHash(x) {
    var message = x.firstName + x.lastName + x.userType + x.email + x.date + x.gender + x.mobile;
    var sha256 = new jsSHA('SHA-256', 'TEXT');
    sha256.update(message);
    var hash = sha256.getHash("HEX");
    return hash;    
}

//Block class created here
class Block{
    constructor(x,prevHash,cipherText){
        this.prevHash=prevHash;
        this.currHash=calcHash(x);
        this.cipherText=cipherText;
    }    
}

//Genesis Block Created 
var BlockChain = new Array(100);

var genDate = new Date();
var genData = { 
                'index': 0, 
                'timeStamp': genDate, 
                'BPM': 0 
            };

var genCipherText = CryptoJS.AES.encrypt(JSON.stringify(genData), 'secret key 123');
var b = new Block(genData, "", genCipherText.toString());

BlockChain[0] = b;


// Login Route
app.post('/login',function(request, response, error) {
    var sql = "SELECT id, cipher_text FROM user WHERE id = " + request.body.username;

    con.query(sql, function(req, res, err) {
        if (err)
            console.error(err); 

        decryptedText = JSON.parse(crypto.decrypt(res[0]['cipher_text']));

        response.setHeader('Content-Type', 'application/json');        
        if (decryptedText.password === request.body.password) {
            let resData = {
                id: res[0]['id'],
                userType: decryptedText.userType
            }

            response.send(resData);
        }

        else {
            response.send({
                error: "Wrong Password!"
            });
        }
        response.end(); 
    }) 
});


//  Patient Routes
app.post('/createPatientBlock', function (request, response, error) {
    var encryptedText = crypto.encrypt(JSON.stringify(request.body));
    // console.log("\nENCRYPTED TEXT: " + encryptedText);
    
    var b = new Block(request.body, BlockChain[count-1].currHash, encryptedText);
    BlockChain[count] = b;


    // Retrieve maximum ID from the database table
    var getMaxId = "SELECT MAX(id) AS id FROM user;";

    con.query(getMaxId, function(req, res, err) {
        let userId;

        if(res[0].id === null)
            userId = 2019011;
        else 
            userId = res[0].id + 1;
             
        console.log(userId);        

        response.setHeader('Content-Type', 'application/json');
        response.send({
            id: userId
        });
        response.end();


        // Insert patient's details once ID has been established
        var createPatient = "INSERT INTO user(id, user_type, cipher_text, previous_hash, current_hash) VALUES ( " + userId + ", '" +  (request.body.userType).toUpperCase() + "', '" + encryptedText + "', '" + b.prevHash + "', '" + b.currHash + "' );";

        con.query(createPatient); 
    });
        
    count++; 
});

app.post('/displayPatientInfo', function(request, response, error) {
    var sql = "SELECT id, cipher_text FROM user WHERE id = " + request.body.id; 

    con.query(sql, function(err, res) { 
        if(err)
            console.error(err); 

        var decryptedText = crypto.decrypt(res[0]['cipher_text']);
        // console.log("\nDECRYPTED INFO: " + decryptedText);

        response.setHeader('Content-Type', 'application/json');
        response.send(decryptedText);
        response.end();
    });
});

app.post('/getPatientRequests', function(request, response, error) {
    var sql = "SELECT doctor_id FROM permission WHERE patient_id = " + request.body.id;

    con.query(sql, function(err, res) {
        if(err)
            console.error(err);

        response.setHeader('Content-Type', 'application/json');
        response.send(res);
        response.end();
    });
});

app.post('/resolveRequest', function(request, response, error) {
    if(request.body.access === true) {
        con.query("INSERT INTO resolved_permission VALUES ( " + request.body.doctorId + ", " + request.body.patientId + ", 'YES' );");
        
        var removeRequest = "DELETE FROM permission WHERE patient_id = " + request.body.patientId + " AND doctor_id = " + request.body.doctorId;
        con.query(removeRequest);

        response.send("Peace");
    }

    else if(request.body.access === false) {
        con.query("INSERT INTO resolved_permission VALUES ( " + request.body.doctorId + ", " + request.body.patientId + ", 'NO' );");
        
        var removeRequest = "DELETE FROM permission WHERE patient_id = " + request.body.patientId + " AND doctor_id = " + request.body.doctorId;
        con.query(removeRequest);

        response.send("Not Peace");
    }
});


// Doctor Routes
app.post('/searchForPatient', function (request, response, error) {
    var checkIfUserIsPresent = "SELECT id FROM user WHERE id = " + request.body.patientId + " AND user_type = 'PATIENT';";

    con.query(checkIfUserIsPresent, function(err, res) {
        if(err)
            console.error(err); 

        response.setHeader('Content-Type', 'application/json');
        if(res.length === 0) {
            response.send({
                message: "Patient with entered ID does not exist. Try again."
            });
        }
        else {
            response.send({
                message: "Request has been sent to Patient with ID " + request.body.patientId
            });

            var setPermissionRequest = "INSERT INTO permission VALUES ( " + request.body.patientId + ", " + request.body.doctorId + " );";

            con.query(setPermissionRequest);
        }
        response.end();
    });
});

app.post('/getDoctorRequests', function(request, response, error) {
    let output = {};

    var sql1 = "SELECT patient_id AS patientId, access FROM resolved_permission WHERE doctor_id = " + request.body.id;

    con.query(sql1, function(err, res) {
        if(err)
            console.error(err); 

        output['resolvedPermissions'] = res;

        var sql2 = "SELECT patient_id AS patientId FROM permission WHERE doctor_id = " + request.body.id;

        con.query(sql2, function(err, res) {
            if(err)
                console.error(err);

            output['pendingPermissions'] = res; 

            response.setHeader('Content-Type', 'application/json');
            response.send(output);
            response.end();
        });
    });
});


// Server Setup
app.listen(3000, function() {
    console.log('Server listening at port 3000...');
});