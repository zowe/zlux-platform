

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Plugin } from './plugin'

export class PluginManager implements MVDHosting.LogoutActionInterface {
  private static desktopPlugin: Plugin | null = null;
  private static pluginsById:Map<string,ZLUX.Plugin> = new Map();

  private static parsePluginDefinitions(pluginData: any): Plugin[] {
    if (pluginData["pluginDefinitions"] != null) {
      const pluginDefinitions: any[] = pluginData["pluginDefinitions"];
      const plugins = pluginDefinitions.map(definition => {
        try {
          const plugin = Plugin.parsePluginDefinition(definition);
          PluginManager.pluginsById.set(plugin.getIdentifier(),plugin); 
          return plugin;
        } catch (error) {
          console.error(error);
          console.error("Skipping invalid plugin definition");
          console.error(definition);

          return null;
        }
      });

      /* Remove skipped plugins */
      return plugins.filter(x => x) as Plugin[];
    } else {
      throw new Error("Unable to parse plugin definitions: Missing field 'pluginDefinitions'");
    }
  }

  onLogout(): boolean {
    PluginManager.pluginsById.clear();
    return true;
  }

  static clearPlugins(): void {
    PluginManager.pluginsById.clear();
  }

  static getPlugin(id:string):ZLUX.Plugin|undefined {
    return PluginManager.pluginsById.get(id);
  }

  static loadPlugins(pluginType?: ZLUX.PluginType): Promise<ZLUX.Plugin[]> {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState == 4) {
          /* Request complete */
          switch (this.status) {
            case 200:
            case 304:
              try {
                var result = JSON.parse(this.responseText);
                resolve(PluginManager.parsePluginDefinitions(result));
              } catch (error) {
                reject(error);
              }
              break;
            default:
              reject(this.responseText)
              break;
          }
        }
      };
      request.open("GET", ZoweZLUX.uriBroker.pluginListUri(pluginType), true);
      request.send();
    });
  }

  static setDesktopPlugin(plugin: Plugin) {
    PluginManager.desktopPlugin = plugin;
  }

  static includeScript(scriptUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var script = document.createElement("script");
      script.setAttribute("src", scriptUrl);
      script.onload = () => resolve();
      script.onerror = () => reject();

      document.head.appendChild(script);
    });
  }

  static getDesktopPlugin(): Plugin | null {
    return PluginManager.desktopPlugin;
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

