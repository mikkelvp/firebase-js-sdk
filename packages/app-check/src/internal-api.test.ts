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
import { spy, stub } from 'sinon';
import { FirebaseApp } from '@firebase/app-types';
import { getFakeApp, getFakeCustomTokenProvider } from '../test/util';
import { activate } from './api';
import {
  getToken,
  addTokenListener,
  removeTokenListener
} from './internal-api';
import * as reCAPTCHA from './recaptcha';
import { getState } from './state';

describe('internal api', () => {
  let app: FirebaseApp;

  beforeEach(() => {
    app = getFakeApp();
  });
  // TODO: test error conditions
  describe('getToken()', () => {
    it('uses custom token to exchange for AppCheck token if customTokenProvider is provided', async () => {
      let customTokenProvider = getFakeCustomTokenProvider();

      const customProviderSpy = spy(customTokenProvider, 'getToken');
      activate(app, customTokenProvider);

      const token = await getToken(app);

      expect(customProviderSpy).to.be.called;
      expect(token).to.deep.equal({
        token: `fake-app-check-token-fake-custom-token`,
        expirationTime: 123
      });
    });

    it('uses reCAPTCHA token to exchange for AppCheck token if no customTokenProvider is provided', async () => {
      activate(app);

      const reCAPTCHASpy = stub(reCAPTCHA, 'getToken').returns(
        Promise.resolve('fake-recaptcha-token')
      );
      const token = await getToken(app);

      expect(reCAPTCHASpy).to.be.called;
      expect(token).to.deep.equal({
        token: `fake-app-check-token-fake-recaptcha-token`,
        expirationTime: 123
      });
    });

    it('notifies listeners', async () => {
      activate(app);

      stub(reCAPTCHA, 'getToken').returns(
        Promise.resolve('fake-recaptcha-token')
      );
      const listener1 = spy();
      const listener2 = spy();
      addTokenListener(app, listener1);
      addTokenListener(app, listener2);

      await getToken(app);

      expect(listener1).to.be.calledWith({
        token: `fake-app-check-token-fake-recaptcha-token`,
        expirationTime: 123
      });
      expect(listener2).to.be.calledWith({
        token: `fake-app-check-token-fake-recaptcha-token`,
        expirationTime: 123
      });
    });

    it('ignores listeners that throw', async () => {
      activate(app);
      stub(reCAPTCHA, 'getToken').returns(
        Promise.resolve('fake-recaptcha-token')
      );
      const listener1 = () => {
        throw new Error();
      };
      const listener2 = spy();

      addTokenListener(app, listener1);
      addTokenListener(app, listener2);

      await getToken(app);

      expect(listener2).to.be.calledWith({
        token: `fake-app-check-token-fake-recaptcha-token`,
        expirationTime: 123
      });
    });
  });

  describe('addTokenListener', () => {
    it('adds token listeners', () => {
      const listener = () => {};

      addTokenListener(app, listener);

      expect(getState(app).tokenListeners[0]).to.equal(listener);
    });

    it('starts proactively refreshing token after adding the first listener', () => {
      const listener = () => {};
      expect(getState(app).tokenListeners.length).to.equal(0);
      expect(getState(app).tokenRefresher).to.equal(undefined);

      addTokenListener(app, listener);

      expect(getState(app).tokenRefresher?.isRunning()).to.be.true;
    });
  });

  describe('removeTokenListener', () => {
    it('should remove token listeners', () => {
      const listener = () => {};
      addTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(1);

      removeTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(0);
    });

    it('should stop proactively refreshing token after deleting the last listener', () => {
      const listener = () => {};

      addTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(1);
      expect(getState(app).tokenRefresher?.isRunning()).to.be.true;

      removeTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(0);
      expect(getState(app).tokenRefresher?.isRunning()).to.be.false;
    });
  });
});
