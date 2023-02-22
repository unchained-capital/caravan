module.exports = function override(webpackConfig) {
  // eslint-disable-next-line no-param-reassign
  webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    "@ledgerhq/devices/hid-framing": "@ledgerhq/devices/lib/hid-framing",
  };
  return webpackConfig;
};
