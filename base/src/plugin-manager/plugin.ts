

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { SemanticVersion } from '../util/semantic-version'

function parsePluginType(value: string): ZLUX.PluginType | null {
  switch (value) {
    case "desktop":
      return ZLUX.PluginType.Desktop;
    case "application":
      return ZLUX.PluginType.Application;
    default:
      return null;
  }
}

export abstract class Plugin implements ZLUX.Plugin {
  abstract readonly identifier: string;
  abstract readonly version: string;
  abstract readonly type: ZLUX.PluginType;
  abstract readonly webContent: any;

  static parsePluginDefinition(definition: any): Plugin {
    const apiVersion = new SemanticVersion(definition.apiVersion);

    switch (apiVersion.major) {
      case 0://beta
        return new Plugin_0(definition);
      case 1:
        return new Plugin_1(definition);
      default:
        throw new Error("Unrecognized plugin definition major version");
    }
  }

  abstract getKey():string;//For use in mappings of unique Plugins to objects

  abstract getIdentifier():string;

  abstract getVersion():string;

  abstract getWebContent():any;

  abstract getType():ZLUX.PluginType;
 
  public toString():string {
    return "<ZLUX.plugin "+this.getKey()+">";
  }
}

class Plugin_0 extends Plugin {
  readonly identifier: string;
  readonly version: string;
  readonly type: ZLUX.PluginType;
  readonly webContent: any;
  readonly key:string;

  constructor(definition: any) {
    super()

    if (typeof definition.identifier === "string") {
      this.identifier = definition.identifier;
    } else {
      throw new Error("Plugin identifier is not a string");
    }

    if (typeof definition.pluginVersion === "string") {
      this.version = definition.pluginVersion;
    } else {
      throw new Error("Plugin version is not a string");
    }

    if (typeof definition.pluginType === "string") {
      const pluginType = parsePluginType(definition.pluginType);
      if (pluginType != null) {
        this.type = pluginType;
      } else {
        throw new Error("Plugin type is not present");
      }
    } else {
      throw new Error("Plugin type is not a string");
    }
    
    this.key = definition.identifier + '@' + definition.pluginVersion;

    this.webContent = definition.webContent;
  }

  getIdentifier():string{
    return this.identifier;
  }

  getKey():string{
    return this.key;
  }

  getVersion():string{
    return this.version;
  }

  getWebContent():any{
    return this.webContent;
  }

  getType():ZLUX.PluginType{
    return this.type;
  }

}

class Plugin_1 extends Plugin_0 {
  constructor(definition: any) {
    super(definition);
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

