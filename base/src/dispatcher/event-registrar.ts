

export class EventRegistrar {
  private eventsList: Map<string, Map<string, Array<string>>> = new Map();
  private DEFAULT_UNIQUE_ID_LENGTH: number = 5;
  private chars:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private charsLength: number = 62;

  createFullEventId(eventType:string, instanceId: string, length: number) {
    let result = `${eventType}_${instanceId}_`;
    
    for (var i = 0; i < length; i++) {
      result += this.chars.charAt(Math.floor(Math.random() * this.charsLength));
    }
    return result;
  }

  findIndexOfEvent(eventType:string, appInstanceId: string, eventNameList: Array<string>) {
    for (var i = 0; i < eventNameList.length; i++) {
      if (eventNameList[i].startsWith(`${eventType}_${appInstanceId}_`)) {
        return i;
      }
    }
    return null;
  }

  registerEvent(eventType: string, pluginId:string, appInstanceId: string) {
    let eventId = this.createFullEventId(eventType, appInstanceId, this.DEFAULT_UNIQUE_ID_LENGTH);
    if (this.eventsList.has(eventType)) {
      let hold = this.eventsList.get(eventType);
      if (hold) {
        var listenerNames = hold.get(pluginId);
        if (listenerNames) {
          listenerNames.push(eventId);
        } else {
          hold.set(pluginId, [eventId]);
        }
      }
    } else {
      var newMap = new Map();
      newMap.set(pluginId, [eventId]);
      this.eventsList.set(eventType, newMap);
    }
  }

  deregisterEvent(eventType: string, pluginId:string, appInstanceId: string) {
    var hold = this.eventsList.get(eventType);
    if (hold) {
      let listenerNames = hold.get(pluginId);
      if (listenerNames) {
        var index = this.findIndexOfEvent(eventType, appInstanceId, listenerNames);
        if (index != null) {
          listenerNames.splice(index, 1);
        }
        if (listenerNames.length == 0) {
          hold.delete(pluginId);
        }
      }
      if (hold.size == 0) {
        this.eventsList.delete(eventType);
      }
    }
  }

  findEventCodes(eventType: string, pluginId: string | null, appInstanceId: string | null): string[] {
    let event = this.eventsList.get(eventType);
    if (event) {
      if (pluginId) {
        let plugin = event.get(pluginId);
        if (plugin) {
          if (appInstanceId) {
            var index = this.findIndexOfEvent(eventType, appInstanceId, plugin);
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