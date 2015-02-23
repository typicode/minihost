# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about it. All your servers are in one place :)

## Usage

Simply prefix your commands with `h`

```bash
~/front$   h gulp server
~/express$ h nodemon
```

You can then access your servers on

```
http://localhost:3000/front
http://localhost:3000/express
```

To list running servers, go to

```
http://localhost:3000
```

To use a custom name, add `-n` option

```bash
~/express$ h -n api -- node index.js
http://localhost:3000/api
```

## Install

```
npm install -g minihost
```

## How it works

minihost assumes that your web app binds itself to the PORT environment variable so it can properly proxy requests to your app.

For example:

```javascript
var port = process.env.PORT || defaultPort;
app.listen(port);
```

## License

MIT
