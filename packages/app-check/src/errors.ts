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

import { ErrorFactory, ErrorMap } from '@firebase/util';

export const enum AppCheckError {
  ALREADY_ACTIVATED = 'already-activated',
  PROVIDER_ALREADY_SET = 'provider-already-set',
  SET_PROVIDER_AFTER_ACTIVATED = 'set-provider-after-activated',
  USE_BEFORE_ACTIVATION = 'use-before-activation'
}

const ERRORS: ErrorMap<AppCheckError> = {
  [AppCheckError.ALREADY_ACTIVATED]:
    'You are trying to activate AppCheck for FirebaseApp {$name}, ' +
    'while it is already activated. ' +
    'AppCheck can only be activated once.',
  [AppCheckError.PROVIDER_ALREADY_SET]:
    'You are trying to set customProvider for AppCheck for FirebaseApp {$name}, ' +
    'but it has already been set. ' +
    'customProvider can only be set once.',
  [AppCheckError.SET_PROVIDER_AFTER_ACTIVATED]:
    'You are trying to set customProvider for AppCheck for FirebaseApp {$name}, ' +
    'while the AppCheck has been already activated. ' +
    "You can't set customProvider on an activated AppCheck instance.",
  [AppCheckError.USE_BEFORE_ACTIVATION]:
    'AppCheck is being used before activate() is called for FirebaseApp {$name}. ' +
    'Please make sure you call activate() before instantiating other Firebase services.'
};

interface ErrorParams {
  [AppCheckError.ALREADY_ACTIVATED]: { name: string };
  [AppCheckError.PROVIDER_ALREADY_SET]: { name: string };
  [AppCheckError.SET_PROVIDER_AFTER_ACTIVATED]: { name: string };
  [AppCheckError.USE_BEFORE_ACTIVATION]: { name: string };
}

export const ERROR_FACTORY = new ErrorFactory<AppCheckError, ErrorParams>(
  'appCheck',
  'AppCheck',
  ERRORS
);
