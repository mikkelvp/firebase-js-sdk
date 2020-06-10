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
import { setCustomProvider, activate } from './api';
import { getFakeApp, getFakeCustomTokenProvider } from '../test/util';
import { getState } from './state';

describe('api', () => {
  describe('setCustomProvider()', () => {
    it('sets custom provider correctly', () => {
      const app = getFakeApp();
      const customTokenProvider = getFakeCustomTokenProvider();
      setCustomProvider(app, customTokenProvider);

      expect(getState(app).customProvider).to.equal(customTokenProvider);
    });

    it('can not be called after calling activate()', () => {
      const app = getFakeApp();
      activate(app);

      expect(() =>
        setCustomProvider(app, getFakeCustomTokenProvider())
      ).to.throw(
        /You can't set customProvider on an activated AppCheck instance/
      );
    });

    it('can only be called once', () => {
      const app = getFakeApp();
      setCustomProvider(app, getFakeCustomTokenProvider());

      expect(() =>
        setCustomProvider(app, getFakeCustomTokenProvider())
      ).to.throw(/customProvider can only be set once/);
    });
  });

  describe('activate()', () => {
    it('sets activated to true', () => {
      const app = getFakeApp();
      expect(getState(app).activated).to.equal(false);
      activate(app);
      expect(getState(app).activated).to.equal(true);
    });

    it('can only be called once', () => {
      const app = getFakeApp();
      activate(app);
      expect(() => activate(app)).to.throw(
        /AppCheck can only be activated once/
      );
    });
  });
});
