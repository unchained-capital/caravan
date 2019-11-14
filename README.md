# Caravan - Stateless Multisig Coordinator

[![Build Status](https://travis-ci.com/unchained-capital/caravan.svg?branch=master)](https://travis-ci.com/unchained-capital/caravan)

Caravan is making bitcoin multisig custody easier and safer through
transparency and standards.

Caravan is a coordination software. It connects to a source of
consensus and your keys to build and interact with multisig bitcoin
addresses.

Caravan is also stateless. It does not itself store any data. You must
safekeep the addresses (and redeem scripts & BIP32 paths) you create.

[Try Caravan now!](https://unchained-capital.github.io/caravan)

## Installation

Caravan is a stateless pure HTML & JavaScript web application.  It can
be run in any web browser from a local or remote installation.

### Unchained Capital GitHub

The simplest way to use Caravan is to visit
[https://unchained-capital.github.io/caravan](https://unchained-capital.github.io/caravan),
a copy of Caravan hosted on GitHub by
[Unchained Capital](https://www.unchained-capital.com).

### Your Own GitHub

If you would prefer to host your own copy of Caravan on GitHub, you
can do so by first forking the
[Caravan repository](https://github.com/unchained-capital/caravan)
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

If you can access the [Caravan web
application](https://unchained-capital.github.io/caravan) in your
browser, you are ready to start using Caravan.

Click the *Create* or *Interact* links in the navbar to get started.

See our [YouTube
playlist](https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH)
for some tutorial videos.

### Keys

Caravan can connect to several different hardware wallets and key
management software.

* [Trezor One](https://shop.trezor.io/product/trezor-one-white) (installing the Trezor Bridge is required to interact with a Trezor device)

* [Ledger Nano S](https://www.ledger.com/products/ledger-nano-s)

* [Hermit](https://github.com/unchained-capital/hermit)

Caravan also accepts public keys and signatures as text so any wallet
which can export these data can be made to work with Caravan.

### Consensus

By default, Caravan uses a free API provided by
[blockstream.info](https://blockstream.info) whenever it needs
information about the bitcoin blockchain or to broadcast transactions.

You can ask Caravan to use your own private [bitcoind full
node](https://bitcoin.org/en/full-node).

#### Adding CORS Headers

When asking Caravan to use a private bitcoind node you may run into
[CORS issues](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

To correct this problem, you must add appropriate access control
headers to your node's HTTP responses.  When running Caravan on your
local machine, for example, you may need to set
`Access-Control-Allow-Origin: https://localhost:3000`.

This can be done using a webserver such as
[nginx](https://www.nginx.com) or [Apache](https://httpd.apache.org),
a proxy tool such as [mitmproxy](https://mitmproxy.org), or even just
a script.

A particularly simple way to proxy requests to a private bitcoind node
is to make use of the [`corsproxy`](https://www.npmjs.com/package/corsproxy)
npm module. Instructions to install and run the module are on its
[home page](https://www.npmjs.com/package/corsproxy).
If you are running a local bitcoind node on your local machine on port 8332,
and you run `corsproxy` with the default settings, you should be able to
point caravan at 'http://localhost:1337/localhost:8332'.
