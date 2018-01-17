var http = require('http');
var path = require('path');
var fs = require('fs');


var vacationData = readJsonFile();

var MS_IN_DAY = 1000*60*60*24;

function onRequest(req, res) {
	var data = [];
	res.setHeader('Access-Control-Allow-Origin', '*');
 	res.setHeader('Access-Control-Request-Method', '*');
 	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
 	res.setHeader('Access-Control-Allow-Headers', '*');
	function onData(chunk) {
		data.push(chunk);
	}
	function onEnd() {
		data = Buffer.concat(data).toString();
		console.log(data);
		//debugger;
		createResponse(req, res, data);
	}
	req.on('data', onData);
	req.on('end', onEnd);
}

function createResponse(req, res, data) {
	var dataObject;
	try {
		dataObject = JSON.parse(data);
	}
	catch(e)
	{
		console.log(e);
		console.log(data);
		res.end();
		return;
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
	switch(dataObject.action) {
		case "testConnection":
			var respObject = {"action":"testConnection", "errorID":0, "data":"OK"};
    		res.write(JSON.stringify(respObject));
			break;
		case "getVacationData": 
    		getVacationData(dataObject.data, res)
			break;
		case "addVacation": 
			addVacation(dataObject.data, res);
		break;
		case "deleteVacation": 
			deleteVacation(dataObject.data, res);
		break;
		case "login":
			login(dataObject.data, res);
			break;
	}

	res.end();
}


/* ------------------------------------------------------------------- 
 * User part
 * 
 * ------------------------------------------------------------------- */

function checkUserPass(dbUser, pass) {
	return dbUser != null && dbUser.pass == pass;
}

function checkUserSID(dbUser, sid) {
	return (dbUser != null
		&& dbUser.sid != null
		&& dbUser.sid != ""
		&& dbUser.sid == sid);
}

function getUserFromDB(user) {
	for(var i = 0; i < vacationData.users.length; i++) {
		var dbUser = vacationData.users[i];

		console.log('__________________________');
		console.log('Func getUserFromDB: dbUser', dbUser);
		console.log('Func getUserFromDB: length', vacationData.users.length);
		console.log('Func getUserFromDB: [i]', i);
		
		if (dbUser.login == user) {
			return dbUser;
		}
	}
	return null;
}


/* ------------------------------------------------------------------- 
 * login part
 * 
 * ------------------------------------------------------------------- */

function login(data, res) {
	var user = data.user;
	var pass = data.pass;
	var dbUser = getUserFromDB(user);

	console.log('__________________');
	console.log('Func login: dbUser', dbUser);

	if (checkUserPass(dbUser, pass)) {
		sendLoginSID(dbUser, res);
	}
	else
	{
		sendLoginError(res);
	}
}

function sendLoginSID(dbUser, res) {
	var sid = getRandomInt(100000000000, 999999999999);
	dbUser.sid = sid;
	var data = {
		"sid":sid,
		"user":dbUser.login
	}
	var respObject = {"action":"login", "errorID":0, "data":data};
	res.write(JSON.stringify(respObject));
}

function sendLoginError(res) {
	var respObject = {"action":"login", "errorID":1, "data":null};
	res.write(JSON.stringify(respObject));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


/* ------------------------------------------------------------------- 
 * JSON manipulations part
 * 
 * ------------------------------------------------------------------- */



//gets JSON file path
function getJSONName() {
	return path.resolve(__dirname, 'vacation_data.json');
}

function readJsonFile() {

	console.log('Path:', getJSONName());
	var data = fs.readFileSync(getJSONName(), 'utf8');
	var jsonObj = JSON.parse(data);

	console.log('Json obj:', jsonObj);
	return jsonObj;
}

//writes and saves data to JSON FIle
function saveJSONFile() {
	fs.writeFile(getJSONName(), JSON.stringify(vacationData), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
	}); 
}


/* ------------------------------------------------------------------- 
 * Vacation manipulations part
 * 
 * ------------------------------------------------------------------- */

//gets user vacation data and sends it to the client
function getVacationData(data, res) {
	var respObject = {"action":"getVacationData"};
	var userDB = getUserFromDB(data.user);
	if (checkUserSID(userDB, data.sid)) {
		respObject.errorID = 0;
		respObject.data = userDB.profileData;
	}
	else
	{
		respObject.errorID = 1;
	}
	res.write(JSON.stringify(respObject));
}

/*
* adds vacation by appending it to the JSON file if it correct
* after sends all vacation list to the client
*/
function addVacation(data, res) {

	var respObject = {"action":"getVacationData"};
	var userDB = getUserFromDB(data.user);
	if (checkUserSID(userDB, data.sid)) {
		var profileData = userDB.profileData;
		var resultVacationDays = calculateCountOfVacationDays(data.startDay, data.endDay);
        if (resultVacationDays > 0 && resultVacationDays <= profileData.availableDays) {
        	createNewVacationEntry(userDB, data);
        	profileData.availableDays -= resultVacationDays;
        	saveJSONFile();
        }
        respObject.data = profileData;
        respObject.errorID = 0;
	}
	else
	{
		respObject.errorID = 1;
	}
	res.write(JSON.stringify(respObject));
}

//deletes vacation from DB
function deleteVacation(data, res) {
	var respObject = {"action":"deleteVacation"};
	var userDB = getUserFromDB(data.user);
	if (checkUserSID(userDB, data.sid)) {
		var profileData = userDB.profileData;
		for (var i = 0; i < profileData.vacationArray.length; i++) {
			var vacationEntry = profileData.vacationArray[i];
			if (vacationEntry.id == data.id) {
				profileData.availableDays += calculateCountOfVacationDays(vacationEntry.startDay, vacationEntry.endDay);
				vacationEntry = profileData.vacationArray.splice(i, 1);
				saveJSONFile();
				break;
			}
		}
		respObject.data = profileData;
        respObject.errorID = 0;
	}
	else {
		respObject.errorID = 1;
	}
	res.write(JSON.stringify(respObject));
}

//creates template that uses for filing user vacation data to the JSON file
function createNewVacationEntry(userDB, data) {
	var vacationObj = {
		"startDay": data.startDay,
		"endDay": data.endDay,
		"comment": data.comment,
		"canEdit": true,
		"id":userDB.nextID
	};
	userDB.nextID++;
	userDB.profileData.vacationArray.push(vacationObj);
}

function calculateCountOfVacationDays(startDay, endDay) {
    console.log('_________________________________');
    console.log('Func calculateCountOfVacationDays');

    var countVacationDays = 0;
    var endDayPlus = endDay + MS_IN_DAY;

    countVacationDays = endDayPlus - startDay;
    countVacationDays = countVacationDays / MS_IN_DAY;

    console.log('Count of vacation days: ', countVacationDays);
    return countVacationDays;
}

var server = http.createServer();
server.on('request', onRequest);
server.listen(8081);