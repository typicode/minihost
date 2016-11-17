var app = require('express')()

app.get('/', function (req, res) {
  res.end('OK')
})

app.listen(process.env.CUSTOM_PORT, function () {
  console.log('Test server listening on ' +  process.env.CUSTOM_PORT)
})