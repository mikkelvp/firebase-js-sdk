/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { resolve } from 'path';
import resolveModule from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import rollupTypescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';
import { uglify } from 'rollup-plugin-uglify';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import appPkg from './app/package.json';

const external = Object.keys(pkg.dependencies || {});

/**
 * Global UMD Build
 */
const GLOBAL_NAME = 'firebase';

function createUmdOutputConfig(output, componentName) {
  return {
    file: output,
    format: 'umd',
    sourcemap: true,
    extend: true,
    name: `${GLOBAL_NAME}.${camelize(componentName)}`,
    globals: {
      '@firebase/app-exp': `${GLOBAL_NAME}.app`
    },

    /**
     * use iife to avoid below error in the old Safari browser
     * SyntaxError: Functions cannot be declared in a nested block in strict mode
     * https://github.com/firebase/firebase-js-sdk/issues/1228
     *
     */
    intro: `
          try {
            (function() {`,
    outro: `
          }).apply(this, arguments);
        } catch(err) {
            console.error(err);
            throw new Error(
              'Cannot instantiate ${output} - ' +
              'be sure to load firebase-app.js first.'
            );
          }`
  };
}

function camelize(str) {
  const arr = str.split('-');
  const capital = arr.map((item, index) =>
    index > 0
      ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      : item.toLowerCase()
  );
  return capital.join('');
}

const plugins = [sourcemaps(), resolveModule(), json(), commonjs()];

const typescriptPlugin = rollupTypescriptPlugin({
  typescript
});

const typescriptPluginUMD = rollupTypescriptPlugin({
  typescript,
  tsconfigOverride: {
    compilerOptions: {
      declaration: false
    }
  }
});

/**
 * Individual Component Builds
 */
const appBuilds = [
  /**
   * App Browser Builds
   */
  {
    input: 'app/index.ts',
    output: [
      { file: resolve('app', appPkg.main), format: 'cjs', sourcemap: true },
      { file: resolve('app', appPkg.module), format: 'es', sourcemap: true }
    ],
    plugins: [...plugins, typescriptPlugin],
    external
  },
  /**
   * App UMD Builds
   */
  {
    input: 'app/index.cdn.ts',
    output: {
      file: 'firebase-app.js',
      sourcemap: true,
      format: 'umd',
      name: `${GLOBAL_NAME}.app`
    },
    plugins: [...plugins, typescriptPluginUMD, uglify()]
  }
];

const componentBuilds = pkg.components
  // The "app" component is treated differently because it doesn't depend on itself.
  .filter(component => component !== 'app')
  .map(component => {
    const pkg = require(`./${component}/package.json`);
    // It is needed for handling sub modules, for example firestore/lite which should produce firebase-firestore-lite.js
    // Otherwise, we will create a directory with '/' in the name.
    const componentName = component.replace('/', '-');
    return [
      {
        input: `${component}/index.ts`,
        output: [
          {
            file: resolve(component, pkg.main),
            format: 'cjs',
            sourcemap: true
          },
          {
            file: resolve(component, pkg.module),
            format: 'es',
            sourcemap: true
          }
        ],
        plugins: [...plugins, typescriptPlugin],
        external
      },
      {
        input: `${component}/index.ts`,
        output: createUmdOutputConfig(
          `firebase-${componentName}.js`,
          componentName
        ),
        plugins: [...plugins, typescriptPluginUMD, uglify()],
        external: ['@firebase/app-exp']
      }
    ];
  })
  .reduce((a, b) => a.concat(b), []);

export default [...appBuilds, ...componentBuilds];
