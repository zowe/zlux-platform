/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const { ZoweNotification } = require('../base/src/notification-manager/notification');
const { expect } = require('chai');

describe('ZoweNotification', function () {
  describe('constructor', function () {
    it('should create a notification with all parameters', function () {
      const notification = new ZoweNotification('Title', 'Message', 1, 'org.zowe.plugin', 'custom-class');
      expect(notification).to.exist;
    });

    it('should use default style class when not provided', function () {
      const notification = new ZoweNotification('Title', 'Message', 0, 'org.zowe.plugin');
      expect(notification.getStyleClass()).to.equal('org_zowe_zlux_ng2desktop_snackbar');
    });

    it('should use custom style class when provided', function () {
      const notification = new ZoweNotification('Title', 'Message', 0, 'org.zowe.plugin', 'my-class');
      expect(notification.getStyleClass()).to.equal('my-class');
    });
  });

  describe('getTitle', function () {
    it('should return the title', function () {
      const notification = new ZoweNotification('My Title', 'msg', 0, 'plugin');
      expect(notification.getTitle()).to.equal('My Title');
    });
  });

  describe('getMessage', function () {
    it('should return the message', function () {
      const notification = new ZoweNotification('title', 'Hello World', 0, 'plugin');
      expect(notification.getMessage()).to.equal('Hello World');
    });
  });

  describe('getTime', function () {
    it('should return a Date object', function () {
      const notification = new ZoweNotification('title', 'msg', 0, 'plugin');
      expect(notification.getTime()).to.be.instanceOf(Date);
    });

    it('should return approximately current time', function () {
      const before = Date.now();
      const notification = new ZoweNotification('title', 'msg', 0, 'plugin');
      const after = Date.now();
      const time = notification.getTime().getTime();
      expect(time).to.be.at.least(before);
      expect(time).to.be.at.most(after);
    });
  });

  describe('getType', function () {
    it('should return the notification type', function () {
      const notification = new ZoweNotification('title', 'msg', 2, 'plugin');
      expect(notification.getType()).to.equal(2);
    });
  });

  describe('getPlugin', function () {
    it('should return the plugin identifier', function () {
      const notification = new ZoweNotification('title', 'msg', 0, 'org.zowe.test');
      expect(notification.getPlugin()).to.equal('org.zowe.test');
    });
  });

  describe('getStyleClass', function () {
    it('should return default when not set', function () {
      const notification = new ZoweNotification('title', 'msg', 0, 'plugin');
      expect(notification.getStyleClass()).to.equal('org_zowe_zlux_ng2desktop_snackbar');
    });

    it('should return custom class when set', function () {
      const notification = new ZoweNotification('title', 'msg', 0, 'plugin', 'custom');
      expect(notification.getStyleClass()).to.equal('custom');
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
