var spawn = require('child_process').spawn
var supertest = require('supertest')
var WebSocketClient = require('websocket').client
var pkg = require('../package.json')

var request = supertest('http://127.0.0.1:2000')
var webSocketClient = new WebSocketClient()

var procs = []

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

  procs.push(proc)
}

describe('h', function () {

  var timeout = process.env.TRAVIS ? 4000 : 1000
  this.timeout(timeout + 1000)

  before(function (done) {
    request
      .post('/_stop')
      .end(function (err, res) {
        if (err) return done()
        console.log('Killed running proxy')
        setTimeout(done, timeout)
      })
  })

  describe('-- node index.js', function () {

    before(function (done) {
      h('-- node index.js')
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
        .get('/')
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

  describe('-- \'cmd $PORT\'', function () {
    before(function (done) {
      h('--name three -- \'node index-argv.js $PORT\'')
      setTimeout(done, timeout)
    })

    it('should replace $PORT', function (done) {
      request
        .get('/')
        .set('Host', 'three.127.0.0.1.xip.io')
        .expect(/OK/)
        .end(done)
    })
  })

  describe('when a process is killed', function () {
    it('should not be listed anymore', function (done) {
      procs[0].on('exit', function () {
        request
          .get('/')
          .expect(/^((?!one).)*$/)
          .end(done)
      }).kill()
    })
  })

  describe('when all processes are killed', function () {
    before(function (done) {
      procs[1].kill()
      procs[2].kill()
      setTimeout(done, timeout)
    })

    it('should not be possible to access proxy', function(done) {
      request
        .get('/')
        .end(function (err) {
          err ? done() : done(new Error('Proxy should not be running'))
        })
    })
  })
})

