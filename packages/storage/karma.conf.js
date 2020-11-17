/**
 * @license
 * Copyright 2017 Google LLC
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

const karmaBase = require('../../config/karma.base');
const { argv } = require('yargs');

module.exports = function (config) {
  const karmaConfig = Object.assign({}, karmaBase, {
    // files to load into karma
    files: getTestFiles(argv),
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha']
  });

  config.set(karmaConfig);
};

function getTestFiles(argv) {
  let unitTestFiles = [];
  let integrationTestFiles = [];
  if (argv.exp) {
    unitTestFiles = ['test/unit/*'].filter(
      filename => !filename.includes('.compat.')
    );
    integrationTestFiles = ['test/integration/*exp*'];
  } else if (argv.compat) {
    unitTestFiles = ['test/unit/*'].filter(
      filename => !filename.includes('.exp.')
    );
    integrationTestFiles = ['test/integration/*compat*'];
  } else {
    console.log('Specify "exp" or "compat" option for karma command.');
    return;
  }
  if (argv.unit) {
    return unitTestFiles;
  } else if (argv.integration) {
    return integrationTestFiles;
  } else {
    return [...unitTestFiles, ...integrationTestFiles];
  }
}

module.exports.files = getTestFiles(argv);
