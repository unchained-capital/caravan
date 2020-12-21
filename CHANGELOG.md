# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
