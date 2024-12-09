import { defineConfig } from '@rsbuild/core';

export default defineConfig({
    input: 'src/index.js',
    output: {
        minify: {
            js: false,
        },
    },
    plugins: [],
});
