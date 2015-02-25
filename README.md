# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about it.

## Usage

Prefix your commands with `h`

```bash
~/front$ h gulp server
~/express$ h nodemon
```

Your servers are now accessible at

```
http://front.127.0.0.1.xip.io:3000
http://express.127.0.0.1.xip.io:3000
```

To list running servers, simply go to

```
http://localhost:3000
```

## Install

```
npm install -g minihost
```

## Supporting minihost

minihost expects your servers to bind themselves to the `PORT` environment variable so it can proxy requests.

Here are two ways to do it.

```javascript
// In your server code
app.listen(process.env.PORT || 3000);
```

```bash
# From the command line
h 'sh -c some_server $PORT'
```

## Configure

By default, minihost listens on port 3000. To change this, run

```
npm config set minihost:port 8080
```

## License

MIT
