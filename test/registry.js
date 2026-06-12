/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const { Registry } = require('../base/src/registry/registry');
const { expect } = require('chai');

describe('Registry', function () {
  let registry;

  beforeEach(function () {
    registry = new Registry();
  });

  describe('constructor', function () {
    it('should create an instance', function () {
      expect(registry).to.exist;
    });
  });

  describe('registerComponentFactory', function () {
    it('should register a factory', function () {
      const mockFactory = {
        getCapabilities: function () { return ['cap1']; },
        getClass: function () { return 'MyComponent'; }
      };
      registry.registerComponentFactory(mockFactory);
      const results = registry.getComponentFactories('MyComponent', []);
      expect(results).to.have.lengthOf(1);
    });

    it('should register multiple factories', function () {
      const factory1 = { getCapabilities: function () { return ['cap1']; }, getClass: function () { return 'Comp'; } };
      const factory2 = { getCapabilities: function () { return ['cap2']; }, getClass: function () { return 'Comp'; } };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('Comp', []);
      expect(results).to.have.lengthOf(2);
    });
  });

  describe('getComponentFactories', function () {
    it('should return empty array when no factories registered', function () {
      const results = registry.getComponentFactories('NoSuch', []);
      expect(results).to.be.an('array').that.is.empty;
    });

    it('should filter by component class', function () {
      const factory1 = { getCapabilities: function () { return ['cap1']; }, getClass: function () { return 'ClassA'; } };
      const factory2 = { getCapabilities: function () { return ['cap1']; }, getClass: function () { return 'ClassB'; } };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('ClassA', []);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(factory1);
    });

    it('should filter by capabilities', function () {
      const factory1 = { getCapabilities: function () { return ['cap1', 'cap2']; }, getClass: function () { return 'Comp'; } };
      const factory2 = { getCapabilities: function () { return ['cap1']; }, getClass: function () { return 'Comp'; } };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('Comp', ['cap1', 'cap2']);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(factory1);
    });

    it('should return factories matching all capabilities', function () {
      const factory = { getCapabilities: function () { return ['cap1', 'cap2', 'cap3']; }, getClass: function () { return 'Comp'; } };
      registry.registerComponentFactory(factory);
      const results = registry.getComponentFactories('Comp', ['cap1', 'cap3']);
      expect(results).to.have.lengthOf(1);
    });

    it('should not return factory missing a required capability', function () {
      const factory = { getCapabilities: function () { return ['cap1']; }, getClass: function () { return 'Comp'; } };
      registry.registerComponentFactory(factory);
      const results = registry.getComponentFactories('Comp', ['cap1', 'cap2']);
      expect(results).to.be.empty;
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
