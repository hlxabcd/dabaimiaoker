var child_process = require('child_process');
var fs = require('fs');
util = require('util');
var configPath = './config';

files = fs.readdirSync(configPath);
util.log(util.inspect(files));

for (var idx in files) {
    var configFile = files[idx];
    red(configFile);
}

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