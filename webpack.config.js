const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "usage", // "usage" or "entry"
                                    corejs: 3,
                                    targets: "> 0.25%, not dead"
                                }
                            ]
                        ],
                        plugins: ["@babel/plugin-transform-runtime"]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [new webpack.NamedModulesPlugin(), new CopyPlugin({ patterns: [{ from: "src/static" }] })],
    devtool: "inline-source-map",
    // TODO: do we need the max?
    performance: {
        maxEntrypointSize: 800000,
        maxAssetSize: 800000
    }
};
