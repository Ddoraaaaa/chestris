export default {
    input: './src/index.js',
    treeshake: false,
    output: {
        file: 'dest/bundle.js',
        format: 'iife',
        name: 'dd'
    }
};