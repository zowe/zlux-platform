

export class EventRegistrar {
  private eventsList: Map<string, Map<string, Array<string>>> = new Map();

  createFullEventName(eventName:string, instanceId: string, length: number) {
    let result = `${instanceId}-${eventName}-`;
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  findIndexOfEventName(eventName:string, appInstanceId: string, eventNameList: Array<string>) {
    for (var i = 0; i < eventNameList.length; i++) {
      if (eventNameList[i].startsWith(`${eventName}-${appInstanceId}-`)) {
        return i;
      }
    }
    return null;
  }

  registerEvent(eventName: string, pluginId:string, appInstanceId: string) {
    let name = this.createFullEventName(appInstanceId, eventName, 5);
    if (this.eventsList.has(eventName)) {
      let hold = this.eventsList.get(eventName);
      if (hold) {
        var listenerNames = hold.get(pluginId);
        if (listenerNames) {
          listenerNames.push(name);
        } else {
          hold.set(pluginId, [name]);
        }
      }
    } else {
      var newMap = new Map();
      newMap.set(pluginId, [name]);
      this.eventsList.set(eventName, newMap);
    }
  }

  deregisterEvent(eventName: string, pluginId:string, appInstanceId: string) {
    var hold = this.eventsList.get(eventName);
    if (hold) {
      let listenerNames = hold.get(pluginId);
      if (listenerNames) {
        var index = this.findIndexOfEventName(eventName, appInstanceId, listenerNames);
        if (index != null) {
          listenerNames.splice(index, 1);
        }
        if (listenerNames.length == 0) {
          hold.delete(pluginId);
        }
      }
      if (hold.size == 0) {
        this.eventsList.delete(eventName);
      }
    }
  }

  findEventCodes(eventName: string, pluginId: string | null, appInstanceId: string | null): string[] {
    let event = this.eventsList.get(eventName);
    if (event) {
      if (pluginId) {
        let plugin = event.get(pluginId);
        if (plugin) {
          if (appInstanceId) {
            var index = this.findIndexOfEventName(eventName, appInstanceId, plugin);
            return (index != null? [plugin[index]] : []);
          } else {
            return plugin;
          }
        }
      } else {
        var result:string[] = [];
        event.forEach((value) => {
          result = result.concat(value);
        });
        return result;
      }
    }
    return [];
  }
}