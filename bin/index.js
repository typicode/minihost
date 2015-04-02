#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var yargs = require('yargs')
var chalk = require('chalk')
var h = require('../lib/h')
var conf = require('../lib/conf')
var pkg = require('../package.json')

updateNotifier({pkg: pkg}).notify()

var port = conf.getPort()
var argv = yargs
  .strict()
  .usage('$0 [opts] -- <command>')
  .help('help').alias('help', 'h')
  .version(pkg.version, 'version').alias('version', 'v')
  .options({
    name: {
      alias: 'n',
      describe: 'Set server name'
    }
  })
  .example('~/app$ $0 -- nodemon', 'http://app.127.0.0.1.xip.io:' + port)
  .example('~/app$ $0 -- serve -p [PORT]', 'http://app.127.0.0.1.xip.io:' + port)
  .example('~/app$ $0 -n project -- nodemon', 'http://project.127.0.0.1.xip.io:' + port)
  .epilog('To list running servers, go to http://localhost:' + port)
  .demand(1)
  .argv

h.run(argv)