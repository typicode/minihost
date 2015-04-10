var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var spawnSync = require('child_process').spawnSync
var assert = require('assert')
var supertest = require('supertest')
var conf = require('../lib/conf')

describe('uninstall.js', function () {
  before(function (done) {
    var opts = { stdio: 'inherit' }
    var proxyFilename = path.join(__dirname, '..', 'lib/proxy')
    var uninstallFilename = path.join(__dirname, '..', 'bin/uninstall')

    fs.writeFileSync(conf.portFile, '2000')
    spawn('node', [proxyFilename], opts)

    setTimeout(function () {
      spawnSync('node', [uninstallFilename], opts)
      done()
    }, 500)
  })

  it('should remove conf file', function () {
    assert(!fs.existsSync(conf.portFile))
  })

  it('should stop proxy', function (done) {
    supertest('http://127.0.0.1:2000')
      .get('/')
      .end(function (err) {
        if (err) return done()
        done(new Error('Proxy still running'))
      })
  })
})