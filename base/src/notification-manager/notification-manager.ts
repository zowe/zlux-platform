
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/* This class implements the NotificationManagerInterface that is declared in
 * zlux-platform/interface/mvd-hosting.d.ts.
 */
export class NotificationManager implements MVDHosting.NotificationManagerInterface {
  /* The cache simply stores all notifications
   * on the virtual desktop.
   */
  private notificationCache: Notification[];

  /* Handlers are used to notify an application
   * when a notification has been added. The application
   * should implement NotificationWatcherInterface and
   * call addMessageHandler(this).
   */
  private handlers: MVDHosting.NotificationWatcher[];

  /* NotificationManager is instantiated on start of virtual desktop,
   * so there is no need to create it yourself within an application.
   */
  constructor() {
    this.notificationCache = new Array<Notification>();
    this.handlers = new Array<MVDHosting.NotificationWatcher>();
  }

  /* Pushes a notification to the cache. We are
   * expecting an object of type Notification.
   */
  push(notification: Notification): void {
    this.notificationCache.push(notification);
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
  }

  /* Pops a notification from the cache. Since
   * this will remove the notification at the top,
   * the caller should be careful when using it. I'm
   * currently unsure of a use case of this,
   * but it's useful for testing.
   */
  pop(): Notification | void {
    let n = this.notificationCache.pop();
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
    return n;
  }

  /* Returns all notifications from the cache. This will
   * not remove any of the notifications. notifications
   * are shown by the most recent notifications
   * first; thus, the copied array is reversed
   * before it is returned.
   */
  getAll(): Notification[] {
    let copy: Notification[] = this.notificationCache.slice(0);
    copy.reverse();

    return copy;
  }

  /* Returns all the notifications of a specific type
   * from the cache. As of now, two types exist:
   *    - System:
   *    - Application:
   */
  getAllByCategory(type: MVDHosting.NotificationType): Notification[] {
    var filtered: Notification[] = [];
    var i: number;

    for (i = 0; i < this.notificationCache.length; i++) {
      if (this.notificationCache[i].getType() === type) {
        filtered.push(this.notificationCache[i]);
      }
    }
    filtered.reverse();

    return filtered;
  }

  /* Removes every notification from the
   * cache.
   */
  removeAll(): void {
    this.notificationCache.length = 0;
  }

  /* Returns the current number of
   * notifications in the cache.
   */
  getCount(): number {
    return this.notificationCache.length;
  }

  /* Allows other applications to know
   * when a new notification is added.
   */
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
