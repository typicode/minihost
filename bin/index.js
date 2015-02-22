#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var yargs = require('yargs')
var h = require('../lib/h')
var pkg = require('../package.json')

var argv = yargs
  .usage('$0 <command>')
  .help('help').alias('help', 'h')
  .version(pkg.version, 'version').alias('version', 'v')
  .options({
    name: {
      alias: 'n',
      description: 'Set server name'
    }
  })
  .example('~/express$ $0 nodemon', 'http://localhost:3000/express')
  .example('~/front$ $0 gulp server', 'http://localhost:3000/front')
  .example('~/other$ $0 -n app -- nodemon', 'http://localhost:3000/app')
  .demand(1)
  .argv

updateNotifier({pkg: pkg}).notify()
h.run(argv)