var fs = require('fs')
var path = require('path')
var userHome = require('user-home')
var conf = path.join(userHome, '.minihost')

if (fs.existsSync(conf)) fs.unlinkSync(conf)