var fs = require('fs')
var rimraf = require('rimraf')
var request = require('request')
var conf = require('../lib/conf')

fs.unlink(conf.portFile, function () {})
rimraf(conf.targetsDir, function () {})

var proxyPort = conf.port
request.post('http://127.0.0.1:' + proxyPort + '/_stop', function () {})