var fs = require('fs')
var request = require('request')
var conf = require('../lib/conf')

fs.unlink(conf.getFilename(), function () {})

var proxyPort = conf.getPort()
request.post('http://127.0.0.1:' + proxyPort + '/_stop', function () {})