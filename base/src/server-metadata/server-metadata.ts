

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

/**
 * Provides access to server metadata that does not require authentication.
 */
export class ServerMetadata implements ZLUX.ServerMetadata {
  private zoweVersion: string | undefined;

  getZoweVersion(): Promise<string | undefined> {
    if (this.zoweVersion !== undefined) {
      return Promise.resolve(this.zoweVersion);
    }
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          switch (request.status) {
            case 200:
            case 304:
              try {
                const result = JSON.parse(request.responseText);
                this.zoweVersion = result.zoweVersion;
                resolve(this.zoweVersion);
              } catch (error) {
                reject(error);
              }
              break;
            default:
              reject({responseText: request.responseText, status: request.status});
              break;
          }
        }
      };
      request.open("GET", ZoweZLUX.uriBroker.serverRootUri('server/zowe-version'), true);
      request.send();
    });
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

