# minihost [![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost) [![npm version](https://badge.fury.io/js/minihost.svg)](http://badge.fury.io/js/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about that.

Works on Windows, Linux and OS X.

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

You can then __view your running servers__ on `http://localhost:2000` and __access them locally__ on `http://<name>*:2000` using any host that resolves to `127.0.0.1`.

For example:

```bash
# Using dnsmasq and a local .dev domain
# Or /etc/hosts
http://one.dev:2000
http://two.dev:2000
```

Public wildcard domain names that resolves to `127.0.0.1` are also supported and can be used without any system configuration:

```bash
# See til.io
http://one.til.io:2000
http://two.til.io:2000

# See xip.io
http://one.127.0.0.1.xip.io:2000
http://two.127.0.0.1.xip.io:2000
```

To set a custom name, add `-n`:

```bash
~/one$ h -n app -- nodemon
```

To set a custom port environment variable name (instead of default `PORT`), add it after colon in custom name:

```bash
~/one$ h -n app:APP_PORT -- nodemon
```

To enable multiple names and ports repeat `-n` option:

```bash
~/one$ h -n app1:APP1_PORT -n app2:APP_PORT1 -- nodemon
```
*If custom env variable names for ports not defined, `PORT_0`, `PORT_1`, `...` will be used.*  

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
h -- 'cmd -p $PORT'  # Linux, OS X
h -- "cmd -p %PORT%" # Windows
```

## License

MIT - [Typicode](https://github.com/typicode)
