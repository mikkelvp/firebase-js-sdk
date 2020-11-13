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
import { spy, stub, useFakeTimers } from 'sinon';
import { FirebaseApp } from '@firebase/app-types';
import { getFakeApp, getFakeCustomTokenProvider } from '../test/util';
import { activate } from './api';
import {
  getToken,
  addTokenListener,
  removeTokenListener
} from './internal-api';
import * as reCAPTCHA from './recaptcha';
import * as client from './client';
import * as storage from './storage';
import { getState, clearState, setState } from './state';
import { AppCheckTokenListener } from '@firebase/app-check-interop-types';
import { DUMMY_TOKEN } from './constants';

describe('internal api', () => {
  let app: FirebaseApp;

  beforeEach(() => {
    app = getFakeApp();
  });

  afterEach(() => clearState());
  // TODO: test error conditions
  describe('getToken()', () => {
    const fakeRecaptchaToken = 'fake-recaptcha-token';
    const fakeRecaptchaAppCheckToken = {
      token: 'fake-recaptcha-app-check-token',
      expirationTime: 123
    };

    const fakeCachedAppCheckToken = {
      token: 'fake-cached-app-check-token',
      expirationTime: 123
    };

    it('uses customTokenProvider to get an AppCheck token', async () => {
      const clock = useFakeTimers();
      const customTokenProvider = getFakeCustomTokenProvider();
      const customProviderSpy = spy(customTokenProvider, 'getToken');

      activate(app, customTokenProvider);
      const token = await getToken(app);

      expect(customProviderSpy).to.be.called;
      expect(token).to.deep.equal({
        token: 'fake-custom-app-check-token'
      });

      clock.restore();
    });

    it('uses reCAPTCHA token to exchange for AppCheck token if no customTokenProvider is provided', async () => {
      activate(app);

      const reCAPTCHASpy = stub(reCAPTCHA, 'getToken').returns(
        Promise.resolve(fakeRecaptchaToken)
      );
      stub(client, 'exchangeToken').returns(
        Promise.resolve(fakeRecaptchaAppCheckToken)
      );

      const token = await getToken(app);

      expect(reCAPTCHASpy).to.be.called;
      expect(token).to.deep.equal({ token: fakeRecaptchaAppCheckToken.token });
    });

    it('resolves with a dummy token and an error if failed to get a token', async () => {
      activate(app);

      const reCAPTCHASpy = stub(reCAPTCHA, 'getToken').returns(
        Promise.resolve(fakeRecaptchaToken)
      );

      const error = new Error('oops, something went wrong');
      stub(client, 'exchangeToken').returns(Promise.reject(error));

      const token = await getToken(app);

      expect(reCAPTCHASpy).to.be.called;
      expect(token).to.deep.equal({ token: DUMMY_TOKEN, error });
    });

    it('notifies listeners using cached token', async () => {
      activate(app);

      const clock = useFakeTimers();
      stub(storage, 'readTokenFromStorage').returns(
        Promise.resolve(fakeCachedAppCheckToken)
      );

      const listener1 = spy();
      const listener2 = spy();
      addTokenListener(app, listener1);
      addTokenListener(app, listener2);

      await getToken(app);

      expect(listener1).to.be.calledWith(fakeCachedAppCheckToken);
      expect(listener2).to.be.calledWith(fakeCachedAppCheckToken);

      clock.restore();
    });

    it('notifies listeners using new token', async () => {
      activate(app);

      stub(storage, 'readTokenFromStorage').returns(Promise.resolve(undefined));
      stub(reCAPTCHA, 'getToken').returns(Promise.resolve(fakeRecaptchaToken));
      stub(client, 'exchangeToken').returns(
        Promise.resolve(fakeRecaptchaAppCheckToken)
      );

      const listener1 = spy();
      const listener2 = spy();
      addTokenListener(app, listener1);
      addTokenListener(app, listener2);

      await getToken(app);

      expect(listener1).to.be.calledWith({
        token: fakeRecaptchaAppCheckToken.token
      });
      expect(listener2).to.be.calledWith({
        token: fakeRecaptchaAppCheckToken.token
      });
    });

    it('ignores listeners that throw', async () => {
      activate(app);
      stub(reCAPTCHA, 'getToken').returns(Promise.resolve(fakeRecaptchaToken));
      stub(client, 'exchangeToken').returns(
        Promise.resolve(fakeRecaptchaAppCheckToken)
      );
      const listener1 = (): void => {
        throw new Error();
      };
      const listener2 = spy();

      addTokenListener(app, listener1);
      addTokenListener(app, listener2);

      await getToken(app);

      expect(listener2).to.be.calledWith({
        token: fakeRecaptchaAppCheckToken.token
      });
    });

    it('loads persisted token to memory and returns it', async () => {
      const clock = useFakeTimers();
      activate(app);

      stub(storage, 'readTokenFromStorage').returns(
        Promise.resolve(fakeCachedAppCheckToken)
      );

      const clientStub = stub(client, 'exchangeToken');

      expect(getState(app).token).to.equal(undefined);
      expect(await getToken(app)).to.deep.equal({
        token: fakeCachedAppCheckToken.token
      });
      expect(getState(app).token).to.equal(fakeCachedAppCheckToken);
      expect(clientStub).has.not.been.called;

      clock.restore();
    });

    it('persists token to storage', async () => {
      activate(app);

      stub(storage, 'readTokenFromStorage').returns(Promise.resolve(undefined));
      stub(reCAPTCHA, 'getToken').returns(Promise.resolve(fakeRecaptchaToken));
      stub(client, 'exchangeToken').returns(
        Promise.resolve(fakeRecaptchaAppCheckToken)
      );
      const storageWriteStub = stub(storage, 'writeTokenToStorage');
      const result = await getToken(app);
      expect(result).to.deep.equal({ token: fakeRecaptchaAppCheckToken.token });
      expect(storageWriteStub).has.been.calledWith(
        app,
        fakeRecaptchaAppCheckToken
      );
    });

    it('returns the valid token in memory without making network request', async () => {
      const clock = useFakeTimers();
      activate(app);
      setState(app, { ...getState(app), token: fakeRecaptchaAppCheckToken });

      const clientStub = stub(client, 'exchangeToken');
      expect(await getToken(app)).to.deep.equal({
        token: fakeRecaptchaAppCheckToken.token
      });
      expect(clientStub).to.not.have.been.called;

      clock.restore();
    });

    it('force to get new token when forceRefresh is true', async () => {
      activate(app);
      setState(app, { ...getState(app), token: fakeRecaptchaAppCheckToken });

      stub(reCAPTCHA, 'getToken').returns(Promise.resolve(fakeRecaptchaToken));
      stub(client, 'exchangeToken').returns(
        Promise.resolve(fakeRecaptchaAppCheckToken)
      );

      expect(await getToken(app, true)).to.deep.equal({
        token: fakeRecaptchaAppCheckToken.token
      });
    });
  });

  describe('addTokenListener', () => {
    it('adds token listeners', () => {
      const listener = (): void => {};

      addTokenListener(app, listener);

      expect(getState(app).tokenListeners[0]).to.equal(listener);
    });

    it('starts proactively refreshing token after adding the first listener', () => {
      const listener = (): void => {};
      expect(getState(app).tokenListeners.length).to.equal(0);
      expect(getState(app).tokenRefresher).to.equal(undefined);

      addTokenListener(app, listener);

      expect(getState(app).tokenRefresher?.isRunning()).to.be.true;
    });

    it('notifies the listener with the valid token in memory immediately', done => {
      const clock = useFakeTimers();
      const fakeListener: AppCheckTokenListener = token => {
        expect(token).to.deep.equal({
          token: `fake-memory-app-check-token`,
          expirationTime: 123
        });
        clock.restore();
        done();
      };

      setState(app, {
        ...getState(app),
        token: {
          token: `fake-memory-app-check-token`,
          expirationTime: 123
        }
      });

      addTokenListener(app, fakeListener);
    });

    it('notifies the listener with the valid token in storage', done => {
      const clock = useFakeTimers();
      activate(app);
      stub(storage, 'readTokenFromStorage').returns(
        Promise.resolve({
          token: `fake-cached-app-check-token`,
          expirationTime: 123
        })
      );

      const fakeListener: AppCheckTokenListener = token => {
        expect(token).to.deep.equal({
          token: `fake-cached-app-check-token`,
          expirationTime: 123
        });
        clock.restore();
        done();
      };

      addTokenListener(app, fakeListener);
      clock.tick(1);
    });
  });

  describe('removeTokenListener', () => {
    it('should remove token listeners', () => {
      const listener = (): void => {};
      addTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(1);

      removeTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(0);
    });

    it('should stop proactively refreshing token after deleting the last listener', () => {
      const listener = (): void => {};

      addTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(1);
      expect(getState(app).tokenRefresher?.isRunning()).to.be.true;

      removeTokenListener(app, listener);
      expect(getState(app).tokenListeners.length).to.equal(0);
      expect(getState(app).tokenRefresher?.isRunning()).to.be.false;
    });
  });
});
