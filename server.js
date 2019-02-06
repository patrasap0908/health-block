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


// Functions 
var count = 1;
function calcHash(x) {
    var message = x.firstName + x.lastName + x.userType + x.email + x.date + x.gender + x.mobile;
    var sha256 = new jsSHA('SHA-256', 'TEXT');
    sha256.update(message);
    var hash = sha256.getHash("HEX");
    return hash;    
}

function getMaxId() {
    var u, getMaxIdDoctor, getMaxIdPatient;

    getMaxIdPatient = "SELECT MAX(id) AS patientMax FROM patient;";
    getMaxIdDoctor = "SELECT MAX(id) AS doctorMax FROM doctor;";

    con.query(getMaxIdPatient, function(err, res) {
        patientMax = res[0]["patientMax"];

        con.query(getMaxIdDoctor, function(err, res) {
            doctorMax = res[0]["doctorMax"]; 

            if(patientMax === null && doctorMax === null)
                u = 2019021;
            else if(patientMax === null)
                u = doctorMax + 1;
            else if(doctorMax === null)
                u = patientMax + 1;
            else
                u = (patientMax > doctorMax) ? (patientMax + 1) : (doctorMax + 1);
            
            console.log(u);
            return u;
        });
    });
}


//Block class created here
class Block {
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


// Login and Registration Routes
app.post('/login',function(request, response, error) {
    var sql, logQuery, user = request.body;

    if(user.userType === "Patient") {
        sql = "SELECT id, username, password FROM patient WHERE username = '" + user.username + "';";

        con.query(sql, function(err, res) {
            if(res[0]["username"] === user.username && crypto.decrypt(res[0]["password"]) === user.password) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    id: res[0].id
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + user.username + "' logged into his/her account.\")";
                con.query(logQuery);
            }
            else {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            }
        });
    }
    
    else if(user.userType === "Doctor") {
        sql = "SELECT id, username, password FROM doctor WHERE username = '" + user.username + "';";

        con.query(sql, function(err, res) {
            if(res[0]["username"] === user.username && crypto.decrypt(res[0]["password"]) === user.password) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    id: res[0].id
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.username + "' logged into his/her account.\")";
                con.query(logQuery);
            }
            else {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            }
        });
    }

    else if(user.userType === "Hospital") {
        sql = "SELECT id, username, password FROM hospital WHERE username = '" + user.username + "';";

        con.query(sql, function(err, res) {
            if(res[0].username === user.username && res[0].password == user.password) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    id: res[0].id
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Hospital with Username '" + user.username + "' logged into his/her account.\")";
                con.query(logQuery);
            } 
            else {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Hospital with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            } 
        });
    }
});

app.post('/createUser', function (request, response, error) {
    var encryptedText = crypto.encrypt(JSON.stringify(request.body));
    
    var b = new Block(request.body, BlockChain[count-1].currHash, encryptedText);
    BlockChain[count] = b;

    // Create a new user record in the appropriate database table
    var user, userId, getMaxIdPatient, getMaxIdDoctor, patientMax, doctorMax;
    user = request.body;

    if(user.userType === "Patient") {
        getMaxIdPatient = "SELECT MAX(id) AS patientMax FROM patient;";
        getMaxIdDoctor = "SELECT MAX(id) AS doctorMax FROM doctor;";

        con.query(getMaxIdPatient, function(err, res) {
            patientMax = res[0]["patientMax"];

            con.query(getMaxIdDoctor, function(err, res) {
                doctorMax = res[0]["doctorMax"]; 

                if(patientMax === null && doctorMax === null)
                    userId = 2019021;
                else if(patientMax === null)
                    userId = doctorMax + 1;
                else if(doctorMax === null)
                    userId = patientMax + 1;
                else
                    userId = (patientMax > doctorMax) ? (patientMax + 1) : (doctorMax + 1);
                
                var createPatient = "INSERT INTO patient VALUES ( " + 
                                                                userId + ", '" + 
                                                                crypto.encrypt(user.firstName) + "', '" + 
                                                                crypto.encrypt(user.lastName) + "', '" + 
                                                                user.userName + "', '" + 
                                                                crypto.encrypt(user.userType) + "', '" + 
                                                                crypto.encrypt(user.email) + "', '" + 
                                                                crypto.encrypt(user.password) + "', '" + 
                                                                user.dob + "', '" + 
                                                                crypto.encrypt(user.gender) + "', '" + 
                                                                crypto.encrypt(user.mobile) + "', 2019011 );";

                // console.log("\nPatient Query: " + createPatient);
                con.query(createPatient, function(err, res) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        id: userId,
                        userType: user.userType
                    });
                    response.end();

                    console.log(user.userName);
                    logQuery = "INSERT INTO log VALUES (NOW(), \"New Patient with Username '" + user.userName + "' successfully registered with the application.\")";
                    con.query(logQuery);
                });
            });       

        }); 
    }

    else if(user.userType === "Doctor") {
        getMaxIdPatient = "SELECT MAX(id) AS patientMax FROM patient;";
        getMaxIdDoctor = "SELECT MAX(id) AS doctorMax FROM doctor;";

        con.query(getMaxIdPatient, function(err, res) {
            patientMax = res[0]["patientMax"];

            con.query(getMaxIdDoctor, function(err, res) {
                doctorMax = res[0]["doctorMax"]; 

                if(patientMax === null && doctorMax === null)
                    userId = 2019021;
                else if(patientMax === null)
                    userId = doctorMax + 1;
                else if(doctorMax === null)
                    userId = patientMax + 1;
                else
                    userId = (patientMax > doctorMax) ? (patientMax + 1) : (doctorMax + 1);
        
                var createDoctor = "INSERT INTO doctor VALUES ( " + 
                                                            userId + ", '" + 
                                                            crypto.encrypt(user.firstName) + "', '" + 
                                                            crypto.encrypt(user.lastName) + "', '" + 
                                                            user.userName + "', '" + 
                                                            crypto.encrypt(user.userType) + "', '" + 
                                                            crypto.encrypt(user.email) + "', '" + 
                                                            crypto.encrypt(user.password) + "', '" + 
                                                            user.dob + "', '" + 
                                                            crypto.encrypt(user.gender) + "', '" + 
                                                            crypto.encrypt(user.mobile) + "', 2019011 );";
    
                // console.log("\nDoctor Query: " + createDoctor);
                con.query(createDoctor, function(err, res) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        id: userId,
                        userType: user.userType,
                        hospitalId: "2019011"
                    });
                    response.end();

                    logQuery = "INSERT INTO log VALUES (NOW(), \"New Doctor with Username '" + user.userName + "' successfully registered with the application.\")";
                    con.query(logQuery);
                }); 
            });
        });
    }
        
    count++; 
});


//  Patient Routes
app.post('/displayInfo', function(request, response, error) {
    var output;
    var user = request.body;

    if(user.userType === "Patient") {
        var getPatientInfo = "SELECT * FROM patient WHERE id = " + user.id;

        con.query(getPatientInfo, function(err, res) {
            output = {
                id: res[0].id,
                firstName: crypto.decrypt(res[0].first_name),
                lastName: crypto.decrypt(res[0].last_name),
                userName: res[0].username,
                email: crypto.decrypt(res[0].email),
                dob: res[0].dob,
                gender: crypto.decrypt(res[0].gender),
                mobile: crypto.decrypt(res[0].mobile),
            };
            
            response.setHeader('Content-Type', 'application/json');
            response.send(output);
            response.end();
                    
            logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + res[0].username + "' had his/her details viewed.\")";
            con.query(logQuery);
        });
    }

    else if(user.userType === "Doctor") {
        var getDoctorInfo = "SELECT * FROM doctor WHERE id = " + user.id;

        con.query(getDoctorInfo, function(err, res) {
            output = {
                id: user.id,
                firstName: crypto.decrypt(res[0]["first_name"]),
                lastName: crypto.decrypt(res[0]["last_name"]),
                userName: res[0]["username"],
                email: crypto.decrypt(res[0]["email"]),
                dob: res[0]["dob"],
                gender: crypto.decrypt(res[0]["gender"]),
                mobile: crypto.decrypt(res[0]["mobile"]),
            };
            
            response.setHeader('Content-Type', 'application/json');
            response.send(output);
            response.end();
                    
            logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username + '" + res[0].username + "' had his/her details viewed.\")";
            con.query(logQuery);
        });
    }
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
    var checkIfUserIsPresent = "SELECT id FROM patient WHERE id = " + request.body.patientId;

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

    var sql1 = "SELECT patient_id, access FROM resolved_permission WHERE doctor_id = " + request.body.id;

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


// Hospital Routes
app.post("/getPatients", function(request, response, error) {
    var getPatients = "SELECT id, first_name, last_name, username FROM patient WHERE hospital_id = " + request.body.id;

    con.query(getPatients, function(err, res) {
        if(err)
            console.error(err);

        // console.log(res);

        if(res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "No Patients registered with the Hospital with ID = " + request.body.id + "."
            });
            response.end();
        }
        else {
            for(var i = 0; i < res.length; i++) {
                res[i]["firstName"] = crypto.decrypt(res[i]["first_name"]);
                res[i]["lastName"] = crypto.decrypt(res[i]["last_name"]);
            }

            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        }
    });
});


// Miscellaneous
app.post("/getUsername", function(request, response, error) {
    var sql, user = request.body;

    if(user.userType === "Patient") {
        sql = "SELECT username FROM patient WHERE id = " + user.id;

        con.query(sql, function(err, res) {
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
    }

    else if(user.userType === "Doctor") {
        sql = "SELECT username FROM doctor WHERE id = " + user.id;

        con.query(sql, function(err, res) {
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
    }
});


// Server Setup
app.listen(3000, function() {
    console.log('Server listening at port 3000...');
});