

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


// A plugin can register Action that are triggerable, scriptable APIs that can help manage
// lifecycle of plugin instance and/or call "methods" in that plugin instance.

// Actions have the following types
// launch  (findcreateIfDoesNotExist)
// findOrLaunch

// triple-slash is an annotation thing in TS

// <reference types="ZLUX" />



type EnvironmentResponse = {
  timestamp: Date,
  platform: string,
  arch: string,
  userEnvironment: any,
  agent: ZLUX.AgentConfig
}

export class Environment implements ZLUX.Environment {
  private _cache:EnvironmentResponse|undefined = undefined;
    //should cache
  get(key:string): Promise<string|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        resolve(cache.userEnvironment[key]);
      }).catch((err)=>{reject(err);});
    });
  }
  getComponents(): Promise<string[]|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        try {
          resolve(cache.userEnvironment.ZWE_LAUNCH_COMPONENTS.split(','));
        } catch (e) {
          resolve(undefined);
        }
      }).catch((err)=>{reject(err);});
    });
  }
  getExternalComponents(): Promise<string[]|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        try {
          resolve(cache.userEnvironment.EXTERNAL_COMPONENTS.split(','));
        } catch (e) {
          resolve(undefined);
        }
      }).catch((err)=>{reject(err);});
    });
  }
  getAgentConfig(): Promise<ZLUX.AgentConfig|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        try {
          resolve(cache.agent);
        } catch (e) {
          resolve(undefined);
        }
      }).catch((err)=>{reject(err);});
    });
  }
  getGatewayPort(): Promise<number|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        try {
          const portString = cache.userEnvironment.ZWED_node_mediationLayer_server_gatewayPort
            ? cache.userEnvironment.ZWED_node_mediationLayer_server_gatewayPort
            : cache.userEnvironment.GATEWAY_PORT;
          
          resolve(Number(portString));
        } catch (e) {
          resolve(undefined);
        }
      }).catch((err)=>{reject(err);});
    });
  }
  getGatewayHost(): Promise<string|undefined> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        try {
          const uri_prefix = window.location.pathname.split('ZLUX/plugins/')[0];
          const proxy_mode = (uri_prefix !== '/') ? true : false; // Tells whether we're behind API layer (true) or not (false)
          if (proxy_mode) { //we are in the APIML already
            resolve(window.location.hostname);
          }
          else { //TODO what happens when there are multiple values
            const host = cache.userEnvironment.ZWED_node_mediationLayer_server_hostname
              ? cache.userEnvironment.ZWED_node_mediationLayer_server_hostname
              : cache.userEnvironment.ZWE_zowe_externalDomains_0;
            
            resolve(host);
          }
        } catch (e) {
          resolve(undefined);
        }
      }).catch((err)=>{reject(err);});
    });
  }
  getPlatform(): Promise<string> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        resolve(cache.platform);
      }).catch((err)=>{reject(err);});
    });
  }
  getArch(): Promise<string> {
    return new Promise((resolve, reject)=> {
      this._queryServer().then(function (cache:EnvironmentResponse){
        resolve(cache.arch);
      }).catch((err)=>{reject(err);});
    });
  }
    //should poll server
  getTime(): Promise<Date> {
    return new Promise((resolve, reject)=> {
      this._queryServer(false).then(response => resolve(new Date(response.timestamp))).catch((err)=>{reject(err);});
    });
  }

  private _queryServer(useCache:boolean=true):Promise<EnvironmentResponse> {
    return new Promise((resolve, reject)=> {
      if (useCache && this._cache) {
        return resolve(this._cache);
      }
      var request = new XMLHttpRequest();
      request.onreadystatechange = ()=> {
        if (request.readyState == 4) {
          /* Request complete */
          switch (request.status) {
          case 200:
          case 304:
            try {
              const cache = JSON.parse(request.responseText);
              this._cache = cache;
              resolve(cache);
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
      
      //chicken-and-egg problem, not a good idea to use uribroker here. slight duplication.
      const uri_prefix = window.location.pathname.split('ZLUX/plugins/')[0];
      
      request.open("GET", `${uri_prefix}server/environment`, true);
      request.send();
    });
  }
}
