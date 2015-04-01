#!/usr/bin/env node
var os = require('os')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var crossSpawn = require('child_process').spawn
var request = require('request')
var getPort = require('get-port')
var getProxyPort = require('./conf').getProxyPort

function getServerURL (name) {
  var port = getProxyPort()
  return 'http://' + name + '.127.0.0.1.xip.io:' + port
}

function API (port) {
  return 'http://127.0.0.1:' + port + '/_targets'
}

function getServerName () {
  return path.basename(process.cwd())
}

function spawnProxy (port) {
  var proxy = path.join(__dirname, 'proxy.js')
  var log = path.join(os.tmpdir(), 'minihost.log')
  var out = fs.openSync(log, 'a')
  var opts = {
    detached: true,
    stdio: ['ignore', out, out]
  }

  process.env.PORT = port
  spawn('node', [proxy], opts).unref()
}

function ensureProxy (cb) {
  var port = getProxyPort()
  request.get(API(port), function (err, resp) {
    if (err) {
      spawnProxy(port)
      setTimeout(cb, 500)
    } else {
      cb()
    }
  })
}

function addTarget (name, port, cb) {
  var body = { name: name, port: port }
  var opts = { body: body, json: true }

  var port = getProxyPort()
  request.post(API(port), opts, cb)
}

function removeTarget (name, cb) {
  var port = getProxyPort()
  request.del(API(port) + '/' + name, cb)
}

function spawnServer (args, port) {
  console.log('Starting `' + args.join(' ') + '` on port', port)
  process.env.PORT = port
  args = args.map(function (arg) {
    return arg === '[PORT]' ? port : arg
  })

  return crossSpawn(args.shift(), args, { stdio: 'inherit' })
}

module.exports = {
  stop: function (cb) {
    var url = 'http://127.0.0.1:' + getProxyPort() + '/_self'
    request.del(url, cb)
  },
  run: function (argv, cb) {
    var name = argv.name || getServerName()

    ensureProxy(function () {
      getPort(function (err, port) {
        if (err) return cb(err)

        addTarget(name, port, function(err) {
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
            removeTarget(name, function() {
              process.exit(code)
            })
          })

          child.on('error', function (err) {
            removeTarget(name, function () {
              return cb(err)
            })
          })
        })
      })
    })
  }
}
