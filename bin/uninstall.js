var fs = require('fs')
var conf = require('../lib/conf')
fs.unlink(conf.getFilename(), function () {})