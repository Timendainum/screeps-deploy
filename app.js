#!/usr/bin/env node

"use strict";

/***********************************************************************************************************************
 * modules
 */
const _ = require("lodash");
const https = require("https");
const fs = require("fs");
const path = require("path");

let setupRan = false;

if (process.argv[2] === 'test')
	process.exit(0);

/***********************************************************************************************************************
 * entry point
 */
let {file, config} = loadConfig();
console.log(`Using config ${file}`);

if (config)
	start();
else
	setup();

/***********************************************************************************************************************
 * functions
 */
function start() {
	// lets get it done...
	let data = {
		branch: "default",
		modules: {}
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
}


function safenFilename(rawName) {
	if (rawName !== undefined && rawName.length > 3 && rawName.substring(rawName.length - 3, rawName.length) === ".js") {
		return rawName.substring(0, rawName.length - 3);
	}
	return undefined;
}

function setup() {
	if (setupRan) {
		console.log('Configuration not found.');
		process.exit();
	}
	setupRan = true;
	let path = getConfigPaths().create;
	if (path) {
		fs.writeFileSync(path, fs.readFileSync(__dirname + '/config.js.sample'));
		editor(path, (code) => {
			if (!code) start()
		})
	} else {
		console.log('Please setup config.js before running.');
		console.log(`Valid paths for your platform (${process.platform}):`);
		getConfigPaths().paths.forEach(path => console.log(`- ${path}`));
		console.log();
		console.log('Or set the SCREEPSDEPLOY_CONFIG_PATH environment variable to point to a valid config file.')
	}
}

function getConfigPaths() {
	let appname = 'screeps-deploy';
	let paths = [];
	let create = '';

	if (process.env.SCREEPSDEPLOY_CONFIG_PATH)
		paths.push(process.env.SCREEPSDEPLOY_CONFIG_PATH);

	paths.push(path.join(__dirname, 'config.js'));

	if (process.platform === 'linux') {
		create = `${process.env.HOME}/.${appname}`;
		paths.push(create);
		paths.push(`/etc/${appname}/config.js`);
	}

	if (process.platform === 'win32') {
		let dir = path.join(process.env.APPDATA, appname);
		try {
			fs.mkdirSync(dir);
		} catch (e) {
			// nothing
		}

		if (!fs.existsSync(path.join(dir, 'config.js'))) {
			fs.writeFileSync(path.join(dir, 'config.js'), fs.readFileSync(path.join(__dirname, 'config.js.sample')))
		}
		paths.push(path.join(dir, 'config.js'));
	}
	create = '';
	return {paths, create};
}

function loadConfig() {
	let {paths} = getConfigPaths();
	for (let i in paths) {
		let file = paths[i];
		try {
			let config = require(file);
			//console.log(file);
			return {config, file};
		} catch (e) {
			// nothing
		}
	}
	return false;
}

