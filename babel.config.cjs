module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: 'current', // Target the current version of Node.js
            },
            modules: "commonjs"
        }],
        '@babel/preset-typescript', // Add TypeScript support
    ],
    // If you're using additional Babel plugins, define them here
    plugins: [
        // List any Babel plugins you need
    ],
};