

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Plugin } from './plugin'

export class PluginManager {
  private static desktopPlugin: Plugin | null = null;
  private static pluginsById:Map<string,ZLUX.Plugin> = new Map();
  public static logger:ZLUX.ComponentLogger;
  
  private static parsePluginDefinitions(pluginData: any): Plugin[] {
    if (pluginData["pluginDefinitions"] != null) {
      const pluginDefinitions: any[] = pluginData["pluginDefinitions"];
      const plugins = pluginDefinitions.map(definition => {
        try {
          const plugin = Plugin.parsePluginDefinition(definition);
          PluginManager.pluginsById.set(plugin.getIdentifier(),plugin); 
          return plugin;
        } catch (error) {
          PluginManager.logger.severe("ZWED5036E", error);
          PluginManager.logger.warn("ZWED5018W", definition);
          //console.error(error);
          //console.error("Skipping invalid plugin definition");
          //console.error(definition);

          return null;
        }
      });

      /* Remove skipped plugins */
      return plugins.filter(x => x) as Plugin[];
    } else {
      throw new Error("ZWED5037E - Unable to parse plugin definitions: Missing field 'pluginDefinitions'");
    }
  }

  static getPlugin(id:string):ZLUX.Plugin|undefined {
    return PluginManager.pluginsById.get(id);
  }

  static loadPlugins(pluginType?: ZLUX.PluginType, update?: boolean): Promise<ZLUX.Plugin[]> {
    return new Promise((resolve, reject) => {
      if (PluginManager.pluginsById.size > 0 && !update) {
        return resolve(Array.from(PluginManager.pluginsById.values()).filter(plugin => plugin.getType() == pluginType));
      }

      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState == 4) {
          /* Request complete */
          switch (this.status) {
            case 200:
            case 304:
              try {
                var result = JSON.parse(this.responseText);
                let allPlugins = PluginManager.parsePluginDefinitions(result);
                if (!pluginType) {
                  resolve(allPlugins);
                } else {
                  const filtered = allPlugins.filter(plugin => plugin.getType() == pluginType)
                  resolve(filtered);
                }
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
      request.open("GET", ZoweZLUX.uriBroker.pluginListUri(undefined, update), true);
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

