var child_process = require('child_process');
var fs = require('fs');
util = require('util');
var configPath = './config';

files = fs.readdirSync(configPath);
util.log(util.inspect(files));

var DIFF_REQUEST = 1*1000;
var DURATION = 5*60*1000;

var startTime = Date.now();
var time1 = startTime;
var time2 = startTime;

do{
    if(time2 - time1 > DIFF_REQUEST)
    {
        time1 = time2;
        for (var idx in files) {
        var configFile = configPath+'/'+files[idx];
        red(configFile);
        }
    }
    time2 = Date.now();
}while(time2-startTime<=DURATION)


function red(configFile) {
    var cmd = 'cd ' + process.cwd() + ' && ' + process.execPath + ' red.js ' + configFile+ ' >> ./log/reqeust.log 2>&1 & ';
    util.log(cmd);
    execCmd(cmd);
}

function execCmd(cmd)
{
    var exec = child_process.exec;
    child = exec(cmd, {
        detached : true,
        stdio : 'ignore'
    });
    child.unref();
}