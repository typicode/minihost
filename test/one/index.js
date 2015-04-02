var app = require('express')()
var server = require('http').createServer(app)
var bodyParser = require('body-parser')
var WebSocketServer = require('websocket').server

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.end('OK')
})

app.get('/some/path', function (req, res) {
  console.log('Test server GET', req.url, req.query)
  res.send(req.query.msg)
})

app.post('/some/path', function (req, res) {
  console.log('Test server POST', req.url, req.body)
  res.send(req.body.msg)
})

wsServer = new WebSocketServer({ httpServer: server })

wsServer.on('request', function (request) {
  console.log('Test server WebSocket request')
  request.accept('echo-protocol', request.origin)
})

server.listen(process.env.PORT, function () {
  console.log('Test server listening on ' +  process.env.PORT)
})