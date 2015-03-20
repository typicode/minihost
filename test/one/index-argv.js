var app = require('express')()

app.get('/', function (req, res) {
  res.end('OK')
})

app.listen(process.argv[2], function () {
  console.log('Test server listening on ' +  process.env.PORT)
})