module.exports = {
  entry: './samples/main.js',
  output: {
    filename: './build/bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['es2015'],
        compact: false,
        cacheDirectory: true
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }],
    noParse: [/validate\.js/, /https-proxy-agent\.js/],
    exprContextCritical: false
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules'],
    module: {
      noParse: [/\.\/dada\//, /\.\/nightwatch\//],
    },
    alias: {
      crypto: require.resolve("crypto-browserify")
    }
  }
};
