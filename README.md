# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost)

When working with many dev servers, you have to increment and remember ports (e.g. [http://localhost:3000](), [http://localhost:4000](), ...).

With minihost, you don't have to think about it. All your servers are in one place :)

## Usage

Prefix your commands with `h`

```bash
~/front$   h gulp server
~/express$ h nodemon
```

You can then access your servers on

```
http://localhost:3000/front
http://localhost:3000/express
```

And list them on

```
http://localhost:3000
```

## Install

```
npm install -g minihost
```

## How it works

Minihost assumes that your web app binds itself to the PORT environment variable so it can properly proxy requests to your app.

## License

MIT
