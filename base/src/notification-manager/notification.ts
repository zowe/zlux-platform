
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/


export class Notification implements MVDHosting.NotificationInterface {
  private message: string;
  private date: Date;
  private type: MVDHosting.NotificationType;

  constructor(message: string, type: MVDHosting.NotificationType) {
    this.message = message;
    this.type = type;
    this.date = new Date();
  }

  getMessage(): string {
    return this.message;
  }

  getTime(): Date {
    return this.date;
  }

  getType(): MVDHosting.NotificationType {
    return this.type;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
