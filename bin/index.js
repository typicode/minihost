#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var yargs = require('yargs')
var chalk = require('chalk')
var h = require('../lib/h')
var conf = require('../lib/conf')
var pkg = require('../package.json')

updateNotifier({pkg: pkg}).notify()

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
  .example('~/app$ $0 -- nodemon', 'http://app' + conf.suffix)
  .example('~/app$ $0 -- serve -p [PORT]', 'http://app' + conf.suffix)
  .example('~/app$ $0 -n project -- nodemon', 'http://project' + conf.suffix)
  .epilog('To list running servers, go to http://localhost:' + conf.port)
  .demand(1)
  .argv

h(argv)