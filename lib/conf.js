var os = require('os')
var fs = require('fs')
var path = require('path')
var userHome = require('user-home')
var c = {}

c.portFile = path.join(userHome, '.minihost')
c.targetsDir = path.join(os.tmpdir(), '.minihost')
c.port = fs.existsSync(c.filename) ? +fs.readFileSync(c.filename) : 2000
c.domain = '127.0.0.1.xip.io'
c.suffix = '.' + c.domain + ':' + c.port

module.exports = c