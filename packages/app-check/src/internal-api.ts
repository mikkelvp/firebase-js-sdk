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
import { AppCheckState, getState, setState } from './state';
import { ERROR_FACTORY, AppCheckError } from './errors';
import {
  EXCHANGE_CUSTOM_TOKEN_ENDPOINT,
  EXCHANGE_RECAPTCHA_TOKEN_ENDPOINT,
  TOKEN_REFRESH_TIME
} from './constants';
import { Refresher } from './proactive-refresh';

export async function getToken(
  app: FirebaseApp
): Promise<AppCheckToken | null> {
  ensureActivated(app);

  const state = getState(app);
  let token;
  if (state.customProvider) {
    const attestedClaimsToken = await state.customProvider.getToken();
    token = await exchangeCustomTokenForAppCheckToken(attestedClaimsToken);
  } else {
    const attestedClaimsToken = await getReCAPTCHAToken(app);
    token = await exchangeReCAPTCHATokenForAppCheckToken(attestedClaimsToken);
  }

  notifyTokenListeners(app, token);

  return token;
}

export function addTokenListener(
  app: FirebaseApp,
  listener: AppCheckTokenListener
): void {
  const state = getState(app);
  let newState = {
    ...state,
    tokenListeners: [...state.tokenListeners, listener]
  };

  if (!newState.tokenRefresher) {
    const tokenRefresher = createTokenRefresher(app);
    newState.tokenRefresher = tokenRefresher;
  }

  if (!newState.tokenRefresher.isRunning()) {
    newState.tokenRefresher.start();
  }

  setState(app, newState);
}

export function removeTokenListener(
  app: FirebaseApp,
  listener: AppCheckTokenListener
): void {
  const state = getState(app);

  const newListeners = state.tokenListeners.filter(l => l !== listener);
  if (newListeners.length === 0 && state.tokenRefresher?.isRunning()) {
    state.tokenRefresher?.stop();
  }

  setState(app, {
    ...state,
    tokenListeners: newListeners
  });
}

function createTokenRefresher(app: FirebaseApp): Refresher {
  return new Refresher(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    () => getToken(app),
    () => {
      // TODO: when should we retry?
      return true;
    },
    () => {
      const state = getState(app);

      if (state?.token) {
        return (
          state.token.expirationTime -
          Date.now() -
          TOKEN_REFRESH_TIME.OFFSET_DURATION
        );
      } else {
        return 0;
      }
    },
    TOKEN_REFRESH_TIME.RETRIAL_MIN_WAIT,
    TOKEN_REFRESH_TIME.RETRIAL_MAX_WAIT
  );
}

function notifyTokenListeners(app: FirebaseApp, token: AppCheckToken): void {
  const listeners = getState(app).tokenListeners;

  for (const listener of listeners) {
    listener(token);
  }
}

function ensureActivated(app: FirebaseApp) {
  if (!getState(app).activated) {
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
