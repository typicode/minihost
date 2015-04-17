# minihost [![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost) [![npm version](https://badge.fury.io/js/minihost.svg)](http://badge.fury.io/js/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about that.

## Example

```bash
~/app$ h -- nodemon
~/app$ curl http://app.127.0.0.1.xip.io:2000
```

## Features

* Small (~300 loc)
* Supports OS X, Linux, Windows
* Compatible with any domain that resolves to 127.0.0.1

## Usage

Install:

```
npm install -g minihost
```

Prefix your commands with `h`:

```bash
~/one$ h -- nodemon
~/two$ h -- npm start
```

You can then __view your running servers on `http://localhost:2000`__ and __access them locally on `http://<name>*:2000`__ using any host that resolves to `127.0.0.1`.

For example:

```bash
# Using dnsmasq and a local .dev domain
http://one.dev:2000
http://two.dev:2000

# Using /etc/hosts
http://one:2000
http://two:2000
```

Public wildcard domain names that resolves to `127.0.0.1` are also supported:

```bash
# See readme.localtest.me
http://one.localtest.me:2000
http://two.localtest.me:2000

# See xip.io
http://one.127.0.0.1.xip.io:2000
http://two.127.0.0.1.xip.io:2000
```

To set a custom name, add `-n`:

```bash
~/one$ h -n app -- nodemon
```

To change the port minihost listens to, run:

```bash
echo 8000 > ~/.minihost
```

## Supporting minihost

For minihost to work, your server need to listen on the PORT environment variable.

From your code:

```javascript
// KO
app.listen(3000);

// OK
app.listen(process.env.PORT || 3000);
```

Or from the command-line:

```bash
h -- 'cmd -p $PORT'
```

## License

MIT - [Typicode](https://github.com/typicode)
