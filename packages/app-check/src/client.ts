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

import { BASE_ENDPOINT, EXCHANGE_RECAPTCHA_TOKEN_METHOD } from './constants';
import { FirebaseApp } from '@firebase/app-types';
import { ERROR_FACTORY, AppCheckError } from './errors';
import { AppCheckTokenLocal } from './state';

interface AppCheckResponse {
  attestationToken: string;
  timeToLive: string;
}

interface AppCheckRequest {
  url: string;
  body: { [key: string]: string };
}

export async function exchangeToken({
  url,
  body
}: AppCheckRequest): Promise<AppCheckTokenLocal> {
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (originalError) {
    throw ERROR_FACTORY.create(AppCheckError.FETCH_NETWORK_ERROR, {
      originalErrorMessage: originalError.message
    });
  }

  if (response.status !== 200) {
    throw ERROR_FACTORY.create(AppCheckError.FETCH_STATUS_ERROR, {
      httpStatus: response.status
    });
  }

  let responseBody: AppCheckResponse;
  try {
    // JSON parsing throws SyntaxError if the response body isn't a JSON string.
    responseBody = await response.json();
  } catch (originalError) {
    throw ERROR_FACTORY.create(AppCheckError.FETCH_PARSE_ERROR, {
      originalErrorMessage: originalError.message
    });
  }

  const timeToLiveAsNumber = Number(responseBody.timeToLive);
  if (isNaN(timeToLiveAsNumber)) {
    throw ERROR_FACTORY.create(AppCheckError.FETCH_PARSE_ERROR, {
      originalErrorMessage: `timeToLive is not a number, ${responseBody.timeToLive}`
    });
  }

  return {
    token: responseBody.attestationToken,
    expirationTime: Date.now() + timeToLiveAsNumber
  };
}

export function getExchangeRecaptchaTokenRequest(
  app: FirebaseApp,
  reCAPTCHAToken: string
): AppCheckRequest {
  const { projectId, appId, apiKey } = app.options;

  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_RECAPTCHA_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      recaptcha_token: reCAPTCHAToken
    }
  };
}
