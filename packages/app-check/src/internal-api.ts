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

import { getToken as getReCAPTCHAToken } from './recaptcha';
import { FirebaseApp } from '@firebase/app-types';
import { AppCheckToken } from '@firebase/app-check-interop-types';
import { APP_CHECK_STATES, DEFAULT_STATE, AppCheckState } from './state';
import { ERROR_FACTORY, AppCheckError } from './errors';

export async function getToken(
  app: FirebaseApp
): Promise<AppCheckToken | null> {
  const state = APP_CHECK_STATES.get(app) || DEFAULT_STATE;
  ensureActivated(app, state);

  let attestedClaimsToken;
  if (state.customProvider) {
    attestedClaimsToken = await state.customProvider.getToken();
  } else {
    attestedClaimsToken = await getReCAPTCHAToken(app);
  }

  // TODO: integrate with backend to get the actual AppCheckToken
  return {
    token: attestedClaimsToken,
    expirationTime: 123
  };
}

function ensureActivated(app: FirebaseApp, state: AppCheckState) {
  if (!state.activated) {
    throw ERROR_FACTORY.create(AppCheckError.USE_BEFORE_ACTIVATION, {
      name: app.name
    });
  }
}
