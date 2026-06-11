/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Plugin } from './plugin';
import { expect } from 'chai';

describe('Plugin', () => {
  describe('parsePluginDefinition', () => {
    it('should parse a valid apiVersion 0 plugin', () => {
      const definition = {
        apiVersion: '0.1.0',
        identifier: 'org.zowe.testplugin',
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      const plugin = Plugin.parsePluginDefinition(definition);
      expect(plugin.identifier).to.equal('org.zowe.testplugin');
      expect(plugin.version).to.equal('1.0.0');
    });

    it('should parse a valid apiVersion 1 plugin', () => {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.v1plugin',
        pluginVersion: '2.3.4',
        pluginType: 'desktop'
      };
      const plugin = Plugin.parsePluginDefinition(definition);
      expect(plugin.identifier).to.equal('org.zowe.v1plugin');
      expect(plugin.version).to.equal('2.3.4');
    });

    it('should parse a valid apiVersion 2 plugin', () => {
      const definition = {
        apiVersion: '2.0.0',
        identifier: 'org.zowe.v2plugin',
        pluginVersion: '1.0.0',
        pluginType: 'library'
      };
      const plugin = Plugin.parsePluginDefinition(definition);
      expect(plugin.identifier).to.equal('org.zowe.v2plugin');
    });

    it('should throw for unrecognized apiVersion major', () => {
      const definition = {
        apiVersion: '99.0.0',
        identifier: 'org.zowe.future',
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5038E');
    });

    it('should throw for invalid apiVersion string', () => {
      const definition = {
        apiVersion: 'invalid',
        identifier: 'org.zowe.bad',
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5043E');
    });

    it('should throw when identifier is not a string', () => {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 123,
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5039E');
    });

    it('should throw when pluginVersion is not a string', () => {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: 123,
        pluginType: 'application'
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5040E');
    });

    it('should throw when pluginType is invalid', () => {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: '1.0.0',
        pluginType: 'invalidType'
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5041E');
    });

    it('should throw when pluginType is not a string', () => {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: '1.0.0',
        pluginType: 123
      };
      expect(() => Plugin.parsePluginDefinition(definition)).to.throw('ZWED5042E');
    });
  });

  describe('Plugin instance methods', () => {
    let plugin: any;

    before(() => {
      plugin = Plugin.parsePluginDefinition({
        apiVersion: '1.0.0',
        identifier: 'org.zowe.methods',
        pluginVersion: '3.2.1',
        pluginType: 'application',
        webContent: { hasComponents: true },
        copyright: '(c) Zowe'
      });
    });

    it('getIdentifier should return identifier', () => {
      expect(plugin.getIdentifier()).to.equal('org.zowe.methods');
    });

    it('getVersion should return version', () => {
      expect(plugin.getVersion()).to.equal('3.2.1');
    });

    it('getKey should return identifier@version', () => {
      expect(plugin.getKey()).to.equal('org.zowe.methods@3.2.1');
    });

    it('getWebContent should return webContent', () => {
      expect(plugin.getWebContent()).to.deep.include({ hasComponents: true });
    });

    it('getCopyright should return copyright', () => {
      expect(plugin.getCopyright()).to.equal('(c) Zowe');
    });

    it('hasComponents should return true when webContent has it', () => {
      expect(plugin.hasComponents()).to.be.true;
    });

    it('toString should include key', () => {
      expect(plugin.toString()).to.include('org.zowe.methods@3.2.1');
    });

    it('getBasePlugin should return definition', () => {
      expect(plugin.getBasePlugin()).to.have.property('identifier', 'org.zowe.methods');
    });
  });

  describe('Plugin without webContent', () => {
    it('should handle missing webContent', () => {
      const plugin = Plugin.parsePluginDefinition({
        apiVersion: '1.0.0',
        identifier: 'org.zowe.noweb',
        pluginVersion: '1.0.0',
        pluginType: 'nodeAuthentication'
      });
      expect(plugin.hasComponents()).to.be.false;
    });
  });

  describe('Plugin types', () => {
    const types = ['desktop', 'application', 'bootstrap', 'library', 'nodeAuthentication'];

    types.forEach(type => {
      it(`should parse pluginType "${type}"`, () => {
        const plugin = Plugin.parsePluginDefinition({
          apiVersion: '1.0.0',
          identifier: `org.zowe.${type}`,
          pluginVersion: '1.0.0',
          pluginType: type
        });
        expect(plugin).to.exist;
      });
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
