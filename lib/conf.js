var fs = require('fs')
var path = require('path')
var userHome = require('user-home')

module.exports = {
  getFilename: function () {
    return path.join(userHome, '.minihost')
  },
  getPort: function () {
    var filename = this.getFilename()
    return fs.existsSync(filename) ? +fs.readFileSync(filename) : 2000
  }
}