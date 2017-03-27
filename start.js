var child_process = require('child_process');
var fs = require('fs');
util = require('util');
var configPath = './config';

files = fs.readdirSync(configPath);
util.log(util.inspect(files));

var startTime = Date.now();
var time1 = startTime;
var time2 = startTime;

do{
    if(time2 - time1 > 2)
    {
        time1 = time2;
        for (var idx in files) {
        var configFile = files[idx];
        red(configFile);
        }
    }
    time2 = Date.now();
}while(time2-startTime<=10)


function red(configFile) {
    var cmd = 'cd ' + process.cwd() + ' && ' + process.execPath + ' red.js ' + configFile+ ' >> ./log/'+configFile+' 2>&1 & ';
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