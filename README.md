# Caravan - Stateless Multisig Coordinator

[![Build Status](https://travis-ci.com/unchained-capital/caravan.svg?branch=master)](https://travis-ci.com/unchained-capital/caravan)

Caravan is making bitcoin multisig custody easier and safer through
transparency and standards.

Caravan is a coordination software. It connects to a source of
consensus and your keys to build and interact with multisig bitcoin
addresses.

Caravan is also stateless. It does not itself store any data. You must
safekeep the addresses (and redeem scripts & BIP32 paths) you create.

## Installation

Caravan is a stateless pure HTML & JavaScript web application.  It can
be run in any web browser from a local or remote installation.

### Unchained Capital GitHub

The simplest way to use Caravan is to visit
[https://unchained-capital.github.io/caravan](https://unchained-capital.github.io/caravan),
a copy of Caravan hosted on GitHub by
[https://www.unchained-capital.com](Unchained Capital).

### Your Own GitHub

If you would prefer to host your own copy of Caravan on GitHub, you
can do so by first forking the
[https://github.com/unchained-capital/caravan](Caravan repository)
into your own GitHub organization.  You should see a copy of the
Caravan web application at
`https://YOUR_GITHUB_USERNAME.github.io/caravan`.

If not, go to the (newly forked) repository's "Settings" page and
scroll down to the "GitHub Pages" section.  Ensure you see a message
saying "Your site is published at ...".

### Host Locally

You can always clone the source code of Caravan to your local machine
and run it from there.  You will require a recent `npm` installation.

```
$ git clone https://github.com/unchained-capital/caravan
...
$ cd caravan
$ npm install
...
$ npm start
...
```

Now visit `https://localhost:3000` to interact with your local copy of
Caravan.

### Host Remotely

Once you have downloaded the source code and used `npm` to install
dependences (see section above), you can pre-build the React
application for a production deployment and then host the contents of
the resulting `build` directory via a webserver such as `nginx`.

```
$ npm run build
...
```

## Usage

If you can access the Caravan web application in your browser, you are
ready to use Caravan.

See our [YouTube playlist](https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH) for some tutorial videos.

