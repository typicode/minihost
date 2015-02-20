# minihost

[![Build Status](https://travis-ci.org/typicode/minihost.svg?branch=master)](https://travis-ci.org/typicode/minihost)

When working with many dev servers, you have to increment port (e.g. http://localhost:[3000](), http://localhost:[4000](), ...) and remember on which they are.

With minihost, all your servers are on port [3000]().

## Installation

```
npm install -g minihost
```

## Usage

Simply prefix your commands with `h`

```bash
~/projects/express$ h nodemon
~/projects/front$ h gulp server
# http://localhost:3000/express
# http://localhost:3000/front
```

## License

MIT
