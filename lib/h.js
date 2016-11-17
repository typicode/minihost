#!/usr/bin/env node
var os = require('os')
var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var mkdirp = require('mkdirp')
var getPort = require('get-port')
var parallel = require('async/map')
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

function spawnServer (args) {    
  var opts = { stdio: 'inherit' }
  if (os.platform() === 'win32') {
    return spawn('cmd', ['/c'].concat(args), opts)
  } else {
    var cmd = unquote(args.join(' '))
    return spawn('sh', ['-c'].concat(cmd), opts)
  }
}

module.exports = function (argv, cb) {
  // Get server names
  var names = argv.name || path.basename(process.cwd())
  
  if (typeof names === 'string') {
    names = [names]
  }
    
  // Extract name and port env variable name
  var parsedNames = names.map(function (name, index) {
    var nameSplit = name.split(':')
    return {
      name: nameSplit[0],
      portEnv: nameSplit[1] || 'PORT' + (index ? '_' + (index - 1) : '')
    }    
  })

  function removeTargets () {
    parsedNames.forEach(function (parsedName) {
      removeTarget(parsedName.name)
    })
  }

  parallel(parsedNames, function (parsedName, cb) {        
    var name = parsedName.name
    var portEnv = parsedName.portEnv

    // Find a free port
    getPort(function (err, port) {
      if (err) throw err    
                  
      // Show server url
      var url = 'http://' + name + conf.suffix      
      console.log(chalk.cyan(url))
      
      // Show command
      var cmd = portEnv + '=' + port + ' ' + argv._.join(' ')
      console.log(chalk.cyan(cmd))

      // Add target
      addTarget(name, port)      

      // Set port env
      process.env[portEnv] = port
      
      cb()
    })
  }, function () {      
      // Spawn proxy server
      spawnProxy()
      
      // Spawn server
      var child = spawnServer(argv._)

      // Forward signals
      var signals = ['SIGINT', 'SIGTERM', 'SIGHUP']            
      
      signals.forEach(function (sig) {
        process.on(sig, function () {
          removeTargets()
          child.kill(sig)
        })
      })

      // Handle exit
      child.on('exit', function (code) {
        removeTargets()
        process.exit(code)
      })

      // Handle error
      child.on('error', function (err) {
        removeTargets()
        if (err) throw err
      })
  })
}
