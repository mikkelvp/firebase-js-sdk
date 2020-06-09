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

import { AppCheckProvider } from '@firebase/app-check-types';
import { FirebaseApp } from '@firebase/app-types';
import { ERROR_FACTORY, AppCheckError } from './errors';
import { initialize as initializeRecaptcha } from './recaptcha';
import { DEFAULT_STATE, getState, setState } from './state';

export function setCustomProvider(
  app: FirebaseApp,
  provider: AppCheckProvider
): void {
  const state = getState(app);
  if (state) {
    if (state.activated) {
      throw ERROR_FACTORY.create(AppCheckError.SET_PROVIDER_AFTER_ACTIVATED, {
        name: app.name
      });
    }

    if (state.customProvider) {
      throw ERROR_FACTORY.create(AppCheckError.PROVIDER_ALREADY_SET, {
        name: app.name
      });
    }
  }

  setState(app, {
    ...DEFAULT_STATE,
    customProvider: provider
  });
}

export function activate(app: FirebaseApp): void {
  const state = getState(app);
  if (state.activated) {
    throw ERROR_FACTORY.create(AppCheckError.ALREADY_ACTIVATED, {
      name: app.name
    });
  }

  setState(app, { ...state, activated: true });

  if (!state.customProvider) {
    // initialize ReCAPTCHA
    initializeRecaptcha(app);
  }
}
