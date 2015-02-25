var path = require('path')
var http = require('http')
var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var vhost = require('vhost')
var httpProxy = require('http-proxy')
var util = require('util')

var PORT = process.env.PORT
var app = express()
var server = http.createServer(app)
var proxy = httpProxy.createProxyServer()
var list = {}

var api = express.Router()
  .get('/', function (req, res) {
    res.send(list)
  })
  .post('/', function (req, res) {
    util.log('Add ' + JSON.stringify(req.body))
    list[req.body.name] = req.body.port
    res.end()
  })
  .delete('/:name', function (req, res) {
    util.log('Remove ' + req.params.name)
    delete list[req.params.name]
    res.end()
    if (Object.keys(list).length === 0) {
      util.log('Exit (no more servers)')
      process.exit()
    }
  })

function getTarget (req) {
  var name = req.headers.host.split('.').slice(0, -6).pop()
  var port = list[name]
  if (port) return 'http://127.0.0.1:' + port
}

function routeWS (req, socket, head) {
  var target = getTarget(req)
  if (target) proxy.ws(req, socket, head, { target: target }, function (err) {
    console.log('Can\'t proxy WebSocket')
  })
}

function routeHTTP (req, res) {
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
app.use(serveStatic(path.join(__dirname, 'public')))
app.use('/_servers', bodyParser.json(), api)
app.use(routeHTTP)
server.on('upgrade', routeWS)
server.listen(PORT, function () {
  util.log('Listening on port ' + PORT)
})


