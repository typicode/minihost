var path = require('path')
var http = require('http')
var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var httpProxy = require('http-proxy')
var util = require('util')

var PORT = process.env.PORT
var app = express()
var API = express.Router()
var server = http.createServer(app)
var proxy = httpProxy.createProxyServer()
var targets = {}

function exitIfEmpty() {
  if (Object.keys(targets).length === 0) {
    util.log('Exit (no more servers)')
    process.exit()
  }
}

API.get('/', function (req, res) {
  res.send(targets)
})

API.post('/', function (req, res) {
  util.log('Add ' + JSON.stringify(req.body))
  targets[req.body.name] = req.body.port
  res.end()
})

API.delete('/:name', function (req, res) {
  util.log('Remove ' + req.params.name)
  delete targets[req.params.name]
  res.end()
  exitIfEmpty()
})

function getTarget (req) {
  var name = req.headers.host.split('.').slice(0, -6).pop()
  var port = targets[name]
  if (port) return 'http://127.0.0.1:' + port
}

function routeWS (req, socket, head) {
  var target = getTarget(req)
  if (target) proxy.ws(req, socket, head, { target: target }, function (err) {
    console.log('Can\'t proxy WebSocket')
  })
}

function routeHTTP (req, res, next) {
  if (req.hostname.indexOf('.xip.io') === -1) return next()

  var target = getTarget(req)
  if (target) {
    proxy.web(req, res, { target: target }, function (err) {
      res.status(502).send(err.stack)
    })
  } else {
    res.sendStatus(404)
  }
}

app.use(morgan(':method :req[host] :url :status :res[content-length] - :response-time ms'))
app.use(routeHTTP)
app.use('/_targets', bodyParser.json(), API)
app.use(serveStatic(path.join(__dirname, 'public')))
server.on('upgrade', routeWS)
server.listen(PORT, function () {
  util.log('Listening on port ' + PORT)
})


