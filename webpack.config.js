const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.ts', // Your main TypeScript file
  devtool: 'inline-source-map', // For easier debugging in dev mode
  module: {
    rules: [
      {
        test: /\.ts$/, // For all .ts files
        use: 'ts-loader', // Use ts-loader for transpiling TypeScript
        exclude: /node_modules/, // Don't process node_modules
      },
      {
        test: /\.css$/, // For loading CSS files
        use: ['style-loader', 'css-loader'], // Apply style-loader and css-loader
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Handle these extensions
  },
  output: {
    filename: 'bundle.js', // The output file name
    path: path.resolve(__dirname, 'dist'), // Output directory
    clean: true, // Clean the dist folder before each build
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from public
    },
    compress: true, // Enable gzip compression
    port: 9000, // Dev server runs on port 9000
    open: true, // Automatically open the browser
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html', // Use your index.html template in public/
    }),
  ],
  performance: {
    hints: false, // Disable performance warnings
  },
};
