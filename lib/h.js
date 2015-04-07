#!/usr/bin/env node
var os = require('os')
var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var crossSpawn = require('cross-spawn')
var request = require('request')
var getPort = require('get-port')
var chalk = require('chalk')
var conf = require('./conf')
var pkg = require('../package.json')

var proxyPort = conf.getPort()
var targetsURL = 'http://127.0.0.1:' + proxyPort + '/_targets'

function getServerURL (name) {
  return 'http://' + name + '.127.0.0.1.xip.io:' + proxyPort
}

function getServerName () {
  return path.basename(process.cwd())
}

function spawnProxy () {
  var proxy = path.join(__dirname, 'proxy.js')
  var log = path.join(os.tmpdir(), 'minihost.log')
  var out = fs.openSync(log, 'a')
  var opts = {
    detached: true,
    stdio: ['ignore', out, out]
  }

  spawn('node', [proxy], opts).unref()
}

function ensureProxy (cb) {
  request.get(targetsURL, function (err, resp) {
    if (err) {
      spawnProxy()
      setTimeout(function () { request.get(targetsURL, cb) }, 500)
    } else {
      cb()
    }
  })
}

function addTarget (name, port, cb) {
  var body = { name: name, port: port }
  var opts = { body: body, json: true }

  request.post(targetsURL, opts, cb)
}

function removeTarget (name, cb) {
  request.del(targetsURL + '/' + name, cb)
}

function spawnServer (args, port) {
  var hasPORT = args.indexOf('[PORT]') !== -1
  process.env.PORT = port
  args = args.map(function (arg) {
    return arg === '[PORT]' ? port : arg
  })

  var cmd = (hasPORT ? '' : 'PORT=' + port + ' ') + args.join(' ')
  console.log(chalk.cyan(cmd))
  return crossSpawn(args.shift(), args, { stdio: 'inherit' })
}

module.exports = {
  run: function (argv, cb) {
    var name = argv.name || getServerName()

    ensureProxy(function (err) {
      if (err && err.code === 'ECONNREFUSED') {
        console.log('Can\'t spawn', pkg.name)
        console.log('Retry or check that port', conf.getPort(), 'is not used')
        return
      }

      if (err) throw err

      getPort(function (err, port) {
        if (err) throw err

        addTarget(name, port, function(err) {
          if (err) throw err

          console.log(chalk.cyan(getServerURL(name)))
          var child = spawnServer(argv._, port)

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
            removeTarget(name, function (err) {
              if (err) throw err
            })
          })
        })
      })
    })
  }
}
