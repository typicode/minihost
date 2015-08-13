var fs = require('fs')
var path = require('path')
var http = require('http')
var mkdirp = require('mkdirp')
var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var httpProxy = require('http-proxy')
var jade = require('jade')
var util = require('util')
var pkg = require('../package.json')
var conf = require('./conf')

var port = conf.port
var app = express()
var server = http.createServer(app)
var proxy = httpProxy.createProxyServer()

function exit () {
  util.log('Exit')
  process.exit()
}

function getTargets () {
  var files = fs.readdirSync(conf.targetsDir)
  return files.map(function (file) {
    return {
      name: file,
      url: 'http://' + file + conf.suffix,
      port: fs.readFileSync(path.join(conf.targetsDir, file), 'utf-8')
    }
  })
}

function index (req, res) {
  res.render('index', {
    targets: getTargets(),
    version: pkg.version
  })
}

function getTarget (req) {
  var host = req.headers.host
  // reverse in order to first match app-one before app
  var targets = getTargets().reverse()
  for (var index in targets) {
    if (host.indexOf(targets[index].name + '.') === 0) {
      return 'http://127.0.0.1:' + targets[index].port
    }
  }
}

function routeWS (req, socket, head) {
  var target = getTarget(req)
  if (target) proxy.ws(req, socket, head, { target: target }, function (err) {
    util.log('Can\'t proxy WebSocket')
  })
}

function routeHTTP (req, res, next) {
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') return next()

  var target = getTarget(req)
  if (target) {
    proxy.web(req, res, { target: target }, function (err) {
      res.status(502).send(err.stack)
    })
  } else {
    res.sendStatus(404)
  }
}

function stop (req, res) {
  res.end()
  exit()
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade')
app.use(morgan(':method :req[host] :url :status :res[content-length] - :response-time ms'))
app.use(routeHTTP)
app.use(serveStatic(path.join(__dirname, 'public')))
app.get('/', index)
app.post('/_stop', stop)

server.on('upgrade', routeWS)
server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    util.log('Port ' + port + ' in use')
    process.exit()
  }
  throw err
})
server.listen(port, function () {
  util.log('Listening on port ' + port)
})

mkdirp.sync(conf.targetsDir)
fs.watch(conf.targetsDir, function () {
  if (!fs.existsSync(conf.targetsDir) || fs.readdirSync(conf.targetsDir).length === 0) {
    exit()
  }
})
