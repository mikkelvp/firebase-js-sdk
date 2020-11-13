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

import { AppCheckTokenLocal } from '@firebase/app-check/src/state';
import { FirebaseApp } from '@firebase/app-types';
import { isIndexedDBAvailable } from '@firebase/util';
import { readTokenFromIndexedDB, writeTokenToIndexedDB } from './indexeddb';

/**
 * Always resolves. In case of an error reading from indexeddb, resolve with undefined
 */
export async function readTokenFromStorage(
  app: FirebaseApp
): Promise<AppCheckTokenLocal | undefined> {
  if (isIndexedDBAvailable()) {
    let token = undefined;
    try {
      token = await readTokenFromIndexedDB(app);
    } catch (e) {
      // swallow the error and return undefined
      console.warn(`Failed to read token from indexeddb. Error: ${e}`);
    }
    return token;
  }

  return undefined;
}

/**
 * Always resolves. In case of an error writing to indexeddb, print a warning and resolve the promise
 */
export function writeTokenToStorage(
  app: FirebaseApp,
  token: AppCheckTokenLocal
): Promise<void> {
  if (isIndexedDBAvailable()) {
    return writeTokenToIndexedDB(app, token).catch(e => {
      // swallow the error and resolve the promise
      console.warn(`Failed to write token to indexeddb. Error: ${e}`);
    });
  }

  return Promise.resolve();
}
