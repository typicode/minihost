#!/usr/bin/env node
var os = require('os')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var request = require('request')
var getPort = require('get-port')
var npmconf = require('npmconf')
var pkg = require('../package.json')

function getDaemonPort (cb) {
  npmconf.load(null, function (err, conf) {
    cb(conf.get('h:port') || 3000)
  })
}

function getServerURL (name, cb) {
  getDaemonPort(function (port) {
    cb('http://localhost:' + port + '/' + name)
  })
}

function API (port) {
  return 'http://127.0.0.1:' + port + '/_servers'
}

function getServerName () {
  return path.basename(process.cwd())
}

function spawnDaemon (port, cb) {
  var daemon = path.join(__dirname, 'daemon.js')
  var log = path.join(os.tmpdir(), 'minihost.log')
  var out = fs.createWriteStream(log)
  var opts = {
    detached: true,
    stdio: ['ignore', out, out]
  }

  out.once('open', function () {
    process.env.PORT = port
    spawn('node', [daemon], opts).unref()
    cb()
  })
}

function ensureDaemon (cb) {
  getDaemonPort(function (daemonPort) {
    request.get(API(daemonPort), function (err, resp) {
      if (err) {
        spawnDaemon(daemonPort, function () {
          setTimeout(cb, 500)
        })
      } else {
        cb()
      }
    })
  })
}

function addServer (name, port, cb) {
  var body = { name: name, port: port }

  getDaemonPort(function (daemonPort) {
    request.post(API(daemonPort), {
      body: body,
      json: true
    }, cb)
  })
}

function removeServer (name, cb) {
  getDaemonPort(function (daemonPort) {
    request.del(API(daemonPort) + '/' + name, cb)
  })
}

function spawnServer (args, port) {
  console.log('Starting `' + args.join(' ') + '` on port', port)
  process.env.PORT = port
  return spawn(args.shift(), args, { stdio: 'inherit' })
}

module.exports.run = function (argv) {
  var name = argv.name || getServerName()

  ensureDaemon(function () {
    getPort(function (err, port) {
      if (err) throw err

      addServer(name, port, function(err) {
        if (err) throw err

        getServerURL(name, function (serverURL) {
          console.log('Server is now available at %s', serverURL)
          var child = spawnServer(argv._, port)

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
              throw err
            })
          })
        })
      })
    })
  })
}
