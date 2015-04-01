var spawn = require('child_process').spawn
var supertest = require('supertest')
var WebSocketClient = require('websocket').client
var test = require('tape')
var pkg = require('../package.json')

var request = supertest('http://127.0.0.1:2000')
var webSocketClient = new WebSocketClient()

function h (str) {
  var args = [__dirname + '/../' + pkg.bin.h].concat(str.split(' '))
  var opts = {
    cwd: __dirname + '/one',
    stdio: 'inherit'
  }
  var proc = spawn('node', args, opts)

  proc.on('error', function(err) {
    console.error('Can\'t start command line interface')
    throw err
  })

  return proc
}

describe('h', function () {

  var timeout = process.env.TRAVIS ? 4000 : 2000
  this.timeout(timeout + 1000)

  before(function (done) {
    h('--stop')
    setTimeout(done, timeout)
  })

  describe('-- node index.js', function () {

    var child

    before(function (done) {
      child = h('-- node index.js')
      setTimeout(done, timeout)
    })

    it('should start minihost', function (done) {
      request
        .get('/')
        .expect(/minihost/)
        .end(done)
    })

    it('should add self to targets', function (done) {
      request
        .get('/_targets')
        .expect(/one/)
        .end(done)
    })

    it('should be possible to make simple HTTP requests', function (done) {
      request
        .get('/')
        .set('Host', 'one.127.0.0.1.xip.io')
        .expect('OK')
        .end(done)
    })

    it('should be possible to make complex HTTP requests', function (done) {
      request
        .get('/some/path?msg=hello')
        .set('Host', 'one.127.0.0.1.xip.io')
        .expect('hello')
        .end(done)
    })

    it('should be possible to make WebSocket requests', function (done) {
      webSocketClient
        .on('connect', function (socket) {
          done()
          socket.close()
        })
        .connect('ws://one.127.0.0.1.xip.io:2000', 'echo-protocol')
    })

    it('should remove self from targets on kill', function (done) {
      child.on('exit', function () {
        request
          .get('/_targets')
          .expect(/^((?!one).)*$/)
          .end(done)
      }).kill()
    })
  })

  describe('--name', function () {
    before(function (done) {
      h('--name two -- node index.js')
      setTimeout(done, timeout)
    })

    it('should make the server available under another name', function (done) {
      request
        .get('/')
        .set('Host', 'two.127.0.0.1.xip.io')
        .expect('OK')
        .end(done)
    })
  })

  describe('-- cmd [PORT]', function () {
    before(function (done) {
      h('--name three -- node index-argv.js [PORT]')
      setTimeout(done, timeout)
    })

    it('should dynamically replace [PORT]', function (done) {
      request
        .get('/')
        .set('Host', 'three.127.0.0.1.xip.io')
        .expect(/OK/)
        .end(done)
    })
  })

  describe('--stop', function () {
    before(function (done) {
      h('--stop')
      setTimeout(done, timeout)
    })

    it('should stop minihost', function (done) {
      request
        .get('/')
        .end(function (err) {
          if (err) done()
        })
    })
  })
})