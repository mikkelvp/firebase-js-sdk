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
import { FirebaseApp } from '@firebase/app-types';
import { getFakeApp, getFakeGreCAPTCHA } from '../test/util';
import { initialize, RECAPTCHA_URL, getToken } from './recaptcha';
import * as utils from './util';
import { getState } from './state';
import { Deferred } from '@firebase/util';
import { activate } from './api';

describe('recaptcha', () => {
  let app: FirebaseApp;

  beforeEach(() => {
    app = getFakeApp();
  });

  afterEach(() => {
    removegreCAPTCHAScriptsOnPage();
  });

  describe('initialize()', () => {
    it('sets reCAPTCHAState', async () => {
      self.grecaptcha = getFakeGreCAPTCHA();
      expect(getState(app).reCAPTCHAState).to.equal(undefined);
      await initialize(app);
      expect(getState(app).reCAPTCHAState?.initialized).to.be.instanceof(
        Deferred
      );
    });

    it('loads reCAPTCHA script if it was not loaded already', async () => {
      const fakeRecaptcha = getFakeGreCAPTCHA();
      let count = 0;
      stub(utils, 'getRecaptcha').callsFake(() => {
        count++;
        if (count === 1) {
          return undefined;
        }

        return fakeRecaptcha;
      });

      expect(findgreCAPTCHAScriptsOnPage().length).to.equal(0);
      await initialize(app);
      expect(findgreCAPTCHAScriptsOnPage().length).to.equal(1);
    });

    it('creates invisible widget', async () => {
      const grecaptchaFake = getFakeGreCAPTCHA();
      const renderStub = stub(grecaptchaFake, 'render').callThrough();
      self.grecaptcha = grecaptchaFake;

      await initialize(app);

      expect(renderStub).to.be.calledWith(`fire_app_check_${app.name}`, {
        sitekey: (app.options as any).siteKey,
        size: 'invisible'
      });

      expect(getState(app).reCAPTCHAState?.widgetId).to.equal('fake_widget_1');
    });
  });

  describe('getToken()', () => {
    it('throws if AppCheck has not been activated yet', () => {
      return expect(getToken(app)).to.eventually.rejectedWith(
        /AppCheck is being used before activate\(\) is called/
      );
    });

    it('calls recaptcha.execute with correct widgetId', async () => {
      const grecaptchaFake = getFakeGreCAPTCHA();
      const executeStub = stub(grecaptchaFake, 'execute').returns(
        Promise.resolve('fake-recaptcha-token')
      );
      self.grecaptcha = grecaptchaFake;
      activate(app);
      await getToken(app);

      expect(executeStub).to.have.been.calledWith('fake_widget_1', {
        action: 'fire_app_check'
      });
    });

    it('resolves with token returned by recaptcha.execute', async () => {
      const grecaptchaFake = getFakeGreCAPTCHA();
      stub(grecaptchaFake, 'execute').returns(
        Promise.resolve('fake-recaptcha-token')
      );
      self.grecaptcha = grecaptchaFake;
      activate(app);
      const token = await getToken(app);

      expect(token).to.equal('fake-recaptcha-token');
    });
  });
});

/**
 * Returns all script tags in DOM matching our reCAPTCHA url pattern.
 * Tests in other files may have inserted multiple reCAPTCHA scripts, because they don't
 * care about it.
 */
function findgreCAPTCHAScriptsOnPage(): HTMLScriptElement[] {
  const scriptTags = window.document.getElementsByTagName('script');
  const tags = [];
  for (const tag of Object.values(scriptTags)) {
    if (tag.src && tag.src.includes(RECAPTCHA_URL)) {
      tags.push(tag);
    }
  }
  return tags;
}

function removegreCAPTCHAScriptsOnPage(): void {
  const tags = findgreCAPTCHAScriptsOnPage();

  for (const tag of tags) {
    tag.remove();
  }

  if (self.grecaptcha) {
    self.grecaptcha = undefined;
  }
}
