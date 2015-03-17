# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost) [![npm version](https://badge.fury.io/js/minihost.svg)](http://badge.fury.io/js/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about it.

## Usage

Prefix your commands with `h`

```bash
~/front$ h -- gulp server
~/express$ h -- nodemon
```

Your servers are now accessible at

```
http://front.127.0.0.1.xip.io:2000
http://express.127.0.0.1.xip.io:2000
```

To list running servers, simply go to

```
http://localhost:2000
```

## Install

```
npm install -g minihost
```

## Supporting minihost

minihost expects your servers to bind themselves to the `PORT` environment variable so it can proxy requests.

You can do so from your server code or the command line

```javascript
app.listen(process.env.PORT || 3000);
```

```bash
h sh -c 'some_server $PORT'
```

## Configure

By default, minihost listens on port 2000. To change this, run

```
echo 8000 > ~/.minihost
```

## License

MIT
