
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { ZoweNotification } from './notification';
// import { PluginManager } from '../../../../zlux-app-manager/virtual-desktop/src/app/plugin-manager/shared/plugin-manager'
// import { Plugin } from '../plugin-manager/plugin'

export class ZoweNotificationManager implements MVDHosting.ZoweNotificationManagerInterface {
  private notificationCache: any[];
  private handlers: MVDHosting.ZoweNotificationWatcher[];
  private ws: WebSocket;
  public url: string;
  host: any;
  port: any;
  securityType: any;
  connectionSettings: any;
  modType: any;
  row: any;
  column: any;
  selectedCodepage: any;



  constructor() {
    this.notificationCache = new Array<ZoweNotification>();
    this.handlers = new Array<MVDHosting.ZoweNotificationWatcher>();
    // console.log(ZoweZLUX)
    // let test: MVDHosting.DesktopPluginDefinition;

    const myHost = window.location.host;
    const protocol = window.location.protocol;
    const wsProtocol = (protocol === 'https:') ? 'wss:' : 'ws:';
    let computedURL:string = `${wsProtocol}//${myHost}/plugins/org.zowe.zlux.bootstrap/services/adminnotificationsdata/`;
    console.log(computedURL)
    this.connectionSettings = {
      host: this.host,
      port: this.port,
      security: {
        type: this.securityType
      },
      deviceType: Number(this.modType),
      alternateHeight: this.row,
      alternateWidth: this.column,
      charsetName: this.selectedCodepage
    }
  }

  setURL(url: string){
    this.url = url;
    this.ws = new WebSocket(url);
    console.log("hey123")
    var _this = this;
    this.ws.onmessage = function(message) {
      console.log("123hey")
      console.log(message)
      _this.updateStuff(JSON.parse(message.data));
    }
    // this.ws.send("test")
  }

  updateStuff(message: any) {
    console.log(message)
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAddedTest(message);
    }
  }

  getURL() {
    return this.url;
  }

  ngOnInit() {

    console.log("yyya")
    this.ws.onmessage = function () {
      console.log("test")
      // Do something?
    }


    this.ws.onerror = function () {
      this.close();
    }
  }

  // sendmessage(notification: ZoweNotification): void {

  // }

  push(notification: ZoweNotification): void {
    // let pluginTest = new Plugin()
    // console.log(pluginTest)
    // let pluginTest: ZLUX.PluginType = ZLUX.PluginType.Desktop
    // console.log(ZoweZLUX.uriBroker.pluginListUri(pluginTest))
    // };
    // console.log(ZoweZLUX.pluginManager.getDesktopPlugin())
    //.findPluginDefinition("org.zowe.zlux.bootstrap")
    // console.log(ZoweZLUX.uriBroker.pluginWSUri(plugin, 'adminnotificationdata', ''))
    console.log(this.handlers)
    this.notificationCache.push(notification);
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
    this.ws.send(JSON.stringify(notification))
  }

  pop(): ZoweNotification | void {
    let n = this.notificationCache.pop();
    for (let i = 0; i < this.handlers.length; i++) {
      this.handlers[i].handleMessageAdded();
    }
    return n;
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

  getCountTest(): void {
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
