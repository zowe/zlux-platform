/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const { Plugin } = require('../base/src/plugin-manager/plugin');
const { expect } = require('chai');

describe('Plugin', function () {
  describe('parsePluginDefinition', function () {
    it('should parse a valid apiVersion 0 plugin', function () {
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

    it('should parse a valid apiVersion 1 plugin', function () {
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

    it('should parse a valid apiVersion 2 plugin', function () {
      const definition = {
        apiVersion: '2.0.0',
        identifier: 'org.zowe.v2plugin',
        pluginVersion: '1.0.0',
        pluginType: 'library'
      };
      const plugin = Plugin.parsePluginDefinition(definition);
      expect(plugin.identifier).to.equal('org.zowe.v2plugin');
    });

    it('should throw for unrecognized apiVersion major', function () {
      const definition = {
        apiVersion: '99.0.0',
        identifier: 'org.zowe.future',
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5038E');
    });

    it('should throw for invalid apiVersion string', function () {
      const definition = {
        apiVersion: 'invalid',
        identifier: 'org.zowe.bad',
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5043E');
    });

    it('should throw when identifier is not a string', function () {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 123,
        pluginVersion: '1.0.0',
        pluginType: 'application'
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5039E');
    });

    it('should throw when pluginVersion is not a string', function () {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: 123,
        pluginType: 'application'
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5040E');
    });

    it('should throw when pluginType is invalid', function () {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: '1.0.0',
        pluginType: 'invalidType'
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5041E');
    });

    it('should throw when pluginType is not a string', function () {
      const definition = {
        apiVersion: '1.0.0',
        identifier: 'org.zowe.test',
        pluginVersion: '1.0.0',
        pluginType: 123
      };
      expect(function () { Plugin.parsePluginDefinition(definition); }).to.throw('ZWED5042E');
    });
  });

  describe('Plugin instance methods', function () {
    let plugin;

    before(function () {
      plugin = Plugin.parsePluginDefinition({
        apiVersion: '1.0.0',
        identifier: 'org.zowe.methods',
        pluginVersion: '3.2.1',
        pluginType: 'application',
        webContent: { hasComponents: true },
        copyright: '(c) Zowe'
      });
    });

    it('getIdentifier should return identifier', function () {
      expect(plugin.getIdentifier()).to.equal('org.zowe.methods');
    });

    it('getVersion should return version', function () {
      expect(plugin.getVersion()).to.equal('3.2.1');
    });

    it('getKey should return identifier@version', function () {
      expect(plugin.getKey()).to.equal('org.zowe.methods@3.2.1');
    });

    it('getWebContent should return webContent', function () {
      expect(plugin.getWebContent()).to.deep.include({ hasComponents: true });
    });

    it('getCopyright should return copyright', function () {
      expect(plugin.getCopyright()).to.equal('(c) Zowe');
    });

    it('hasComponents should return true when webContent has it', function () {
      expect(plugin.hasComponents()).to.be.true;
    });

    it('toString should include key', function () {
      expect(plugin.toString()).to.include('org.zowe.methods@3.2.1');
    });

    it('getBasePlugin should return definition', function () {
      expect(plugin.getBasePlugin()).to.have.property('identifier', 'org.zowe.methods');
    });
  });

  describe('Plugin without webContent', function () {
    it('should handle missing webContent', function () {
      const plugin = Plugin.parsePluginDefinition({
        apiVersion: '1.0.0',
        identifier: 'org.zowe.noweb',
        pluginVersion: '1.0.0',
        pluginType: 'nodeAuthentication'
      });
      expect(plugin.hasComponents()).to.be.false;
    });
  });

  describe('Plugin types', function () {
    const types = ['desktop', 'application', 'bootstrap', 'library', 'nodeAuthentication'];

    types.forEach(function (type) {
      it('should parse pluginType "' + type + '"', function () {
        const plugin = Plugin.parsePluginDefinition({
          apiVersion: '1.0.0',
          identifier: 'org.zowe.' + type,
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
