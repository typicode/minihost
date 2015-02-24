var path = require('path')
var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var vhost = require('vhost')
var httpProxy = require('http-proxy')
var util = require('util')

var PORT = process.env.PORT
var app = express()
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

function route (req, res, name) {
  var port = list[name]
  var target = 'http://127.0.0.1:' + port

  if (port) {
    util.log('Found ' + name)
    proxy.web(req, res, { target: target }, function (err) {
      res.status(502).send(err.stack)
    })
  } else {
    util.log('Cannot find ' + name)
    res.sendStatus(404)
  }
}

function hostRoute (req, res) {
  route(req, res, req.vhost.hostname)
}

function xipRoute (req, res) {
  route(req, res, req.vhost[0])
}

function paramRoute (req, res) {
  route(req, res, req.params.name)
}

app.use(morgan(':method :req[host] :url :status :res[content-length] - :response-time ms'))
app.use(serveStatic(path.join(__dirname, 'public')))
app.use('/_servers', bodyParser.json(), api)
app.use(vhost('*.*.*.*.*.xip.io', xipRoute))
app.use(vhost(/^(?!localhost).*$/, hostRoute))
app.use('/:name', paramRoute)

app.listen(PORT, function () {
  util.log('Listening on port ' + PORT)
})
