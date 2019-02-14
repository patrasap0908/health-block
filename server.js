const jsSHA = require('jssha');
const CryptoJS = require("crypto-js");
const Crypto = require('simple-crypto-js').default;
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mysql = require('mysql');
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
    password: "",
    database: "agathsya"
});
  
con.connect(function(err) {
    if (err) 
        throw err;
}); 



// Hash Calculation function
function calcHash(x) {
    var sha256 = new jsSHA('SHA-256', 'TEXT');
    sha256.update(x);
    var hash = sha256.getHash("HEX");
    return hash;    
}



// Login and Registration Routes
app.post('/login',function(request, response, error) {
    var sql, logQuery, user = request.body;
    
    if(user.userType === "Admin") {
        var sql = "SELECT * FROM log ORDER BY time DESC LIMIT 50;";

        con.query(sql, function(err, res) {
            if(err) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Log could not be retieved from database. Try again."
                });
                response.end();
            }

            else {
                response.setHeader('Content-Type', 'application/json');
                response.send(res);
                response.end();
            }
        });
        
        logQuery = "INSERT INTO log VALUES (NOW(), \"Admin logged in to view the Activity Log.\")";
        con.query(logQuery);
    }

    else if(user.userType === "Patient") {
        sql = "SELECT id, username, password FROM patient WHERE username = '" + user.username + "';";

        con.query(sql, function(err, res) {
            if(res.length === 0) {                
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            }

            else if(res[0]["username"] === user.username && crypto.decrypt(res[0]["password"]) === user.password)
            {
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
            if(res.length === 0) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            }

            else if(res[0]["username"] === user.username && crypto.decrypt(res[0]["password"]) === user.password){
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
            if(res.length === 0) {
                response.setHeader('Content-Type', 'application/json');
                response.send({
                    message: "Wrong login credentials."
                });
                response.end();

                logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.username + "' failed to log in due to invalid credentials.\")";
                con.query(logQuery);
            }

            else if(res[0].username === user.username && res[0].password == user.password) {
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

    else {
        response.setHeader('Content-Type', 'application/json');
        response.send({
            message: "Please enter a valid User Type."
        });
        response.end();
    }
});

app.post('/createUser', function (request, response, error) {

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

                con.query(createPatient, function(err, res) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        id: userId,
                        userType: user.userType
                    });
                    response.end();

                    logQuery = "INSERT INTO log VALUES (NOW(), \"New Patient with Username '" + user.userName + "' successfully registered with the application.\")";
                    con.query(logQuery);
                });  

    
                // Create a Block corresponding to the newly created Patient
                var getPrevHash = "SELECT current_hash FROM user_block ORDER BY timestamp DESC LIMIT 1;";
            
                con.query(getPrevHash, function(request, response, error) {
                    var createUserBlock = "INSERT INTO user_block VALUES ( " + userId + ", '" + user.userName + "', NOW(), '" + response[0]["current_hash"] + "', '" + calcHash(user) + "' );";
            
                    con.query(createUserBlock, function(err, res) {
                        if(err) 
                            console.error(err);
            
                        else 
                            console.log("Block created");
                    }); 
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
    
});




//  Patient Routes
app.post("/searchForHospital", function(request, response, error) {
    var patient = request.body.patientId, hospital = request.body.hospitalUname;
    var getHospitalId = "SELECT id FROM hospital WHERE username = '" + hospital + "';";

    con.query(getHospitalId, function(err, res) {
        if(err || res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "Hospital with Username '" + hospital + "' does not exist. Try again."
            });
            response.end();
        } 

        else {
            var addPermission = "INSERT INTO permission VALUES ( " + res[0]["id"] + ", " + patient + " );";

            con.query(addPermission, function(err, res) {
                if(err) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "You have already requested Hospital '" + hospital + "' for a consultation."
                    });
                    response.end();
                }

                else if(res.length === 0) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "You do not have a shared record with Hospital '" + hospital + "'."
                    });
                    response.end();
                }

                else {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "Hospital Admin has been notified of your request."
                    });
                    response.end();

                    logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with ID '" + patient + "' gave consent to Hospital with Username '" + hospital + ".\")";
                    con.query(logQuery);
                }
            });
        }
    });
});

app.post("/getAllRecords", function(request, response, error) {
    var sql = "SELECT record_id AS recordId FROM record WHERE patient_id = " + request.body.patientId;

    con.query(sql, function(err, res) {
	    response.setHeader('Content-Type', 'application/json');
        response.send(res);
        response.end();	
    });
});




// Doctor Routes
app.post("/getPatientsAssignedToDoctor", function(request, response, error) {
    var sql = "SELECT hospital_id AS hospitalId, patient_id AS patientId FROM assigned_doctor WHERE doctor_id = " + request.body.id;

    con.query(sql, function(err, res) {

        response.setHeader('Content-Type', 'application/json');
        response.send(res);
        response.end();

    });
});




// Hospital Routes
app.post("/getPatients", function(request, response, error) {
    var getPatients = "SELECT patient_id FROM permission WHERE hospital_id = " + request.body.id;

    con.query(getPatients, function(err, res) {
        if(err || res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "No Patients have wished to share their records with Hospital with ID = " + request.body.id + "."
            });
            response.end();
        }

        else {
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        }
    });
});

app.post("/getPatientRecords", function(request, response, error) {
    var output = [], user = request.body;

    var getRecordIds = "SELECT record_id AS id FROM hospital_record WHERE hospital_id = " + user.hospitalId + " AND patient_id = " + user.patientId;

    con.query(getRecordIds, function(err, res) {
        if(err) {             
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "No Records found for selected Patient."
            });
            response.end(); 
        }

        else {            
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();

            logQuery = "INSERT INTO log VALUES (NOW(), \"Hospital with ID '" + user.hospitalId + "' viewed the Records of Patient with ID '" + user.patientId + ".\")";
            con.query(logQuery);
        }
    });
});

app.post("/getDoctors", function(request, response, error) {
    var sql = "SELECT username FROM doctor WHERE hospital_id = " + request.body.id + ";";

    con.query(sql, function(err, res) {
        if(err || res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "No Registered Doctors exist."
            });
            response.end();
        }

        else {
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        }
    });
});

app.post("/assignDoctor", function(request, response, error) {
    var user = request.body;
    console.log()
    var getDoctorId = "SELECT id FROM doctor WHERE username = '" + user.doctorUname + "';";
    con.query(getDoctorId, function(err, res) {
        if(err || res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "Doctor with Username '" + user.doctorUname + "' does not exist."
            });
            response.end();
        }

        else {    
            var assignDoctor = "INSERT INTO assigned_doctor VALUES (" + user.hospitalId + ", " + user.patientId + ", " + res[0]["id"] + ");";
        
            con.query(assignDoctor, function(err, res) {
                if(err) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "Doctor with Username '" + user.doctorUname + "' could not be assigned. Try again."
                    });
                    response.end();
                }

                else {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "Doctor with Username '" + user.doctorUname + "' has been assigned. He/She has been notified."
                    });
                    response.end();

                    logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.doctorUname + "' was assigned to Patient with ID " + user.patientId + " successfully.\")";
                    con.query(logQuery);
                }
            });
        }
    });
});




// Miscellaneous
app.post("/changePassword", function(request, response, error) {
    var password, updatePassword, user = request.body, newPassword = crypto.encrypt(user.newPassword);

    var getPatient = "SELECT password FROM patient WHERE username = '" + user.userName + "';";

    con.query(getPatient, function(err, res) {
        if(res.length > 0) {
            updatePassword = "UPDATE patient SET password = '" + newPassword + "' WHERE username = '" + user.userName + "';";

            con.query(updatePassword, function(err, res) {
                if(err) {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "Password could not be updated for Patient '" + user.userName + "'."
                    });
                    response.end();
                    
                    logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + user.userName + "' failed to update password.\")";
                    con.query(logQuery);
                }
                
                else {
                    response.setHeader('Content-Type', 'application/json');
                    response.send({
                        message: "Password updated successfully for Patient '" + user.userName + "'."
                    });
                    response.end();
                    
                    logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + user.userName + "' updated password successfully.\")";
                    con.query(logQuery);
                }
            });
        }

        else {
            var getDoctor = "SELECT password FROM doctor WHERE username = '" + user.userName + "';";

            con.query(getDoctor, function(err, res) {
                if(res.length > 0) {
                    updatePassword = "UPDATE doctor SET password = '" + newPassword + "' WHERE username = '" + user.userName + "';";

                    con.query(updatePassword, function(err, res) {
                        if(err) {
                            response.setHeader('Content-Type', 'application/json');
                            response.send({
                                message: "Password could not be updated for Doctor '" + user.userName + "'."
                            });
                            response.end();
                    
                            logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.userName + "' failed to update password successfully.\")";
                            con.query(logQuery);
                        }
                        
                        else {
                            response.setHeader('Content-Type', 'application/json');
                            response.send({
                                message: "Password updated successfully for Doctor '" + user.userName + "'."
                            });
                            response.end();
                    
                            logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + user.userName + "' updated password successfully.\")";
                            con.query(logQuery);
                        }
                    });
                }
        
                else {
                    var getHospital = "SELECT password FROM hospital WHERE username = '" + user.userName + "';";
        
                    con.query(getHospital, function(err, res) {
                        if(res.length > 0) {
                            updatePassword = "UPDATE hospital SET password = '" + user.newPassword + "' WHERE username = '" + user.userName + "';";

                            con.query(updatePassword, function(err, res) {
                                if(err) {
                                    response.setHeader('Content-Type', 'application/json');
                                    response.send({
                                        message: "Password could not be updated for Hospital '" + user.userName + "'."
                                    });
                                    response.end();
                    
                                    logQuery = "INSERT INTO log VALUES (NOW(), \"Hospital with Username '" + user.userName + "' failed to update password successfully.\")";
                                    con.query(logQuery);
                                }

                                else {
                                    response.setHeader('Content-Type', 'application/json');
                                    response.send({
                                        message: "Password updated successfully for Hospital '" + user.userName + "'."
                                    });
                                    response.end();
                    
                                    logQuery = "INSERT INTO log VALUES (NOW(), \"Hospital with Username '" + user.userName + "' updated password successfully.\")";
                                    con.query(logQuery);
                                }
                            });
                        }
                
                        else {                
                            response.setHeader('Content-Type', 'application/json');
                            response.send({
                                message: "User with username '" + user.userName + "' does not exist."
                            });
                            response.end();
                        }
                    });
                }
            });
        }
    });
});

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
                    
            logQuery = "INSERT INTO log VALUES (NOW(), \"Patient with Username '" + res[0].username + "' had his/her Profile Details viewed.\")";
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
                    
            logQuery = "INSERT INTO log VALUES (NOW(), \"Doctor with Username '" + res[0].username + "' had his/her Profile Details viewed.\")";
            con.query(logQuery);
        });
    }
});

app.post("/getUsername", function(request, response, error) {
    var sql, user = request.body;

    if(user.userType === "Patient") {
        sql = "SELECT first_name, last_name, username FROM patient WHERE id = " + user.id;

        con.query(sql, function(err, res) {
            for(let i = 0; i < res.length; i++) {
                res[i]["firstName"] = crypto.decrypt(res[i]["first_name"]);
                res[i]["lastName"] = crypto.decrypt(res[i]["last_name"]);
            }

            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
    }

    else if(user.userType === "Doctor") {
        sql = "SELECT first_name, last_name, username FROM doctor WHERE id = " + user.id;

        con.query(sql, function(err, res) {
            for(let i = 0; i < res.length; i++) {
                res[i]["firstName"] = crypto.decrypt(res[i]["first_name"]);
                res[i]["lastName"] = crypto.decrypt(res[i]["last_name"]);
            }

            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
    }
    else if(user.userType === "Hospital") {
        sql = "SELECT name, username FROM hospital WHERE id = " + user.id;

        con.query(sql, function(err, res) {

            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
    }

});

app.post("/getRecord", function(request, response, error) {
    var sql = "SELECT record_content AS record FROM record WHERE record_id = " + request.body.id;

    con.query(sql, function(err, res) {	
        let data = res[0]['record'];
        
        response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        });
});

app.get("/getAllHospitals", function(request, response, error) {
    var sql = "SELECT username, name FROM hospital;";

    con.query(sql, function(err, res) {
        if(err || res.length === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                message: "No Registered Hospitals exist."
            });
            response.end();
        }

        else {
            response.setHeader('Content-Type', 'application/json');
            response.send(res);
            response.end();
        }
    });
});

app.post("/getStatus", function(request, response, error) {
    var hospital = request.body.hospitalId, patient = request.body.patientId;
    var findStatus = "SELECT COUNT(*) AS number_of_records FROM hospital_record WHERE hospital_id = " + hospital + " AND patient_id = " + patient + ";";

    con.query(findStatus, function(err, res) {
        if(res[0]["number_of_records"] === 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                status: "false"
            });
            response.end();
        }

        else if(res[0]["number_of_records"] > 0) {
            response.setHeader('Content-Type', 'application/json');
            response.send({
                status: "true"
            });
            response.end();
        }
    });
});




// Server Setup
app.listen(3000, function() {
    console.log('Server listening at port 3000...');
});
