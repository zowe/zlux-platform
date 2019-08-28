
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { ZoweNotification } from './notification';

export class ZoweNotificationManager implements MVDHosting.ZoweNotificationManagerInterface {
  private notificationCache: any[];
  private handlers: MVDHosting.ZoweNotificationWatcher[];
  private ws: WebSocket;
  public url: string;

  constructor() {
    this.notificationCache = new Array<ZoweNotification>();
    this.handlers = new Array<MVDHosting.ZoweNotificationWatcher>();
  }

  setURL(url: string){
    this.url = url;
    this.ws = new WebSocket(url);
    var _this = this;
    this.ws.onmessage = function(message) {
      console.log(message)
      _this.notificationCache.push((JSON.parse(message.data)['notification']) as ZoweNotification)
      _this.updateStuff(JSON.parse(message.data));
    }
  }

  updateStuff(message: any) {
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded(message, this.notificationCache.length -1);
    }
  }

  getURL() {
    return this.url;
  }

  ngOnInit() {

    this.ws.onmessage = function () {
      // Do something?
    }


    this.ws.onerror = function () {
      this.close();
    }
  }

  push(notification: ZoweNotification): void {
    this.ws.send(JSON.stringify(notification))
  }

  pop(): ZoweNotification | void {
    let n = this.notificationCache.pop();
    for (let i = 0; i < this.handlers.length; i++) {
      // this.handlers[i].handleMessageAdded();
    }
    return n;
  }

  removeFromCache(index: number): void{
    this.notificationCache.splice(index, 1)
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
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
