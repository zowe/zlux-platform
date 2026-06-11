/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const { SemanticVersion } = require('../base/src/util/semantic-version');
const { expect } = require('chai');

describe('SemanticVersion', function () {
  describe('constructor', function () {
    it('should parse major.minor.patch', function () {
      const v = new SemanticVersion('1.2.3');
      expect(v.major).to.equal(1);
      expect(v.minor).to.equal(2);
      expect(v.patch).to.equal(3);
    });

    it('should parse major.minor without patch', function () {
      const v = new SemanticVersion('2.5');
      expect(v.major).to.equal(2);
      expect(v.minor).to.equal(5);
      expect(v.patch).to.be.null;
    });

    it('should parse version with pre-release identifiers', function () {
      const v = new SemanticVersion('1.0.0-alpha');
      expect(v.major).to.equal(1);
      expect(v.minor).to.equal(0);
      expect(v.patch).to.equal(0);
      expect(v.identifiers).to.equal('alpha');
    });

    it('should parse version with build metadata', function () {
      const v = new SemanticVersion('1.0.0+build123');
      expect(v.major).to.equal(1);
      expect(v.minor).to.equal(0);
      expect(v.patch).to.equal(0);
      expect(v.build).to.equal('build123');
    });

    it('should parse version with both identifiers and build', function () {
      const v = new SemanticVersion('3.2.1-beta+20230101');
      expect(v.major).to.equal(3);
      expect(v.minor).to.equal(2);
      expect(v.patch).to.equal(1);
      expect(v.identifiers).to.equal('beta');
      expect(v.build).to.equal('20230101');
    });

    it('should parse version 0.0.0', function () {
      const v = new SemanticVersion('0.0.0');
      expect(v.major).to.equal(0);
      expect(v.minor).to.equal(0);
      expect(v.patch).to.equal(0);
    });

    it('should parse large version numbers', function () {
      const v = new SemanticVersion('100.200.300');
      expect(v.major).to.equal(100);
      expect(v.minor).to.equal(200);
      expect(v.patch).to.equal(300);
    });

    it('should set identifiers to null when not present', function () {
      const v = new SemanticVersion('1.2.3');
      expect(v.identifiers).to.be.null;
    });

    it('should set build to null when not present', function () {
      const v = new SemanticVersion('1.2.3');
      expect(v.build).to.be.null;
    });

    it('should throw on invalid version string', function () {
      expect(function () { new SemanticVersion('invalid'); }).to.throw('ZWED5043E');
    });

    it('should throw on empty string', function () {
      expect(function () { new SemanticVersion(''); }).to.throw('ZWED5043E');
    });

    it('should throw on single number', function () {
      expect(function () { new SemanticVersion('1'); }).to.throw('ZWED5043E');
    });

    it('should throw on version with letters in numbers', function () {
      expect(function () { new SemanticVersion('1.a.3'); }).to.throw('ZWED5043E');
    });

    it('should handle numeric pre-release identifiers', function () {
      const v = new SemanticVersion('1.0.0-1');
      expect(v.identifiers).to.equal('1');
    });

    it('should handle hyphenated pre-release identifiers', function () {
      const v = new SemanticVersion('1.0.0-rc-1');
      expect(v.identifiers).to.equal('rc-1');
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
