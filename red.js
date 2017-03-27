var strEnc = require('./modules/des').strEnc;
var querystring = require('querystring');
var http = require('http');
var util = require('util');
var fs= require('fs');

if (process.argv.length != 3) {
    console.log("Usage: node flushUser.js hlx.json\n");
    process.exit(0);
}
var configFile = process.argv[2];

var userInfo = JSON.parse(fs.readFileSync(configFile));
util.log("begin:" + util.inspect(userInfo));

flushCookie(function(resData){
	util.log("1:" + util.inspect(userInfo));
	login(function(resData) {
		util.log("2:" + util.inspect(userInfo));
		getRed(function(resData){
				util.log("3:" + util.inspect(userInfo));
				util.log("resData:" + util.inspect(resData));
			});
	});
});

function flushCookie(callback)
{
	var method = 'GET';
	var path = '?ctl=init';
	var postData = {
	};
	request(method, path, postData, callback);
}

function getRed(callback)
{
	var method = 'POST';
	var path = '?ctl=zaochungame1';
	var postData = {
		post_type : 'json'
	};
	request(method, path, postData, callback);
}


function login(callback) {
	var method = 'POST';
	var path = '?ctl=login&timestamp=' + new Date().getTime();
	var postData = {
		email : userInfo.loginName,
		pwd : userInfo.password,
		post_type : 'json'
	};
	request(method, path, postData, callback);
}

function request(method, path, postData, callback) {
	var options = {
			hostname : 'www.majiadai.cn',
			port : 80,
			path : '/wap/index.php'+path,
			method : method,
			headers : {}
		};

	options.headers['User-Agent']='Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

	if(method == 'POST')
	{
		var postData = querystring.stringify(postData);
		options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		options.headers['Content-Length'] = postData.length;
	}
	else
	{
		
	}
	
	if(userInfo.cookie != undefined)
	{
		options.headers.Cookie = userInfo.cookie;
	}
	//console.log('reuqest header:' + util.inspect(options.headers));

	var req = http.request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));

		res.setEncoding('utf8');
		var resData = '';
		var len = 0;

		res.on('data', function(chunk) {
			resData = resData + chunk;

		});
		res.on('end', function() {
			//console.log('HEADERS: ' + JSON.stringify(res.headers));

			if (res.headers['set-cookie'] != undefined) {
				var cookieinfo = res.headers['set-cookie'][0].split(";");
				userInfo.cookie = cookieinfo[0];
				
			}

			//util.log('userInfo:' + util.inspect(userInfo));

			//util.log('response:' + resData);
			callback(resData);
		});
	});

	req.on('error', function(e) {
		//console.log('problem with request: ' + e.message);
	});
	if(method == 'POST')
	{
		req.write(postData);
	}
	req.end();
}