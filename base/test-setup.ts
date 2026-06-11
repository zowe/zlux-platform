/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

// Provide ZLUX namespace globals that const enums reference at runtime
// when compiled with ts-node's transpileModule mode.
(global as any).ZLUX = {
  PluginType: {
    Desktop: "desktop",
    Application: "application",
    Bootstrap: "bootstrap",
    NodeAuthentication: "nodeAuthentication",
    Library: "library"
  }
};
