/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Registry } from './registry';
import { expect } from 'chai';

describe('Registry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(registry).to.exist;
    });
  });

  describe('registerComponentFactory', () => {
    it('should register a factory', () => {
      const mockFactory: any = {
        getCapabilities: () => ['cap1'],
        getClass: () => 'MyComponent'
      };
      registry.registerComponentFactory(mockFactory);
      const results = registry.getComponentFactories('MyComponent' as any, []);
      expect(results).to.have.lengthOf(1);
    });

    it('should register multiple factories', () => {
      const factory1: any = { getCapabilities: () => ['cap1'], getClass: () => 'Comp' };
      const factory2: any = { getCapabilities: () => ['cap2'], getClass: () => 'Comp' };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('Comp' as any, []);
      expect(results).to.have.lengthOf(2);
    });
  });

  describe('getComponentFactories', () => {
    it('should return empty array when no factories registered', () => {
      const results = registry.getComponentFactories('NoSuch' as any, []);
      expect(results).to.be.an('array').that.is.empty;
    });

    it('should filter by component class', () => {
      const factory1: any = { getCapabilities: () => ['cap1'], getClass: () => 'ClassA' };
      const factory2: any = { getCapabilities: () => ['cap1'], getClass: () => 'ClassB' };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('ClassA' as any, []);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(factory1);
    });

    it('should filter by capabilities', () => {
      const factory1: any = { getCapabilities: () => ['cap1', 'cap2'], getClass: () => 'Comp' };
      const factory2: any = { getCapabilities: () => ['cap1'], getClass: () => 'Comp' };
      registry.registerComponentFactory(factory1);
      registry.registerComponentFactory(factory2);
      const results = registry.getComponentFactories('Comp' as any, ['cap1', 'cap2'] as any);
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.equal(factory1);
    });

    it('should return factories matching all capabilities', () => {
      const factory: any = { getCapabilities: () => ['cap1', 'cap2', 'cap3'], getClass: () => 'Comp' };
      registry.registerComponentFactory(factory);
      const results = registry.getComponentFactories('Comp' as any, ['cap1', 'cap3'] as any);
      expect(results).to.have.lengthOf(1);
    });

    it('should not return factory missing a required capability', () => {
      const factory: any = { getCapabilities: () => ['cap1'], getClass: () => 'Comp' };
      registry.registerComponentFactory(factory);
      const results = registry.getComponentFactories('Comp' as any, ['cap1', 'cap2'] as any);
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
