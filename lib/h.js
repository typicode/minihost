#!/usr/bin/env node
var os = require('os')
var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var mkdirp = require('mkdirp')
var getPort = require('get-port')
var chalk = require('chalk')
var unquote = require('unquote')
var conf = require('./conf')
var pkg = require('../package.json')

function addTarget (name, port) {
  var target = path.join(conf.targetsDir, name)
  mkdirp.sync(conf.targetsDir)
  fs.writeFileSync(target, port)
}

function removeTarget (name) {
  var target = path.join(conf.targetsDir, name)
  if (fs.existsSync(target)) fs.unlinkSync(target)
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

function spawnServer (args, port) {
  process.env.PORT = port
  var opts = { stdio: 'inherit' }
  if (os.platform() === 'win32') {
    return spawn('cmd', ['/c'].concat(args), opts)
  } else {
    var cmd = unquote(args.join(' '))
    return spawn('sh', ['-c'].concat(cmd), opts)
  }
}

module.exports = function (argv, cb) {
  // Find a free port
  getPort(function (err, port) {
    if (err) throw err

    // Get server name
    var name = argv.name || path.basename(process.cwd())

    // Show server url
    var url = 'http://' + name + conf.suffix
    console.log(chalk.cyan(url))

    // Show command
    var cmd = 'PORT=' + port + ' ' + argv._.join(' ')
    console.log(chalk.cyan(cmd))

    // Add target
    addTarget(name, port)

    // Spawn proxy server
    spawnProxy()

    // Spawn server
    var child = spawnServer(argv._, port)

    // Forward signals
    process.on('SIGINT', function () {
      child.kill('SIGINT')
    })

    process.on('SIGTERM', function () {
      child.kill('SIGTERM')
    })

    process.on('SIGHUP', function () {
      child.kill('SIGHUP')
    })

    // Handle exit
    child.on('exit', function (code) {
      removeTarget(name)
      process.exit(code)
    })

    // Handle error
    child.on('error', function (err) {
      removeTarget(name)
      if (err) throw err
    })
  })
}
