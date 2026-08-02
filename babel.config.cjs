// babel.config.cjs
// CommonJS requerido: package.json usa "type": "module"
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "babel-plugin-transform-import-meta",
      "react-native-reanimated/plugin"
    ]
  };
};
