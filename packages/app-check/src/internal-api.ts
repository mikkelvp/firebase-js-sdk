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
import {
  AppCheckToken,
  AppCheckTokenListener
} from '@firebase/app-check-interop-types';
import { APP_CHECK_STATES, DEFAULT_STATE, AppCheckState } from './state';
import { ERROR_FACTORY, AppCheckError } from './errors';
import {
  EXCHANGE_CUSTOM_TOKEN_ENDPOINT,
  EXCHANGE_RECAPTCHA_TOKEN_ENDPOINT
} from './constants';

export async function getToken(
  app: FirebaseApp
): Promise<AppCheckToken | null> {
  const state = APP_CHECK_STATES.get(app) || DEFAULT_STATE;
  ensureActivated(app, state);

  if (state.customProvider) {
    const attestedClaimsToken = await state.customProvider.getToken();
    return exchangeCustomTokenForAppCheckToken(attestedClaimsToken);
  } else {
    const attestedClaimsToken = await getReCAPTCHAToken(app);
    return exchangeReCAPTCHATokenForAppCheckToken(attestedClaimsToken);
  }
}

export function addTokenListener(
  app: FirebaseApp,
  listener: AppCheckTokenListener
) {}

export function removeTokenListener(
  app: FirebaseApp,
  listener: AppCheckTokenListener
) {}

function ensureActivated(app: FirebaseApp, state: AppCheckState) {
  if (!state.activated) {
    throw ERROR_FACTORY.create(AppCheckError.USE_BEFORE_ACTIVATION, {
      name: app.name
    });
  }
}
// TODO: integrate with the actual backend to get the AppCheckToken
async function exchangeCustomTokenForAppCheckToken(
  customToken: string
): Promise<AppCheckToken> {
  const endpoint = EXCHANGE_CUSTOM_TOKEN_ENDPOINT;
  return {
    token: `fake-app-check-token-${customToken}`,
    expirationTime: 123
  };
}
// TODO: integrate with the actual backend to get the AppCheckToken
async function exchangeReCAPTCHATokenForAppCheckToken(
  reCAPTCHAToken: string
): Promise<AppCheckToken> {
  const endpoint = EXCHANGE_RECAPTCHA_TOKEN_ENDPOINT;
  return {
    token: `fake-app-check-token-${reCAPTCHAToken}`,
    expirationTime: 123
  };
}
