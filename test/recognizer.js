/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const { Dispatcher, RecognizerProperty } = require('../base/src/dispatcher/dispatcher');
const { expect } = require('chai');

describe('Recognizer', function () {

  before(function () {
    const mockWindow = {
      addEventListener: function () { },
      setTimeout: function () { return 1; }
    };
    global.window = mockWindow;
  });

  describe('Recognizer Properties', function () {
    it('should match nested property', function () {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      const context = { a: { b: { c: 123 } } };
      expect(property.match(context)).to.be.true;
    });

    it('should not match nested property', function () {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      const context = { a: { b: {} } };
      expect(property.match(context)).to.be.false;
    });

    it('should match direct property', function () {
      const property = new RecognizerProperty('a', 123);
      const context = { a: 123 };
      expect(property.match(context)).to.be.true;
    });

    it('should not match direct property', function () {
      const property = new RecognizerProperty('a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for not equals', function () {
      const property = new RecognizerProperty('NE', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.be.true;
    });

    it('should return true for greater than (type=number)', function () {
      const property = new RecognizerProperty('GT', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for greater than (type=number)', function () {
      const property = new RecognizerProperty('GT', 'a', 456);
      const context = { a: 123 };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for less than (type=number)', function () {
      const property = new RecognizerProperty('LT', 'a', 456);
      const context = { a: 123 };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for less than (type=number)', function () {
      const property = new RecognizerProperty('LT', 'a', 123);
      const context = { a: 456 };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for greater than (type=string)', function () {
      const property = new RecognizerProperty('GT', 'a', "abc");
      const context = { a: "cbc" };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for greater than (type=string)', function () {
      const property = new RecognizerProperty('GT', 'a', "cbc");
      const context = { a: "abc" };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for less than (type=string)', function () {
      const property = new RecognizerProperty('LT', 'a', "cbc");
      const context = { a: "abc" };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for less than (type=string)', function () {
      const property = new RecognizerProperty('LT', 'a', "abc");
      const context = { a: "cbc" };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for greater than (type=string to number)', function () {
      const property = new RecognizerProperty('GT', 'a', "123");
      const context = { a: 456 };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for greater than (type=string to number)', function () {
      const property = new RecognizerProperty('GT', 'a', "456");
      const context = { a: 123 };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for less than (type=string to number)', function () {
      const property = new RecognizerProperty('LT', 'a', "456");
      const context = { a: 123 };
      expect(property.match(context)).to.be.true;
    });

    it('should return false for less than (type=string to number)', function () {
      const property = new RecognizerProperty('LT', 'a', "123");
      const context = { a: 456 };
      expect(property.match(context)).to.be.false;
    });

    it('should return true for GE (type=number)', function () {
      const property = new RecognizerProperty('GE', 'a', 123);
      const context = { a: 123 };
      expect(property.match(context)).to.be.true;
    });

    it('should return true for LE (type=number)', function () {
      const property = new RecognizerProperty('LE', 'a', 456);
      const context = { a: 456 };
      expect(property.match(context)).to.be.true;
    });

    it('should return true for GE (type=string)', function () {
      const property = new RecognizerProperty('GE', 'a', "abb");
      const context = { a: "abc" };
      expect(property.match(context)).to.be.true;
    });

    it('should return true for LE (type=string)', function () {
      const property = new RecognizerProperty('LE', 'a', "abc");
      const context = { a: "abb" };
      expect(property.match(context)).to.be.true;
    });

    it('should not accept bad operator', function () {
      expect(function () { new RecognizerProperty('BAD', 'a', 123); }).to.throw('ZWED5023E');
    });

    it('should match array length', function () {
      const property = new RecognizerProperty(['a', 'length'], 3);
      const context = { a: [0, 1, 2] };
      expect(property.match(context)).to.be.true;
    });
  });

  describe('Recognizer Properties using Dispatcher', function () {
    let dispatcher;
    let testAction;
    const nop = function () { };

    beforeEach(function () {
      const mockupLogger = {
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

    it('should find action for recognizer with nested property', function () {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: { b: { c: 123 } } });
      expect(result.actions).to.eql([testAction]);
    });

    it('should not find action for recognizer with nested property', function () {
      const property = new RecognizerProperty(['a', 'b', 'c'], 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: { b: {} } });
      expect(result.actions).to.be.undefined;
    });

    it('should not find action for recognizer with NE operator property', function () {
      const property = new RecognizerProperty('NE', 'a', 123);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: 123 });
      expect(result.actions).to.be.undefined;
    });

    it('should find action for recognizer with NE operator property', function () {
      const property = new RecognizerProperty('NE', 'a', 666);
      dispatcher.addRecognizer(property, testAction.id);
      const result = dispatcher.getAbstractActions([], { a: 123 });
      expect(result.actions).to.eql([testAction]);
    });
  });
});

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
