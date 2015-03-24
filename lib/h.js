#!/usr/bin/env node
var os = require('os')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var request = require('request')
var getPort = require('get-port')
var userHome = require('user-home')
var pkg = require('../package.json')

function getDaemonPort () {
  var conf = path.join(userHome, '.minihost')
  return fs.existsSync('.minihost') ? fs.readFileSync(conf) : 2000
}

function getServerURL (name) {
  var port = getDaemonPort()
  return 'http://' + name + '.127.0.0.1.xip.io:' + port
}

function API (port) {
  return 'http://127.0.0.1:' + port + '/_targets'
}

function getServerName () {
  return path.basename(process.cwd())
}

function spawnDaemon (port) {
  var daemon = path.join(__dirname, 'daemon.js')
  var log = path.join(os.tmpdir(), 'minihost.log')
  var out = fs.openSync(log, 'a')
  var opts = {
    detached: true,
    stdio: ['ignore', out, out]
  }

  process.env.PORT = port
  spawn('node', [daemon], opts).unref()
}

function ensureDaemon (cb) {
  var port = getDaemonPort()
  request.get(API(port), function (err, resp) {
    if (err) {
      spawnDaemon(port)
      setTimeout(cb, 500)
    } else {
      cb()
    }
  })
}

function addServer (name, port, cb) {
  var body = { name: name, port: port }
  var opts = { body: body, json: true }

  var port = getDaemonPort()
  request.post(API(port), opts, cb)
}

function removeServer (name, cb) {
  var port = getDaemonPort()
  request.del(API(port) + '/' + name, cb)
}

function spawnServer (args, port) {
  console.log('Starting `' + args.join(' ') + '` on port', port)
  process.env.PORT = port
  args = args.map(function (arg) {
    return arg === '[PORT]' ? port : arg
  })
  return spawn(args.shift(), args, { stdio: 'inherit' })
}

module.exports = {
  stop: function (cb) {
    var url = 'http://127.0.0.1:' + getDaemonPort() + '/_self'
    request.del(url, cb)
  },
  run: function (argv, cb) {
    var name = argv.name || getServerName()

    ensureDaemon(function () {
      getPort(function (err, port) {
        if (err) return cb(err)

        addServer(name, port, function(err) {
          if (err) return cb(err)

          var child = spawnServer(argv._, port)
          console.log('Server is available at %s', getServerURL(name))

          process.on('SIGINT', function () {
            child.kill('SIGINT')
          })

          process.on('SIGTERM', function () {
            child.kill('SIGTERM')
          })

          child.on('exit', function (code) {
            removeServer(name, function() {
              process.exit(code)
            })
          })

          child.on('error', function (err) {
            removeServer(name, function () {
              return cb(err)
            })
          })
        })
      })
    })
  }
}
