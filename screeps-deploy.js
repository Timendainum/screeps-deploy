"use strict";

// modules
let _ = require("lodash");
let https = require("https");
let fs = require("fs");
let config = require("./config");

// lets get it done...
let data = {
	branch: "default",
	modules: {}
};

let safenFilename = function (rawName) {
	if (rawName !== undefined && rawName.length > 3 && rawName.substring(rawName.length - 3, rawName.length) === ".js") {
		return rawName.substring(0, rawName.length - 3);
	}
	return undefined;
};

console.log(`Updating code on screeps...`);
console.log(`Path: ${config.path}`);

// read directory
let files = fs.readdirSync(config.path);
let i = 0;
let fileName, safeFileName, fileContent;

for (; i < files.length; i++) {
	fileName = `${config.path}/${files[i]}`;
	safeFileName = safenFilename(files[i]);
	if (safeFileName !== undefined) {
		//console.log(fileName);
		fileContent = fs.readFileSync(fileName, "utf8");
		data.modules[safeFileName] = fileContent;
	}
}

console.log(`Done reading ${_.size(data.modules)} files.`);
//console.log(data.modules);
//console.log(JSON.stringify(data));
//console.log(Object.keys(data.modules));

console.log(`Updating code on screeps for ${config.userName}`);
let req = https.request({
	hostname: "screeps.com",
	port: 443,
	path: "/api/user/code",
	method: "POST",
	auth: `${config.userName}:${config.password}`,
	headers: {
		"Content-Type": "application/json; charset=utf-8"
	}
}, res => {
	let responseBody = "";

	console.log(`Response started...`);
	console.log(`Status: ${res.statusCode}`);
	//console.log(`Headers: ${JSON.stringify(res.headers)}`);

	res.on("data", chunk => {
		responseBody += chunk;
	});

	res.on("end", () => {
		console.log(`Response ended.`);
		console.log(`Response: ${responseBody}`);
	});


});

req.on("error", err => {
	console.log(`Error on request: ${err.message}`);
});

req.write(JSON.stringify(data));
req.end();

