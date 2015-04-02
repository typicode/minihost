# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost) [![npm version](https://badge.fury.io/js/minihost.svg)](http://badge.fury.io/js/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about that.

## Install

```
npm install -g minihost
```

## Usage

Let's say you want to start two servers, prefix your commands with `h`

```bash
~/one$ h -- nodemon
~/two$ h -- npm start
```

minihost will start them on free ports and make them accessible on virtual hosts

```
http://one.127.0.0.1.xip.io:2000
http://two.127.0.0.1.xip.io:2000
```

To list running servers, simply go to

```
http://localhost:2000
```

## Supporting minihost

For minihost to work, you need to have your server listening on the PORT environment variable. For example:

```javascript
var port = process.env.PORT || 3000
app.listen(port);
```

As a convenience, you can also use `[PORT]` to pass it from the command-line interface.

```bash
h -- cmd -p [PORT]
```

## Options

To set a custom name

```bash
h -n app -- nodemon
```

To change the port minihost listens to

```bash
echo 8000 > ~/.minihost
```

## License

MIT - [Typicode](https://github.com/typicode)
