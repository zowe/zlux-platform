

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

/// <reference path="./mvd-hosting.d.ts" />

declare namespace MVDWindowManagement {
  export type WindowId = number;
  export const enum Tokens {
    WindowManagerToken = "com.rs.mvd.window-management.window-manager"
  }

  export interface WindowManagerServiceInterface{
    createWindow(plugin: MVDHosting.DesktopPluginDefinition): MVDWindowManagement.WindowId;
    getViewportId(windowId: MVDWindowManagement.WindowId): MVDHosting.ViewportId ;
    getWindow(plugin: MVDHosting.DesktopPluginDefinition): MVDWindowManagement.WindowId | null;
    showWindow(windowId: MVDWindowManagement.WindowId): void;
    closeWindow(windowId: MVDWindowManagement.WindowId): void;
    closeAllWindows():void;
    requestWindowFocus(windowId: MVDWindowManagement.WindowId): boolean;
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

