var strEnc = require('./modules/des').strEnc;
var querystring = require('querystring');
var http = require('http');
var util = require('util');
var fs= require('fs');
var cheerio = require('cheerio');

if (process.argv.length != 3) {
    console.log("Usage: node flushUser.js hlx.json\n");
    process.exit(0);
}
var configFile = process.argv[2];

var key1 = 'R6NWAk7KDBexXM7';
var key2 = 'U8m29Ur68IydKVL';
var key3 = 'fglQRcv4Kxtcb4d';

var userInfo = JSON.parse(fs.readFileSync(configFile));
var _productItemId = 397;
var _amountType = 1;

buyPage(function(res)
{
	$ = cheerio.load(res);
	var tmpFormData = $('form','.buy-box').serializeArray();
	var formData = {};
	for (var key in tmpFormData)
	{
		formData[tmpFormData[key].name]=tmpFormData[key].value;
	}
	
	userInfo.availableBalance = 100000;//formData.availableBalance;
	_productItemId = formData.productItemId;
	_amountType = formData.amountType;
	
	// 投标
	buy(function(resData){
		util.log(resData);
	});
});

function buy(callback) {
	var investAmount = 0;
	var redIdsArray = [];
	var redpackageAmount = 0;
	if(userInfo.redAmount != undefined)
	{
		// 指定红包
		var redInfos = userInfo.redInfo;
		for(var i in userInfo.redAmount)
		{
			var amount = userInfo.redAmount[i];
			for(var j in redInfos)
			{
				if(redInfos[j].isUsed)
				{
					continue;
				}
				if(redInfos[j].limitAmount > userInfo.availableBalance - investAmount)
				{
					break;
				}
				else if(redInfos[j].amount == userInfo.redAmount[i])
				{
					investAmount += redInfos[j].limitAmount;
					redIdsArray.push(redInfos[j].id);
					redpackageAmount += redInfos[j].amount;
					redInfos[j].isUsed = true;
					break;
				}
			}
		}
	}
	else
	{
	    // 排序好，过期早的排在上面
		for(var key in userInfo.redInfo)
		{
			var redInfo = userInfo.redInfo[key];
			if(redInfo.limitAmount > userInfo.availableBalance - investAmount)
			{
				break;
			}
			else
			{
				investAmount += redInfo.limitAmount;
				redIdsArray.push(redInfo.id);
				redpackageAmount += redInfo.amount;
			}
		}
	}
	var redIds = redIdsArray.join(',');
	var method = 'POST';
	var path = '/productInvest/saveDeals.shtml';
	var postData = {
			productItemId:_productItemId,
			amountType:_amountType,
			investAmount:investAmount,
			redpackageAmount:redpackageAmount,
			redIds:redIds,
	};
	util.log('wuha:'+util.inspect(postData));
	request(method, path, postData, callback);
}

function buyPage(callback) {
	var method = 'GET';
	var path = '/productItem/intoBuyPage.shtml?productId=23';
	var postData = {};
	request(method, path, postData, callback);
}

function request(method, path, postData, callback) {
	var options = {
			hostname : 'www.dabaimoney.cn',
			port : 80,
			path : path,
			method : method,
			headers : {}
		};
	
	if(method == 'POST')
	{
		var postData = querystring.stringify(postData);
		console.log('postData:' + postData);

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