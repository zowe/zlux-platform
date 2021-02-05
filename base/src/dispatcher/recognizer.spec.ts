/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Dispatcher, RecognizerProperty } from './dispatcher';
import { expect } from 'chai';
import { describe } from 'mocha'

describe('Recognizer', () => {

  before(() => {
    const mockWindow: Partial<Window> = {
      addEventListener: () => { },
      setTimeout: () => 1
    };
    global.window = <any>mockWindow;
  });

  describe('Recognizer Properties', () => {
    it('should match nested property', () => {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      const context = { a: { b: { c: 123 } } };
      expect(property.match(context)).to.true;
    });

    it(`shouldn't match nested property`, () => {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      const context = { a: { b: {} } };
      expect(property.match(context)).to.false;
    });

    it('should match direct property', () => {
      const property = new RecognizerProperty('a', 123);
      const context = { a: 123 };
      expect(property.match(context)).to.true;
    });

    it(`shouldn't match direct property`, () => {
      const property = new RecognizerProperty('a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.false;
    });

    it(`should return true for not equals`, () => {
      const property = new RecognizerProperty('NE', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.true;
    });

    it(`should return true for greater than (type=number)`, () => {
      const property = new RecognizerProperty('GT', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.true;
    });

    it(`should return false for greater than (type=number)`, () => {
      const property = new RecognizerProperty('GT', 'a', 456);
      const context = { a: 123 };
      expect(property.match(context)).to.false;
    });

    it(`should return true for less than (type=number)`, () => {
      const property = new RecognizerProperty('LT', 'a', 456);
      const context = { a: 123 };
      expect(property.match(context)).to.true;
    });

    it(`should return false for less than (type=number)`, () => {
      const property = new RecognizerProperty('LT', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.false;
    });

    it(`should return true for greater than (type=string)`, () => {
      const property = new RecognizerProperty('GT', 'a', "abc");
      const context = { a: "cbc" };
      expect(property.match(context)).to.true;
    });

    it(`should return false for greater than (type=string)`, () => {
      const property = new RecognizerProperty('GT', 'a', "cbc");
      const context = { a: "abc" };
      expect(property.match(context)).to.false;
    });

    it(`should return true for less than (type=string)`, () => {
      const property = new RecognizerProperty('LT', 'a', "cbc");
      const context = { a: "abc" };
      expect(property.match(context)).to.true;
    });

    it(`should return false for less than (type=string)`, () => {
      const property = new RecognizerProperty('LT', 'a', "abc");
      const context = { a: "cbc" };
      expect(property.match(context)).to.false;
    });

    it(`should return true for greater than (type=string to number)`, () => {
      const property = new RecognizerProperty('GT', 'a', "123");
      const context = { a: 456 };
      expect(property.match(context)).to.true;
    });

    it(`should return false for greater than (type=string to number)`, () => {
      const property = new RecognizerProperty('GT', 'a', "456");
      const context = { a: 123 };
      expect(property.match(context)).to.false;
    });

    it(`should return true for less than (type=string to number)`, () => {
      const property = new RecognizerProperty('LT', 'a', "456");
      const context = { a: 123 };
      expect(property.match(context)).to.true;
    });

    it(`should return false for less than (type=string to number)`, () => {
      const property = new RecognizerProperty('LT', 'a', "123");
      const context = { a: 456 };
      expect(property.match(context)).to.false;
    });

    it(`should not accept bad operator`, () => {
      const badRecognizerPropertyFn = () => new RecognizerProperty('BAD', 'a', 123);
      expect(badRecognizerPropertyFn).to.throw('ZWED5023E');
    });
  });

  describe('Recognizer Properties using Dispatcher', () => {
    let dispatcher: Dispatcher;
    let testAction: ZLUX.Action;
    const nop = () => { };

    beforeEach(() => {
      const mockupLogger = <ZLUX.ComponentLogger>{
        debug: nop,
        warn: nop,
        info: nop,
      };
      dispatcher = new Dispatcher(mockupLogger);

      const actionTitle = 'test action';
      const actionId = 'org.zowe.zlux.test.action';
      const argumentFormatter = { data: { op: 'deref', source: 'event', path: ['data'] } };
      const type = dispatcher.constants.ActionType.Launch;
      const mode = dispatcher.constants.ActionTargetMode.PluginCreate;
      testAction = dispatcher.makeAction(actionId, actionTitle, mode, type, 'target.plugin.id', argumentFormatter);
      dispatcher.registerAction(testAction);
    });

    it('should find action for recognizer with nested property', () => {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: { b: { c: 123 } } });
      expect(result.actions).to.eql([testAction]);
    });

    it(`shouldn't find action for recognizer with nested property`, () => {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: { b: {} } });
      expect(result.actions).to.undefined;
    });
    it(`shouldn't find action for recognizer with NE operator property`, () => {
      const property = new RecognizerProperty('NE', 'a', 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: 123 });
      expect(result.actions).to.undefined;
    });
    it(`should find action for recognizer with NE operator property`, () => {
      const property = new RecognizerProperty('NE', 'a', 666);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: 123 });
      expect(result.actions).to.eql([testAction]);
    });
  })
});

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
