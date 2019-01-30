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
var genData = { 'index': 0, 'timeStamp': genDate, 'BPM': 0 };
var genCipherText = CryptoJS.AES.encrypt(JSON.stringify(genData),'secret key 123');
var b = new Block(genData,"",genCipherText.toString());
BlockChain[0] = b;

function createBlock(index,data){
    var date = new Date;
    var x = {'index':index,'timeStamp':date,'BPM':data};
    var cipherText = CryptoJS.AES.encrypt(JSON.stringify(x), 'secret key 123');
    var b = new Block(x,BlockChain[index-1].currHash,cipherText.toString());
    BlockChain[index] = b;
    console.log(BlockChain[index]);
    count++;
}

function decryptBlock(index){
    console.log("Decrypted:");
    var bytes = CryptoJS.AES.decrypt(BlockChain[index].cipherText, 'secret key 123')
    var plaintext = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log(plaintext);
}


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
app.post('/createPatientBlock', function (req, res, err) {
    var encryptedText = crypto.encrypt(JSON.stringify(req.body));
    // console.log("\nENCRYPTED TEXT: " + encryptedText);
    
    var b = new Block(req.body, BlockChain[count-1].currHash, encryptedText);
    BlockChain[count] = b;

    var sql = "INSERT INTO user(id, user_type, cipher_text, previous_hash, current_hash) VALUES ( " + count + ", '" +  (req.body.userType).toUpperCase() + "', '" + encryptedText + "', '" + b.prevHash + "', '" + b.currHash + "' );";

    // console.log("\nINSERT QUERY: " + sql);
    con.query(sql);

    res.setHeader('Content-Type', 'application/json');
    res.send({
        id: count
    });
    res.end();
    
    count++;
});

app.post('/displayPatientInfo', function(request, response, error) {
    var sql = "SELECT cipher_text FROM user WHERE id = " + request.body.id; 

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

app.post('/getMyRequests', function(request, response, error) {
    var sql = "SELECT doctor_id FROM permission WHERE patient_id = " + request.body.id;

    con.query(sql, function(err, res) {
        if(err)
            console.error(err);

        response.setHeader('Content-Type', 'application/json');
        response.send(res);
        response.end();
    });
});


// Doctor Routes
app.post('/searchForPatient', function (request, response, error) {
    var sql = "SELECT id FROM user WHERE id = " + request.body.patientId + " AND user_type = 'PATIENT';";

    con.query(sql, function (err, res) {
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

            var sql1 = "INSERT INTO permission VALUES ( " + request.body.patientId + ", " + request.body.doctorId + " );";

            con.query(sql1);
        }
        response.end();
    });
});


// Server Setup
app.listen(3000, function() {
    console.log('Server listening at port 3000...');
});