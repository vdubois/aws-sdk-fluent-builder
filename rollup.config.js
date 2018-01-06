import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';

const pkg = require('./package.json');

const libraryName = pkg.name;

export default {
    input: `compiled/index.js`,
    output: [
        {file: pkg.main, name: libraryName, format: 'umd'},
        {file: pkg.module, format: 'es'}
    ],
    sourcemap: true,
    external: ['aws-sdk'],
    watch: {
        include: 'compiled/**'
    },
    plugins: [
        resolve(),
        commonjs({
            namedExports: {
                'node_modules/aws-sdk/clients/dynamodb.js': [ 'DocumentClient' ]
            }
        }),
        sourceMaps(),
        json()
    ]
}
