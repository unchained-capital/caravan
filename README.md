# Caravan - Stateless Multisig Coordinator

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Build Status](https://travis-ci.com/unchained-capital/caravan.svg?branch=master)](https://travis-ci.com/unchained-capital/caravan)
[![dependencies Status](https://david-dm.org/unchained-capital/caravan/status.svg)](https://david-dm.org/unchained-capital/caravan)
[![devDependencies Status](https://david-dm.org/unchained-capital/caravan/dev-status.svg)](https://david-dm.org/unchained-capital/caravan?type=dev)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Caravan is making bitcoin multisig custody easier and safer through
transparency and standards.

Caravan is a coordination software. It connects to a source of
consensus and your keys to build and interact with multisig bitcoin
addresses.

Caravan is also stateless. It does not itself store any data. You must
safekeep the addresses (and redeem scripts & BIP32 paths) you create.

[Try Caravan now!](https://unchained-capital.github.io/caravan)

## Installation

Caravan is a stateless pure HTML & JavaScript web application. It can
be run in any web browser from a local or remote installation.

### Unchained Capital GitHub

The simplest way to use Caravan is to visit
[https://unchained-capital.github.io/caravan](https://unchained-capital.github.io/caravan),
a copy of Caravan hosted on GitHub by
[Unchained Capital](https://www.unchained.com).

### Your Own GitHub

If you would prefer to host your own copy of Caravan on GitHub, you
can do so by first forking the
[Caravan repository](https://github.com/unchained-capital/caravan)
into your own GitHub organization. You should see a copy of the
Caravan web application at
`https://YOUR_GITHUB_USERNAME.github.io/caravan`.

If not, go to the (newly forked) repository's "Settings" page and
scroll down to the "GitHub Pages" section. Ensure you see a message
saying "Your site is published at ...".

### Host Locally

You can always clone the source code of Caravan to your local machine
and run it from there. You will require a recent `npm` installation.

```bash
$ git clone https://github.com/unchained-capital/caravan
...
$ cd caravan
$ npm install
...
$ npm run dev
...
```

Now visit `https://localhost:5137` to interact with your local copy of
Caravan.

### Host Remotely

Once you have downloaded the source code and used `npm` to install
dependences (see section above), you can pre-build the React
application for a production deployment and then host the contents of
the resulting `build` directory via a webserver such as `nginx`.

```bash
$ npm run build
...
```

You can test the production build locally at `http://localhost:4173/` by running:

```bash
$ npm start
...
```

### Docker

A basic dockerfile which builds the app and serves it via nginx is included in the repository

To build the docker image:

```bash
docker build . -t caravan:latest
```

To run the built docker image:

```bash
docker run -p 80:8000 caravan:latest
```

Caravan should then be accessible at http://localhost:8000/caravan

## Usage

If you can access the [Caravan web
application](https://unchained-capital.github.io/caravan) in your
browser, you are ready to start using Caravan.

Click the _Create_ or _Interact_ links in the navbar to get started.

See our [YouTube
playlist](https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH)
for some tutorial videos.

### Keys

Caravan can connect to several different hardware wallets and key
management software.

- [Trezor One](https://shop.trezor.io/product/trezor-one-white) (installing the Trezor Bridge is required to interact with a Trezor device)
- [Trezor Model T](https://shop.trezor.io/product/trezor-model-t) (installing the Trezor Bridge is required to interact with a Trezor device)

- [Ledger Nano S](https://www.ledger.com/products/ledger-nano-s)
- [Ledger Nano X](https://www.ledger.com/products/ledger-nano-x)

- [Coldcard Mk2, Mk3, & Mk4](https://coldcard.com/)

- [Hermit](https://github.com/unchained-capital/hermit)

Caravan also accepts public keys and signatures as text so any wallet
which can export these data can be made to work with Caravan.

### Consensus

By default, Caravan uses a free API provided by
[mempool.space](https://mempool.space) whenever it needs
information about the bitcoin blockchain or to broadcast transactions.

You can ask Caravan to use your own private [bitcoind full
node](https://bitcoin.org/en/full-node).

#### Adding CORS Headers

When asking Caravan to use a private bitcoind node, you may run into
[CORS issues](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
This is because [bitcoin-core](https://github.com/bitcoin/bitcoin/pull/12040)
does not natively support CORS headers. Because of how `caravan` is designed,
CORS headers are essential to protecting the security of your coins and you will
need to add the appropriate headers.

To correct this problem, you must add appropriate access control
headers to your node's HTTP responses. When running Caravan on your
local machine, for example, you may need to set
`Access-Control-Allow-Origin: https://localhost:5137`.

This can be done using a webserver such as
[nginx](https://www.nginx.com) or [Apache](https://httpd.apache.org),
a proxy tool such as [mitmproxy](https://mitmproxy.org), or even just
a script.

A particularly simple way to proxy requests to a private bitcoind node
is to make use of [`nginx`](https://nginx.org/). Instructions to install
and run the program are on its [download page](https://nginx.org/en/download.html).

Explicitly, install `nginx` with

```bash
# MacOS
brew install nginx

# Debian Linux
sudo apt install nginx
```

Copy the server conifiguration file, `bitcoind.proxy`, to the appropriate location with the following
commands. Note, these commands assume that you are in the base `caravan` directory. An example configuration
file is included with the `caravan` source code called `bitcoind.proxy` which will, by defualt, enable a mainnet
proxy. The testnet proxy is included, but is commented out.

```bash
# MacOS
mkdir -p /usr/local/etc/nginx/sites-available
cp bitcoind.proxy /usr/local/etc/nginx/sites-available/
ln -s /usr/local/etc/nginx/sites-available/bitcoind.proxy /usr/local/etc/nginx/servers/bitcoind.proxy

# Debain Linux
sudo mkdir -p /etc/nginx/sites-available
sudo cp bitcoind.proxy /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/bitcoind.proxy /etc/nginx/sites-enabled/bitcoind.proxy
```

Different linux distributions follow different conventions for the `/etc/nginx/` directory structure.
As an example, MacOS uses `etc/nginx/servers` and Debian distributions use `/etc/nginx/sites-enabled/`
for the website configuration files. You will need to check the `/etc/nginx/nginx.conf` file to see what
the convention is. This snipet is from a machine using Ubuntu 18.04 LTS. Note the two directories
that are included. Whereas on MacOS there is only one `include` directory, `include servers/*;`.

```nginx
http {
  ...
  ##
  # Virtual Host Configs
  ##

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;
}
```

[Arch Linux](https://wiki.archlinux.org/index.php/nginx#Configuration) provides more details on how to configure
`nginx` for that distribution. It may be as simple as adding `include /etc/nginx/sites-enabled/*;` in the `http` block
of `/etc/nginx/nginx.conf` and then:

```bash
sudo mkdir -p /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/bitcoind.proxy /etc/nginx/sites-enabled/bitcoind.proxy
```

Check that everything is copied correctly, properly configured, and that there are no errors in the syntax:

```bash
$ nginx -t
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful
```

Start `nginx`

```bash
# MacOS
brew services start nginx
# or if nginx is already running
brew services reload nginx

# Debain Linux
sudo systemctl start nginx
# or if nginx is already running
sudo systemctl restart nginx
```

On MacOS, starting the `nginx` daemon will prompt a popup window asking if you want `ngingx`
to allow incoming network connections, which you will want to allow.

Test the different ports where `my_uname` is the user specified in the `bitcoin.conf` line
`rpcauth=my_uname:` (Don't use this username!):

```bash
# Test that bitcoin rpc is functioning correctly
curl --user my_uname --data-binary \
'{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": [] }' \
-H 'content-type: text/plain;' http://127.0.0.1:8332
# Test the nginx reverse proxy
curl --user my_uname --data-binary \
'{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": [] }' \
-H 'content-type: text/plain;' --resolve bitcoind.localhost:8080:127.0.0.1 http://bitcoind.localhost:8080
```

Both tests should result in the same output with the current block height, e.g.

```json
{ "result": 668255, "error": null, "id": "curltest" }
```

If you are running a bitcoind node on the same machine as Caravan,
on port 8332, and you run `nginx` with the default settings,
you should be able to point Caravan at 'http://bitcoind.localhost:8080'
to communicate with your node. If you have bitcoind running on a different machine,
you will need to adjust the `upstream` block in `bitcoind.proxy` for the correct
network address:port. Don't forget to add the the correct `rpcallowip=LOCAL_MACHINE_IP`
to the remote machine's `bitcoin.conf`.

Because the `nginx` configuration depends entirely on what is specified in
the `upstream` block it is STRONGLY reccommended to keep `bitcoind` reserved
for the mainnet and `testnet` for the testnet. In this way, `nginx` could be
configured to simultaneously provide a reverse proxy to the mainnet via
'http://bitcoind.localhost:8080' and to the testnet via 'http://testnet.localhost:8080'.

##### mainnet `nginx` template

```nginx
upstream bitcoind {
  server 127.0.0.1:8332;
}

server {
  listen 8080;
  server_name bitcoind.localhost;

  location / {
    ...
    proxy_pass http://bitcoind;
    ...
  }
}
```

##### testnet `nginx` template

```nginx
upstream testnet {
  server 127.0.0.1:18332;
}

server {
  listen 8080;
  server_name testnet.localhost;

  location / {
    ...
    proxy_pass http://testnet;
    ...
  }
}
```

#### Adding CORS Headers (Deprecated)

A particularly simple way to proxy requests to a private bitcoind node
is to make use of the [`corsproxy`](https://www.npmjs.com/package/corsproxy)
npm module. Instructions to install and run the module are on its
[home page](https://www.npmjs.com/package/corsproxy). `corsproxy` has not
been updated in a number of years and will require an earlier version of `node`
to function properly.

Explicitly, install `corsproxy` with

```bash
npm install -g corsproxy
```

and then launch corsproxy

```bash
$ corsproxy
[log,info], data: CORS Proxy running at: http://localhost:1337
...
```

If you are running a bitcoind node on the same machine as Caravan,
on port 8332, and you run `corsproxy` with the default settings,
you should be able to point Caravan at 'http://localhost:1337/localhost:8332'
to communicate with your node. A testnet node would be running on a
different port, for example: `http://localhost:1337/localhost:18332`, and you
would need to point Caravan to that URL instead.

Finally, a testnet/regtest node running on a different machine but still on the same
network might be accessible to you via `http://localhost:1337/192.168.0.22:18332`, but
you need to make sure the ports are open and accessible. It should be clear at this
point that if corsproxy is running, paste your node's IP:port on the end of the
`corsproxy` URL: `http://localhost:1337/`

## Contributing

Please see the [`CONTRIBUTING.md`](./CONTRIBUTING.md) and the open [GitHub Issues](https://github.com/unchained-capital/caravan/issues)
