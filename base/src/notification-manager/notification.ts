
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const defaultStyleClass = "org_zowe_zlux_ng2desktop_snackbar";
export class ZoweNotification {
  private message: string;
  private date: Date;
  private type: MVDHosting.ZoweNotificationType;
  private plugin: string;
  private title: string;
  private styleClass?: string;

  constructor(title: string, message: string, type: MVDHosting.ZoweNotificationType, plugin: string, styleClass?: string) {
    this.title = title;
    this.message = message;
    this.type = type;
    this.date = new Date();
    this.plugin = plugin;
    if (styleClass) {
      this.styleClass = styleClass;
    } else {
      this.styleClass = defaultStyleClass;
    }
  }

  getTitle(): string {
    return this.title;
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

  getStyleClass(): string {
    if (this.styleClass) {
      return this.styleClass;
    } else {
      return defaultStyleClass;
    }
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

