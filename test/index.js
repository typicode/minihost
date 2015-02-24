var spawn = require('child_process').spawn
var supertest = require('supertest')
var test = require('tape')
var pkg = require('../package.json')

var request = supertest('http://localhost:3000')

function h (str, cb) {
  var args = [__dirname + '/../' + pkg.bin.h].concat(str.split(' '))
  var opts = {
    cwd: __dirname + '/one',
    stdio: 'inherit'
  }
  var proc = spawn('node', args, opts)

  proc.on('error', function(err) {
    console.error('Can\'t start command line interface')
    throw err
  })

  setTimeout(function () {
    cb(proc)
  }, 1000)
}

test(
  '\n~/test/one$ h node index.js' +
  '\n~/test/one$ h -n two -- node index.js',
  function (t) {
    function should (msg) {
      return function (err) {
        t.error(err, 'Daemon should ' + msg)
      }
    }

    t.plan(10)

    h('node index.js', function (one) {
      h('-n two -- node index.js', function (two) {
        request
          .get('/')
          .expect(200)
          .expect(/minihost/)
          .end(should('have homepage'))

        request
          .get('/_servers')
          .expect(200)
          .expect(/one/)
          .expect(/two/)
          .end(should('list server one and two'))

        request
          .get('/one/some/path?msg=hello')
          .expect(200)
          .expect('hello')
          .end(should('proxy GET'))

        request
          .post('/one/some/path')
          .send({ msg: 'hello' })
          .expect(200)
          .expect('hello')
          .end(should('proxy POST'))

        supertest('http://127.0.0.1:3000')
          .get('/some/path?msg=hello')
          .set('Host', 'one')
          .expect(200)
          .expect('hello')
          .end(should('support vhost'))

        supertest('http://127.0.0.1:3000')
          .get('/some/path?msg=hello')
          .set('Host', 'one.127.0.0.1.xip.io')
          .expect(200)
          .expect('hello')
          .end(should('support xip.io'))

        setTimeout(function () {
          one.kill()
          one.on('exit', function () {
            request
              .get('/_servers')
              .expect(200)
              .expect(/^((?!one).)*$/)
              .end(should('not list server one'))

            request
              .get('/one')
              .expect(404)
              .end(should('not proxy'))

            request
              .get('/two')
              .expect(200)
              .end(should('still proxy'))

            setTimeout(function () {
              two.kill()
              two.on('exit', function () {
                request
                  .get('/')
                  .end(function (err) {
                    var msg = 'Daemon should be stopped when no more servers ' +
                              'are running'
                    t.notEqual(err, null, msg)
                  })
              })
            }, 200)
          })
        }, 200)
    })
  })
})