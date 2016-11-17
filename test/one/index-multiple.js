var app = require('express')()

app.get('/', function (req, res) {
  res.end('OK')
})

app.listen(process.env.PORT, function () {
  console.log('Test server 1 listening on ' +  process.env.PORT)
})

var app2 = require('express')()

app2.get('/', function (req, res) {
  res.end('OK')
})

app2.listen(process.env.PORT_0, function () {
  console.log('Test server 2 listening on ' +  process.env.PORT_0)
})