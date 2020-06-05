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

import { FirebaseApp } from '@firebase/app-types';
import { APP_CHECK_STATES, DEFAULT_STATE } from './state';
import { Deferred } from '@firebase/util';

export function startProactiveRefresh(app: FirebaseApp): void {}

export function stopProactiveRefresh(app: FirebaseApp): void {}

export function isProactiveRefreshRunning(app: FirebaseApp): boolean {
  const state = APP_CHECK_STATES.get(app) || DEFAULT_STATE;
  return state.isProactiveRefreshingToken;
}

/**
 * Port from auth proactiverefresh.js
 *
 */
// TODO: move it to @firebase/util?
export class Refresher {
  private pendingChain: Deferred<unknown>[] | null = null;
  constructor(
    private readonly operation: () => Promise<unknown>,
    private readonly retryPolicy: () => boolean,
    private readonly getWaitDuration: () => number,
    private readonly lowerBound: number,
    private readonly upperBound: number
  ) {}

  start() {
    this.process();

    const deferred = new Deferred();
    if (!this.pendingChain) {
      this.pendingChain = [];
    }
    this.pendingChain.push(deferred);

    setTimeout(() => {});
  }

  stop() {
    if (this.pendingChain) {
      for (const deferred of this.pendingChain) {
        deferred.reject('cancelled');
      }
      this.pendingChain = null;
    }
  }

  process() {
    this.stop();
  }
}
