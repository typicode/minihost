var fs = require('fs')
var path = require('path')
var userHome = require('user-home')

module.exports.getProxyPort = function () {
  var conf = path.join(userHome, '.minihost')
  return fs.existsSync(conf) ? +fs.readFileSync(conf) : 2000
}