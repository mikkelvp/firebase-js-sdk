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
import '../test/setup';
import { expect } from 'chai';
import { stub } from 'sinon';
import { activate } from './api';
import { getFakeApp, getFakeCustomTokenProvider } from '../test/util';
import { getState } from './state';
import * as reCAPTCHA from './recaptcha';

describe('api', () => {
  describe('activate()', () => {
    let app;

    beforeEach(() => {
      app = getFakeApp();
    });

    it('sets activated to true', () => {
      expect(getState(app).activated).to.equal(false);
      activate(app);
      expect(getState(app).activated).to.equal(true);
    });

    it('can only be called once', () => {
      activate(app);
      expect(() => activate(app)).to.throw(
        /AppCheck can only be activated once/
      );
    });

    it('does NOT initialize reCAPTCHA when a custom token provider is provided', () => {
      const fakeCustomTokenProvider = getFakeCustomTokenProvider();
      const initReCAPTCHAStub = stub(reCAPTCHA, 'initialize');
      activate(app, fakeCustomTokenProvider);
      expect(getState(app).customProvider).to.equal(fakeCustomTokenProvider);
      expect(initReCAPTCHAStub).to.have.not.been.called;
    });
  });
});
