var express = require('express')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.end()
})

app.get('/some/path', function (req, res) {
  console.log('Test server GET', req.url, req.query)
  res.send(req.query.msg)
})

app.post('/some/path', function (req, res) {
  console.log('Test server POST', req.url, req.body)
  res.send(req.body.msg)
})

app.listen(process.env.PORT, function () {
  console.log('Test server listening on ' +  process.env.PORT)
})