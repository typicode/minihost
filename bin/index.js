#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var yargs = require('yargs')
var h = require('../lib/h')
var pkg = require('../package.json')

var argv = yargs
  .usage('$0 [opts --] <command>')
  .help('help').alias('help', 'h')
  .version(pkg.version, 'version').alias('version', 'v')
  .options({
    name: {
      alias: 'n',
      description: 'Set server name'
    }
  })
  .example('~/express$ $0 nodemon', 'http://express.127.0.0.1.xip.io:3000/')
  .example('~/front$ $0 gulp server', 'http://front.127.0.0.1.xip.io:3000/front')
  .example('~/other$ $0 -n app -- nodemon', 'http://other.127.0.0.1.xip.io:3000/app')
  .demand(1)
  .argv

updateNotifier({pkg: pkg}).notify()
h(argv)
