# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.2](https://github.com/unchained-capital/caravan/compare/caravan-v1.0.1...caravan-v1.0.2) (2024-01-29)


### Bug Fixes

* **dependencies:** bump uc-wallets for trezor fix ([139e8fd](https://github.com/unchained-capital/caravan/commit/139e8fd1c45ec95570acb66e0258a253f3904b0a))

## [1.0.1](https://github.com/unchained-capital/caravan/compare/caravan-v1.0.0...caravan-v1.0.1) (2024-01-10)


### Bug Fixes

* **build:** pass git sha to build properly ([a93d65b](https://github.com/unchained-capital/caravan/commit/a93d65bcab59855ed1049e776374931c5c0f5c1c))

## [1.0.0](https://github.com/unchained-capital/caravan/compare/caravan-v0.7.0...caravan-v1.0.0) (2024-01-10)


### ⚠ BREAKING CHANGES

* adds typescript and node v20 support ([#350](https://github.com/unchained-capital/caravan/issues/350))

### Features

* adds typescript and node v20 support ([#350](https://github.com/unchained-capital/caravan/issues/350)) ([f5c3e90](https://github.com/unchained-capital/caravan/commit/f5c3e90d839f8ac2cc9378b5ddbadc6cb0f41ddc))
* unblock fee rate limit ([ba5de57](https://github.com/unchained-capital/caravan/commit/ba5de57894bf2db87875235d20fbc18091ef78af))


### Bug Fixes

* **deps:** upgrade uc-bitcoin dep for fixture fix ([67077c2](https://github.com/unchained-capital/caravan/commit/67077c2136bdbb7c6dd3366ab5acdc5f3428e706))
* incorrect fee error check conditional operator ([2b417c6](https://github.com/unchained-capital/caravan/commit/2b417c623990f1de5ef41f7910f81c1fb17a056e))
* max spend button ([0884745](https://github.com/unchained-capital/caravan/commit/0884745b1252c762d5f1f15b071a2189fd0ae240))
* more dependency cleanup ([593c48d](https://github.com/unchained-capital/caravan/commit/593c48d30fc5d4e017cf34a7414bae4ec3938c9f))
* psbt download in coldcard test suite ([cd88354](https://github.com/unchained-capital/caravan/commit/cd883540084764feb378f44adbdbabf32cb84051))
* **test-suite:** key origins sorted by base58 xpub ([444e083](https://github.com/unchained-capital/caravan/commit/444e0838ef723db00974b2f57f2a205b62ac3668))
* upgrade uc-bitcoin and pin broken ledger deps ([64b9613](https://github.com/unchained-capital/caravan/commit/64b961335a4d5c0bc565163dc6e87f1ab750f6e7))
* utility accepts string instead of BN ([607d9b8](https://github.com/unchained-capital/caravan/commit/607d9b8c6461d4762f0f5873c5a7045eba9a9e9f))

## [0.7.0](https://github.com/unchained-capital/caravan/compare/caravan-v0.6.3...caravan-v0.7.0) (2023-10-23)


### Features

* **hermit:** hermit PSBT signing for pre-product key recovery ([#308](https://github.com/unchained-capital/caravan/issues/308)) ([04ca0ce](https://github.com/unchained-capital/caravan/commit/04ca0ce3ffa2589a00104ecd18cf11768212f470))

## [0.6.3](https://github.com/unchained-capital/caravan/compare/caravan-v0.6.2...caravan-v0.6.3) (2023-10-18)


### Bug Fixes

* **deps:** bump @babel/traverse from 7.21.3 to 7.23.2 ([#344](https://github.com/unchained-capital/caravan/issues/344)) ([5f231e0](https://github.com/unchained-capital/caravan/commit/5f231e03042006ecc1f72043f42bb6c7266dbecd))

## [0.6.2](https://github.com/unchained-capital/caravan/compare/caravan-v0.6.1...caravan-v0.6.2) (2023-07-18)


### Bug Fixes

* **sign:** pass wallet uuid for signing ([a748d97](https://github.com/unchained-capital/caravan/commit/a748d97d3bfe796487270ca7a41144b629df17a7))

## [0.6.1](https://github.com/unchained-capital/caravan/compare/caravan-v0.6.0...caravan-v0.6.1) (2023-07-13)


### Bug Fixes

* addressType conflict check not applicable for text xpubs ([185fc01](https://github.com/unchained-capital/caravan/commit/185fc01bcd6c02301fb787229ffcc8f0c4c6cd45))
* **build:** bring back hash routing ([ed83bf4](https://github.com/unchained-capital/caravan/commit/ed83bf4b6765294180ea96b11898cb1a42adfc42))
* **scriptexplorer:** change the error message for spending from new wallet ([1923dad](https://github.com/unchained-capital/caravan/commit/1923dad0d5fdc61fe88d729d6e850cee8a22e0f1)), closes [#172](https://github.com/unchained-capital/caravan/issues/172)
* **scriptexplorer:** show error message trown in fethUTXOs ([158fb61](https://github.com/unchained-capital/caravan/commit/158fb6154856909f4de77a49eaeac24cbd4a42d2)), closes [#172](https://github.com/unchained-capital/caravan/issues/172)
* **scriptexplorer:** when no error is trown check for 0 balance ([cb96364](https://github.com/unchained-capital/caravan/commit/cb96364922f61e922be30b67fc39eda2fd233dce))
* **wallet:** add delay to address and utxo calls ([d9774c1](https://github.com/unchained-capital/caravan/commit/d9774c1c7e28021a48efa30666c6ceb9e75cd1da)), closes [#317](https://github.com/unchained-capital/caravan/issues/317)

### [0.6.1](https://github.com/unchained-capital/caravan/compare/v0.5.0...v0.6.1) (2023-06-29)


### Features

* add support for wallet uuid in configs ([#297](https://github.com/unchained-capital/caravan/issues/297)) ([6675db4](https://github.com/unchained-capital/caravan/commit/6675db41bb14331c2e6de7d377bb8003ee824c28))


### Bug Fixes

* bad import ([#299](https://github.com/unchained-capital/caravan/issues/299)) ([e646ebb](https://github.com/unchained-capital/caravan/commit/e646ebb0b26f2bf5318a19829c1bbf9cb7c8327d))
* **scriptexplorer:** change the error message for spending from new wallet ([1923dad](https://github.com/unchained-capital/caravan/commit/1923dad0d5fdc61fe88d729d6e850cee8a22e0f1)), closes [#172](https://github.com/unchained-capital/caravan/issues/172)
* **scriptexplorer:** show error message trown in fethUTXOs ([158fb61](https://github.com/unchained-capital/caravan/commit/158fb6154856909f4de77a49eaeac24cbd4a42d2)), closes [#172](https://github.com/unchained-capital/caravan/issues/172)
* **scriptexplorer:** when no error is trown check for 0 balance ([cb96364](https://github.com/unchained-capital/caravan/commit/cb96364922f61e922be30b67fc39eda2fd233dce))
* **wallet:** add delay to address and utxo calls ([d9774c1](https://github.com/unchained-capital/caravan/commit/d9774c1c7e28021a48efa30666c6ceb9e75cd1da)), closes [#317](https://github.com/unchained-capital/caravan/issues/317)

## [0.6.0](https://github.com/unchained-capital/caravan/compare/caravan-v0.5.0...caravan-v0.6.0) (2023-04-17)


### Features

* add support for wallet uuid in configs ([#297](https://github.com/unchained-capital/caravan/issues/297)) ([6675db4](https://github.com/unchained-capital/caravan/commit/6675db41bb14331c2e6de7d377bb8003ee824c28))


### Bug Fixes

* bad import ([#299](https://github.com/unchained-capital/caravan/issues/299)) ([e646ebb](https://github.com/unchained-capital/caravan/commit/e646ebb0b26f2bf5318a19829c1bbf9cb7c8327d))

### [0.4.0](https://github.com/unchained-capital/caravan/compare/v0.3.14...v0.4.0) (2023-03-06)

### Features
* ledger v2 backwards compatible support ([4d22cfc](https://github.com/unchained-capital/caravan/commit/4d22cfcb75606dfabbb2c044777904bb1202ebfb))

### [0.3.13](https://github.com/unchained-capital/caravan/compare/v0.3.12...v0.3.13) (2021-12-09)

### [0.3.12](https://github.com/unchained-capital/caravan/compare/v0.3.11...v0.3.12) (2021-12-09)

### [0.3.11](https://github.com/unchained-capital/caravan/compare/v0.3.10...v0.3.11) (2021-09-02)


### Bug Fixes

* **testrunner:** handle coldcard now emitting low-s signatures ([#234](https://github.com/unchained-capital/caravan/issues/234)) ([f865280](https://github.com/unchained-capital/caravan/commit/f865280130c2f8f9d6ace32ae6ef59464466f47e))

### [0.3.10](https://github.com/unchained-capital/caravan/compare/v0.3.9...v0.3.10) (2021-07-29)

### [0.3.9](https://github.com/unchained-capital/caravan/compare/v0.3.8...v0.3.9) (2021-07-28)


### Bug Fixes

* **address:** improve bip32 path editability ([#226](https://github.com/unchained-capital/caravan/issues/226)) ([77ae07f](https://github.com/unchained-capital/caravan/commit/77ae07f50876a3e395d126b21d366cd2e95d4f7a))
* **wallet:** adds utxo selection to manual spend on wallet interface ([#223](https://github.com/unchained-capital/caravan/issues/223)) ([ef4ab05](https://github.com/unchained-capital/caravan/commit/ef4ab05e7a20818422ed278085fb9e6400b35de9))

### [0.3.8](https://github.com/unchained-capital/caravan/compare/v0.3.7...v0.3.8) (2021-06-03)


### Bug Fixes

* **deps:** upgrade unchained-libs to latest version ([#222](https://github.com/unchained-capital/caravan/issues/222)) ([a002348](https://github.com/unchained-capital/caravan/commit/a002348759f06d8a64a4c137d242171e9cb6dbb5))

### [0.3.7](https://github.com/unchained-capital/caravan/compare/v0.3.6...v0.3.7) (2021-06-01)


### Bug Fixes

* **wallet:** basic coin selection on spend ([#221](https://github.com/unchained-capital/caravan/issues/221)) ([3917999](https://github.com/unchained-capital/caravan/commit/391799940d292a4dfccd1ef711cd83ace984c285))
* **wallet:** handle binary psbt properly ([#217](https://github.com/unchained-capital/caravan/issues/217)) ([959f111](https://github.com/unchained-capital/caravan/commit/959f111db0bf5f9e41e3e4c085d0a8bb92695be7))

### [0.3.6](https://github.com/unchained-capital/caravan/compare/v0.3.5...v0.3.6) (2021-05-01)


### Bug Fixes

* **deps:** update unchained libs to latest version ([#215](https://github.com/unchained-capital/caravan/issues/215)) ([1f447ed](https://github.com/unchained-capital/caravan/commit/1f447ed2d9c054a4bba1fd21ee7b0ddebf858585))
* **deps:** update unchained libs to latest version ([#220](https://github.com/unchained-capital/caravan/issues/220)) ([052269a](https://github.com/unchained-capital/caravan/commit/052269acd4d16b3eccf6135bfde10cbc8654ade7))
* **other:** replace corsproxy with nginx reverse proxy ([#210](https://github.com/unchained-capital/caravan/issues/210)) ([87017e8](https://github.com/unchained-capital/caravan/commit/87017e8b911884d714ce3feba96331479e8e99ca))
* **pubkeyimporter:** jS error when using Enter as text with incorrect access type ([#205](https://github.com/unchained-capital/caravan/issues/205)) ([3201aa5](https://github.com/unchained-capital/caravan/commit/3201aa5993c27fdb24ebe112c56273fe9584b1f2))
* **wallet:** fix typo on wallet import page ([#211](https://github.com/unchained-capital/caravan/issues/211)) ([8aea08d](https://github.com/unchained-capital/caravan/commit/8aea08dfac897cef668a583a2b649ad416bb36ef))

### [0.3.5](https://github.com/unchained-capital/caravan/compare/v0.3.4...v0.3.5) (2021-01-12)


### Bug Fixes

* **deps:** upgrade unchained-wallets to 0.1.15 ([fdce789](https://github.com/unchained-capital/caravan/commit/fdce789f087b776f430651b8decc08c110ba59d2))
* **wallet:** direct Edit Details btn to editable pubkey page ([6fc3d84](https://github.com/unchained-capital/caravan/commit/6fc3d84a93dcbc5a688470d2a1328e7aade065b3)), closes [#109](https://github.com/unchained-capital/caravan/issues/109)

### [0.3.4](https://github.com/unchained-capital/caravan/compare/v0.3.3...v0.3.4) (2020-12-21)


### Features

* **wallet:** bugfixes, bump uc libs, adds coldcard support ([ac11da6](https://github.com/unchained-capital/caravan/commit/ac11da676e6eca7044aa9652c0019dcf864e10ec))


### Bug Fixes

* **dependencies:** two deps with breaking changes ([14b4f8d](https://github.com/unchained-capital/caravan/commit/14b4f8df2538eb4403db7c8f4eeb005bc5616175))
* **dependencies:** unchained-wallets to 0.1.14 ([3dc473e](https://github.com/unchained-capital/caravan/commit/3dc473e3e7cf3937a03162954f8ab86baba949f7))
* **dependencies:** update deps with npm audit fix ([df6ff18](https://github.com/unchained-capital/caravan/commit/df6ff185ef4374bfbbb3f789b2e9dd9e7f52cb69))
* **dependencies:** update uc-b to 0.1.2 ([d99d46a](https://github.com/unchained-capital/caravan/commit/d99d46af6d228f1dfb5a2fc2623c10c8f0eb4105))
* **slices:** use unixtime to compare lastUsed dates ([d4983ff](https://github.com/unchained-capital/caravan/commit/d4983ff5a07e22046e51962aeeb8c62a420f0cb2))
* **testrunner:** fix typos on cc test runner ([6be96aa](https://github.com/unchained-capital/caravan/commit/6be96aa2960ca1a46a44122e5506ab1ad3fb1dc0))
* **wallet:** bug with coldcard wallet config p2sh-p2wsh ordering ([f599c03](https://github.com/unchained-capital/caravan/commit/f599c03e104eaa62b227756595f32b1bb7f30e43))
* **wallet:** handle old config files properly, guard against unknown/null ([a70d78d](https://github.com/unchained-capital/caravan/commit/a70d78d65e1a93f795b47427146e8e2315b848cd))
* **wallet:** hermit test suite updates ([5d97ed3](https://github.com/unchained-capital/caravan/commit/5d97ed3fadf0f93c1bf08255cd8100975d83f377))
* **wallet:** show bip32path if signing via redeem_script interface ([19e69a5](https://github.com/unchained-capital/caravan/commit/19e69a56d8c2165a55664204c0903c8ab84662b4))

### [0.3.3](https://github.com/unchained-capital/caravan/compare/v0.3.2...v0.3.3) (2020-08-03)


### Bug Fixes

* **dependencies:** update unchained libraries ([4f77ff5](https://github.com/unchained-capital/caravan/commit/4f77ff5317e5260420e376f2b694cd2f90bb36a1))
* **other:** fix npm packages with low severity vulnerabilities ([#167](https://github.com/unchained-capital/caravan/issues/167)) ([44cedd0](https://github.com/unchained-capital/caravan/commit/44cedd0d732faca4df45260be66e63206115507b)), closes [#134](https://github.com/unchained-capital/caravan/issues/134)

### [0.3.2](https://github.com/unchained-capital/caravan/compare/v0.3.1...v0.3.2) (2020-07-27)

### Features

* **dependencies:** update unchained-wallets to 0.1.6 ([6eb62bc](https://github.com/unchained-capital/caravan/commit/6eb62bc7f46b789a2610af8e51aa846cff25f777))



### [0.3.1](https://github.com/unchained-capital/caravan/compare/v0.2.1...v0.3.1) (2020-07-14)

### Features

* **dependencies:** update unchained-wallets to 0.1.3 ([6abefcc](https://github.com/unchained-capital/caravan/commit/6abefcc49c6c997b827079c0120ce2790c7aaadd))



## [0.3.0](https://github.com/unchained-capital/caravan/compare/v0.2.1...v0.3.0) (2020-07-09)

### SUMMARY

Adds the ability to provide a starting address index with which to load addresses.  This is useful if the user started at a higher bip32 suffix than `0/0` (the default).

Also fixes a bug in confirm on device.


### ⚠ BREAKING CHANGES

* **wallet:** None
* **slices:** None

### Features

* **wallet:** starting Address Index loading, picking, exporting ([653132a](https://github.com/unchained-capital/caravan/commit/653132aba3ac1fe19945b79c2f906ee311c9b8aa)), closes [#149](https://github.com/unchained-capital/caravan/issues/149)


### Bug Fixes

* **slices:** confirmAddress can handle unknown method ([fb31758](https://github.com/unchained-capital/caravan/commit/fb31758033df16c2d3545bfc95dd8f7267e416c4))



## [0.2.1](https://github.com/unchained-capital/caravan/compare/v0.2.0...v.0.2.1) (2020-06-29)

### Features
* update unchained-wallets for webusb support and improved ledger interactions ([df66943](https://github.com/unchained-capital/caravan/commit/df6694350f20284d4e892dd232d7807c4403204f))
* update config requirements to allow for unknown signing method and empty client ([bcada9d](https://github.com/unchained-capital/caravan/commit/bcada9d1199dc35d29736270e827bfc536149807))



## [0.2.0](https://github.com/unchained-capital/caravan/compare/v0.1.5...v0.2.0) (2020-05-20)

### Features

* add wallet feature using xpubs ([3514039](https://github.com/unchained-capital/caravan/commit/3514039983984e184e8babb6c61c21a46798fc70))
* add test suite for testing hardware wallets ([3514039](https://github.com/unchained-capital/caravan/commit/3514039983984e184e8babb6c61c21a46798fc70))
* add commitlint and commitzen ([6fff3b7](https://github.com/unchained-capital/caravan/commit/6fff3b7d6360fe178a19f06534803b46247e6306))
* add cypress and example test ([25d7959](https://github.com/unchained-capital/caravan/commit/25d79598f4a8cb401aec78c1559c1d1a44c5e118))
* adds react-testing-library ([fc152d4](https://github.com/unchained-capital/caravan/commit/fc152d4db554c4448a775a5f3e6f540f13b3b466))
* add changelog.md to the project ([5b47948](https://github.com/unchained-capital/caravan/commit/5b479488e50dc89129cd93303a66fbf662eee613))

### Bug Fixes
* fixes inconsistencies in wallet balance update after spend ([fd214eb](https://github.com/unchained-capital/caravan/commit/fd214eb573c7185c01dfa2040aa914e87a0de359))
* update CTAs on landing page ([6a8e443](https://github.com/unchained-capital/caravan/commit/6a8e443cac3af63977904f347802e387ce30daf3))
* update html meta description text ([f7b1443](https://github.com/unchained-capital/caravan/commit/f7b14437e701ba0a454603d014b9354ac4f1096c))
* fix display error in outputs when switching b/w spend modes ([4a803f0](https://github.com/unchained-capital/caravan/commit/4a803f08cdde8f21a71efe3e59108c139da32ec1))
* fix copyright year in footer ([4a0d98c](https://github.com/unchained-capital/caravan/commit/4a0d98c92cdd1475ce65f8d57969b1a8552aa0e6))
* Added a paragraph to the readme about how to use corsproxy. ([4d56afa](https://github.com/unchained-capital/caravan/commit/4d56afa8a3233948b34c5bd03dcd71d72828ded2))



## [0.1.5](https://github.com/unchained-capital/caravan/compare/v0.1.4...v0.1.5) (2019-11-14)


### Bug Fixes

* disable remove signature on broadcast ([94e1a0f](https://github.com/unchained-capital/caravan/commit/94e1a0f47717673f012aac58b1823030034c9019))
* fix output errors being covered up ([4838009](https://github.com/unchained-capital/caravan/commit/483800907b6767a7c458b0884376de17dbb67ec4))
* no estimate rate gathering signatures ([65eef87](https://github.com/unchained-capital/caravan/commit/65eef87ce8acb3091b4859644eb9c5c0cba920e5))
* fix wrapping issues ([92f352d](https://github.com/unchained-capital/caravan/commit/92f352d51c1ab31cf109774a667a48515073b16b))



## [0.1.4](https://github.com/unchained-capital/caravan/compare/v0.1.3...v0.1.4) (2019-11-13)


### Features

* Added configuration to allow travis ci to automatically deploy tagged commits. ([ff7d367](https://github.com/unchained-capital/caravan/commit/ff7d3675498afa1df5b9bcbd3fdcffb6cbbd206d))



## [0.1.3](https://github.com/unchained-capital/caravan/compare/v0.1.2...v0.1.3) (2019-11-13)


### Bug Fixes

* Adding README, fixed broken CORS doc link. ([2c23cc9](https://github.com/unchained-capital/caravan/commit/2c23cc94f667506d1be7ce7e3d9a82f81f48eaa2))



## [0.1.2](https://github.com/unchained-capital/caravan/compare/v0.1.1...v0.1.2) (2019-11-13)


### Features

* Added a string showing the current version to the footer. ([e8cab10](https://github.com/unchained-capital/caravan/commit/e8cab105bca81521b9472f5e4154588144b1e106))

### Bug Fixes

* fix readme links ([a9249d2](https://github.com/unchained-capital/caravan/commit/a9249d2cd6b164d3ac04934ea8de047982beab3e))



# [0.1.1](https://github.com/unchained-capital/caravan/tree/v0.1.1) (2019-11-12)

### Features

* Initial caravan release
