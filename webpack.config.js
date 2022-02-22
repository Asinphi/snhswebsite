const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

require('dotenv').config({
    path: path.join(__dirname, ".env")
});

const isDevelopment = process.env.NODE_ENV === "development";

console.log("Running with mode", process.env.NODE_ENV);
module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        index: "./src/index.js",
        community: "./src/community.js",
        discussion: "./src/discussion.js",
        info_page: "./src/info_page.js",
    },
    devtool: 'inline-source-map',
    plugins: [
        new MiniCssExtractPlugin()
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './static'),
    },
    module: {
        rules: [
            {
                test: /\.module\.s(a|c)ss$/i,
                use: [
                    isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: isDevelopment,
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment,
                            sassOptions: {
                                indentWidth: 4,
                                includePaths: ["utils/styles"]
                            },
                        }
                    }
                ],
            },
            {
                test: /\.s(a|c)ss$/i,
                exclude: /\.module\.s(a|c)ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: isDevelopment,
                        },
                    },
                    // Compiles Sass to CSS
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment,
                            sassOptions: {
                                indentWidth: 4,
                                includePaths: ["utils/styles"]
                            }
                        }
                    }
                ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ]
            }
        ],
    }
};