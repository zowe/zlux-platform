
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


export class ZoweNotification {
  private message: string;
  private date: Date;
  private type: MVDHosting.ZoweNotificationType;
  private plugin: string;
  private config: any;

  constructor(message: string, type: MVDHosting.ZoweNotificationType, plugin: string, config?: any) {
    this.message = message;
    this.type = type;
    this.date = new Date();
    this.plugin = plugin;
    if (config) {
      this.config = config
    }
  }

  getMessage(): string {
    return this.message;
  }

  getTime(): Date {
    return this.date;
  }

  getType(): MVDHosting.ZoweNotificationType {
    return this.type;
  }

  getPlugin(): string {
    return this.plugin;
  }

  getConfig(): any {
    return this.config
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

