
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


export class NotificationManager implements MVDHosting.NotificationManagerInterface {
  private notificationCache: Notification[];
  private handlers: MVDHosting.NotificationWatcher[];

  constructor() {
    this.notificationCache = new Array<Notification>();
    this.handlers = new Array<MVDHosting.NotificationWatcher>();
  }

  push(notification: Notification): void {
    this.notificationCache.push(notification);
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
  }

  pop(): Notification | void {
    let n = this.notificationCache.pop();
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
    return n;
  }

  getAll(): Notification[] {
    let copy: Notification[] = this.notificationCache.slice(0);

    /* NgFor is going from first element. We need to start from the end to show the most recent notifications first.
    It would make more sense to just pop all elements from notification cache, but if we closed the app, they'd all be gone.
    */
    copy.reverse();

    return copy;
  }

  getAllByCategory(type: MVDHosting.NotificationType): Notification[] {
    var filtered: Notification[] = [];
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
    notificationCache.length = 0;
  }

  getCount(): number {
    return this.notificationCache.length;
  }

  addMessageHandler(object: MVDHosting.NotificationWatcher) {
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

