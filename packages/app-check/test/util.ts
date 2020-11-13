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
import { AppCheckProvider } from '@firebase/app-check-types';
import { GreCAPTCHA } from '../src/recaptcha';

export function getFakeApp(): FirebaseApp {
  return {
    name: 'appName',
    options: {
      apiKey: 'apiKey',
      projectId: 'projectId',
      authDomain: 'authDomain',
      messagingSenderId: 'messagingSenderId',
      databaseURL: 'databaseUrl',
      storageBucket: 'storageBucket',
      appId: '1:777777777777:web:d93b5ca1475efe57',
      siteKey: 'test_site_key'
    } as any,
    automaticDataCollectionEnabled: true,
    delete: async () => {},
    // This won't be used in tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appCheck: null as any
  };
}

export function getFakeCustomTokenProvider(): AppCheckProvider {
  return {
    getToken: () =>
      Promise.resolve({
        token: 'fake-custom-app-check-token',
        timeToLive: 1
      })
  };
}

export function getFakeGreCAPTCHA(): GreCAPTCHA {
  return {
    ready: callback => callback(),
    render: (_container, _parameters) => 'fake_widget_1',
    execute: (_siteKey, _options) => Promise.resolve('fake_recaptcha_token')
  };
}
