#!/usr/bin/env node
var updateNotifier = require('update-notifier')
var yargs = require('yargs')
var h = require('../lib/h')
var pkg = require('../package.json')

updateNotifier({pkg: pkg}).notify()

var argv = yargs
  .usage('$0 [opts] -- <command>')
  .help('help').alias('help', 'h')
  .version(pkg.version, 'version').alias('version', 'v')
  .options({
    name: {
      alias: 'n',
      describe: 'Set server name'
    }
  })
  .example('~/express$ $0 nodemon', 'http://express.127.0.0.1.xip.io:2000')
  .example('~/front$ $0 gulp server', 'http://front.127.0.0.1.xip.io:2000')
  .example('~/other$ $0 -n app -- nodemon', 'http://app.127.0.0.1.xip.io:2000')
  .epilog('To list running servers, go to http://localhost:2000')
  .demand(1)
  .argv

h(argv, function (err) {
  if (err) throw err
})
