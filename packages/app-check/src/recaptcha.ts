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
import { Deferred } from '@firebase/util';

const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';

export const initialized = new Deferred<void>();

export function initialize(app: FirebaseApp): Promise<void> {
  // TODO: update FirebaseApp option and confirm with FireData on the name of the field
  const { siteKey } = app.options as any;
  const script = document.createElement('script');
  script.src = `${RECAPTCHA_URL}?render=${siteKey}`;
  script.onload = () => {
    initialized.resolve();
  };
  document.head.appendChild(script);

  return initialized.promise;
}

export function getRecaptcha(): GreCAPTCHA | undefined {
  return self.grecaptcha;
}

export async function getToken(app: FirebaseApp): Promise<string> {
  await initialized.promise;
  const recaptcha = getRecaptcha();

  // TODO: could it really happen?
  if (!recaptcha) {
    throw Error('reCAPTCHA is not available');
  }

  return new Promise((resolve, reject) => {
    recaptcha.ready(() => {
      // TODO: update app.options and confirm the official name for siteKey
      resolve(
        recaptcha.execute((app.options as any).siteKey, {
          action: 'fire-app-check'
        })
      );
    });
  });
}

declare global {
  interface Window {
    grecaptcha: GreCAPTCHA | undefined;
  }
}

export interface GreCAPTCHA {
  ready: (callback: Function) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}
