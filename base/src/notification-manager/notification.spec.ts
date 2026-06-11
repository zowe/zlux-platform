/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { ZoweNotification } from './notification';
import { expect } from 'chai';

describe('ZoweNotification', () => {
  describe('constructor', () => {
    it('should create a notification with all parameters', () => {
      const notification = new ZoweNotification('Title', 'Message', 1 as any, 'org.zowe.plugin', 'custom-class');
      expect(notification).to.exist;
    });

    it('should use default style class when not provided', () => {
      const notification = new ZoweNotification('Title', 'Message', 0 as any, 'org.zowe.plugin');
      expect(notification.getStyleClass()).to.equal('org_zowe_zlux_ng2desktop_snackbar');
    });

    it('should use custom style class when provided', () => {
      const notification = new ZoweNotification('Title', 'Message', 0 as any, 'org.zowe.plugin', 'my-class');
      expect(notification.getStyleClass()).to.equal('my-class');
    });
  });

  describe('getTitle', () => {
    it('should return the title', () => {
      const notification = new ZoweNotification('My Title', 'msg', 0 as any, 'plugin');
      expect(notification.getTitle()).to.equal('My Title');
    });
  });

  describe('getMessage', () => {
    it('should return the message', () => {
      const notification = new ZoweNotification('title', 'Hello World', 0 as any, 'plugin');
      expect(notification.getMessage()).to.equal('Hello World');
    });
  });

  describe('getTime', () => {
    it('should return a Date object', () => {
      const notification = new ZoweNotification('title', 'msg', 0 as any, 'plugin');
      expect(notification.getTime()).to.be.instanceOf(Date);
    });

    it('should return approximately current time', () => {
      const before = Date.now();
      const notification = new ZoweNotification('title', 'msg', 0 as any, 'plugin');
      const after = Date.now();
      const time = notification.getTime().getTime();
      expect(time).to.be.at.least(before);
      expect(time).to.be.at.most(after);
    });
  });

  describe('getType', () => {
    it('should return the notification type', () => {
      const notification = new ZoweNotification('title', 'msg', 2 as any, 'plugin');
      expect(notification.getType()).to.equal(2);
    });
  });

  describe('getPlugin', () => {
    it('should return the plugin identifier', () => {
      const notification = new ZoweNotification('title', 'msg', 0 as any, 'org.zowe.test');
      expect(notification.getPlugin()).to.equal('org.zowe.test');
    });
  });

  describe('getStyleClass', () => {
    it('should return default when not set', () => {
      const notification = new ZoweNotification('title', 'msg', 0 as any, 'plugin');
      expect(notification.getStyleClass()).to.equal('org_zowe_zlux_ng2desktop_snackbar');
    });

    it('should return custom class when set', () => {
      const notification = new ZoweNotification('title', 'msg', 0 as any, 'plugin', 'custom');
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
