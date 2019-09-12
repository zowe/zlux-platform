
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { ZoweNotification } from './notification';

let urlSet: boolean = false;

export class ZoweNotificationManager implements MVDHosting.ZoweNotificationManagerInterface {
  public notificationCache: any[];
  private handlers: MVDHosting.ZoweNotificationWatcher[];
  private restUrl: string;
  public idCount: number;

  constructor() {
    this.notificationCache = new Array<ZoweNotification>();
    this.handlers = new Array<MVDHosting.ZoweNotificationWatcher>();
    this.idCount = 0;
  }

  _setURL(wsUrl: string, restUrl: string): void {
    if (!urlSet) {
      this.restUrl = restUrl;
      let ws = new WebSocket(wsUrl);
      var _this = this;
      ws.onmessage = function(message) {
        _this.notificationCache.push((JSON.parse(message.data)['notification']) as ZoweNotification)
        _this.updateHandlers(JSON.parse(message.data)['notification']);
      }
      ws.onclose = () => {
        ws = new WebSocket(wsUrl)
      }
      ws.onerror = () => {
        ws = new WebSocket(wsUrl)
      }
      urlSet = true;
    }
  }

  createNotification(title: string, message: string, type: number, plugin: string, config?: any): ZoweNotification {
    let notification = new ZoweNotification(this.idCount, title, message, type, plugin, config)
    this.idCount = this.idCount + 1;
    return notification;
  }

  updateHandlers(message: any): void {
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded(message, this.notificationCache.length -1);
    }
  }

  notify(notification: ZoweNotification): number {
    this.notificationCache.push(notification);
    this.updateHandlers(notification)
    return this.notificationCache.length;
  }

  serverNotify(message: any): any { 
    return fetch(this.restUrl, 
      {
        method: 'POST',    
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })
  }

  dismissNotification(id: number) {
    this.notificationCache.splice(this.notificationCache.findIndex(x => x.id === id), 1)
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageRemoved(id);
    }
  }

  getAll(): ZoweNotification[] {
    let copy: ZoweNotification[] = this.notificationCache.slice(0);

    /* NgFor is going from first element. We need to start from the end to show the most recent notifications first.
    It would make more sense to just pop all elements from notification cache, but if we closed the app, they'd all be gone.
    */
    copy.reverse();

    return copy;
  }

  getAllByCategory(type: MVDHosting.ZoweNotificationType): ZoweNotification[] {
    var filtered: ZoweNotification[] = [];
    var i: number;

    for (i = 0; i < this.notificationCache.length; i++) {
      if (this.notificationCache[i].getType() === type) {
        filtered.push(this.notificationCache[i]);
      }
    }

    /* NgFor is going from first element. We need to start from the end to show the most recent notifications first.
    It would make more sense to just pop all elements from notification cache, but if we closed the app, they'd all be gone.
    */
    filtered.reverse();

    return filtered;
  }

  removeAll(): void {
    this.notificationCache.length = 0;
  }

  getCount(): number {
    return this.notificationCache.length;
  }

  addMessageHandler(object: MVDHosting.ZoweNotificationWatcher) {
    this.handlers.push(object);
  }

  removeMessageHandler(object: MVDHosting.ZoweNotificationWatcher) {
    this.handlers.splice(this.handlers.findIndex(x => x === object), 1)
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
