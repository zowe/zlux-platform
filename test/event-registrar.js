/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

const { expect } = require('chai');
const { EventRegistrar } = require('../base/src/dispatcher/event-registrar');

describe('EventRegistrar', function () {
  let registrar;

  beforeEach(function () {
    registrar = new EventRegistrar();
  });

  describe('createFullEventId', function () {
    it('should create event ID with correct prefix', function () {
      const id = registrar.createFullEventId('click', 'inst1', 5);
      expect(id).to.match(/^click_inst1_/);
    });

    it('should create event ID with specified length suffix', function () {
      const id = registrar.createFullEventId('click', 'inst1', 10);
      const suffix = id.replace('click_inst1_', '');
      expect(suffix).to.have.lengthOf(10);
    });

    it('should create unique IDs on repeated calls', function () {
      const ids = new Set();
      for (let i = 0; i < 20; i++) {
        ids.add(registrar.createFullEventId('test', 'app1', 8));
      }
      // With 8 random chars from 62, collisions are extremely unlikely
      expect(ids.size).to.be.greaterThan(1);
    });

    it('should only use alphanumeric characters in suffix', function () {
      const id = registrar.createFullEventId('evt', 'i', 20);
      const suffix = id.replace('evt_i_', '');
      expect(suffix).to.match(/^[A-Za-z0-9]+$/);
    });
  });

  describe('findIndexOfEvent', function () {
    it('should find index of matching event', function () {
      const list = ['click_inst1_abc', 'hover_inst2_def', 'click_inst3_ghi'];
      const idx = registrar.findIndexOfEvent('click', 'inst1', list);
      expect(idx).to.equal(0);
    });

    it('should return null when no match found', function () {
      const list = ['click_inst1_abc', 'hover_inst2_def'];
      const idx = registrar.findIndexOfEvent('click', 'inst99', list);
      expect(idx).to.be.null;
    });

    it('should match correct instance ID', function () {
      const list = ['click_inst1_abc', 'click_inst2_def'];
      const idx = registrar.findIndexOfEvent('click', 'inst2', list);
      expect(idx).to.equal(1);
    });
  });

  describe('registerEvent', function () {
    it('should register a new event type', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', 'inst1');
      expect(codes).to.have.lengthOf(1);
      expect(codes[0]).to.match(/^click_inst1_/);
    });

    it('should register multiple events for same type and plugin', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.registerEvent('click', 'org.zowe.app1', 'inst2');
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', null);
      expect(codes).to.have.lengthOf(2);
    });

    it('should register events for different plugins', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.registerEvent('click', 'org.zowe.app2', 'inst1');
      const codes1 = registrar.findEventCodes('click', 'org.zowe.app1', null);
      const codes2 = registrar.findEventCodes('click', 'org.zowe.app2', null);
      expect(codes1).to.have.lengthOf(1);
      expect(codes2).to.have.lengthOf(1);
    });

    it('should register events for different event types', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.registerEvent('hover', 'org.zowe.app1', 'inst1');
      const clicks = registrar.findEventCodes('click', null, null);
      const hovers = registrar.findEventCodes('hover', null, null);
      expect(clicks).to.have.lengthOf(1);
      expect(hovers).to.have.lengthOf(1);
    });
  });

  describe('deregisterEvent', function () {
    it('should remove a registered event', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.deregisterEvent('click', 'org.zowe.app1', 'inst1');
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', null);
      expect(codes).to.have.lengthOf(0);
    });

    it('should only remove the specified event instance', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.registerEvent('click', 'org.zowe.app1', 'inst2');
      registrar.deregisterEvent('click', 'org.zowe.app1', 'inst1');
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', null);
      expect(codes).to.have.lengthOf(1);
      expect(codes[0]).to.match(/^click_inst2_/);
    });

    it('should handle deregistering non-existent event gracefully', function () {
      expect(function () {
        registrar.deregisterEvent('click', 'org.zowe.app1', 'inst1');
      }).to.not.throw();
    });

    it('should clean up plugin entry when last event removed', function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.deregisterEvent('click', 'org.zowe.app1', 'inst1');
      const codes = registrar.findEventCodes('click', null, null);
      expect(codes).to.have.lengthOf(0);
    });

    it('should handle non-existent event type', function () {
      expect(function () {
        registrar.deregisterEvent('nonexistent', 'org.zowe.app1', 'inst1');
      }).to.not.throw();
    });
  });

  describe('findEventCodes', function () {
    beforeEach(function () {
      registrar.registerEvent('click', 'org.zowe.app1', 'inst1');
      registrar.registerEvent('click', 'org.zowe.app1', 'inst2');
      registrar.registerEvent('click', 'org.zowe.app2', 'inst3');
      registrar.registerEvent('hover', 'org.zowe.app1', 'inst1');
    });

    it('should return all events for a type when pluginId and instanceId are null', function () {
      const codes = registrar.findEventCodes('click', null, null);
      expect(codes).to.have.lengthOf(3);
    });

    it('should return events for specific plugin', function () {
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', null);
      expect(codes).to.have.lengthOf(2);
    });

    it('should return specific event by plugin and instance', function () {
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', 'inst1');
      expect(codes).to.have.lengthOf(1);
    });

    it('should return empty array for non-existent event type', function () {
      const codes = registrar.findEventCodes('nonexistent', null, null);
      expect(codes).to.deep.equal([]);
    });

    it('should return empty array for non-existent plugin', function () {
      const codes = registrar.findEventCodes('click', 'org.zowe.nonexistent', null);
      expect(codes).to.deep.equal([]);
    });

    it('should return empty array for non-existent instance', function () {
      const codes = registrar.findEventCodes('click', 'org.zowe.app1', 'nonexistent');
      expect(codes).to.deep.equal([]);
    });
  });
});
