

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

export class RecognizerIndex {
   propertyName:string;
   valueMap:Map<any,RecognitionRule[]> = new Map();
   
   constructor(propertyName:string){
     this.propertyName = propertyName;
   }

   extend(propertyValue:any, rule:RecognitionRule){
     let rules:RecognitionRule[]|undefined = this.valueMap.get(propertyValue);
     if (!rules){
       rules = [];
     }
     rules.push(rule);
   }
}

export class ApplicationInstanceWrapper {
  constructor(
    public applicationInstanceId:any,
    public isIframe:boolean,
    public callbacks?:any
  ){
  }
}

export class DispatcherConstants implements ZLUX.DispatcherConstants {
  readonly ActionTargetMode = ActionTargetMode;
  readonly ActionType = ActionType;
}

export class DispatcherFactory {
  public makeDispatcher(logger:ZLUX.Logger):ZLUX.Dispatcher{return Dispatcher(logger)};  
}

function Dispatcher(logger: ZLUX.Logger): ZLUX.Dispatcher {

  //private
  let instancesForTypes : Map<string,ApplicationInstanceWrapper[]> = new Map();
  let recognizers:RecognitionRule[] = [];
  let actionsByID :Map<string,Action> = new Map();
  let indexedRecognizers :Map<String,RecognizerIndex> = new Map();
  let pluginWatchers: Map<String,Array<ZLUX.PluginWatcher>> = new Map();
  let log:ZLUX.ComponentLogger = logger.makeComponentLogger("ZLUX.Dispatcher");
  

  //static
  let dispatcherHeartbeatInterval:number = 60000; /* one minute */
  let isAtomicType = function(specType:string):boolean{
    return ((specType === "boolean") ||
            (specType === "number") ||	
            (specType === "string") ||
            (specType === "symbol") ||
            (specType === "function"));
  }
  
  let addRecognizerFromObjectInner = function(predicateObject:ZLUX.RecognitionObjectPropClause | ZLUX.RecognitionObjectOpClause):RecognitionClause{
    // type checking as illustrated in "Type Guards and Differentiating Types" of https://www.typescriptlang.org/docs/handbook/advanced-types.html
    if ((<ZLUX.RecognitionObjectOpClause>predicateObject).op) {
      const predicateOp: ZLUX.RecognitionObjectOpClause = <ZLUX.RecognitionObjectOpClause>predicateObject
      switch (predicateOp.op) {
      case 'AND':
      case 'OR':
        if (predicateOp.args) {
          let args:any = [];
          predicateOp.args.forEach((arg:any)=> {
            args.push(addRecognizerFromObjectInner(arg));
          });
          if (predicateOp.op === 'AND') {
            return new RecognizerAnd(...args);
          }
          return new RecognizerOr(...args);
        }
        else {
          throw new Error(`No args provided for AND/OR recognizer op`);
        }
      default:
        throw new Error(`Recognizer predicate op ${predicateOp.op} not supported`);
      }
    } else if ((<ZLUX.RecognitionObjectPropClause>predicateObject).prop && ((<ZLUX.RecognitionObjectPropClause>predicateObject).prop.length == 2)) {
      const predicateProp: ZLUX.RecognitionObjectPropClause = <ZLUX.RecognitionObjectPropClause> predicateObject;
      return new RecognizerProperty(predicateProp.prop[0],predicateProp.prop[1]);
    } else {
      throw new Error('Error in recognizer definition');
    }
  }
  
  let getAppInstanceWrapper = function(plugin:ZLUX.Plugin, id:MVDHosting.InstanceId) :ApplicationInstanceWrapper|null{
    let wrappers:ApplicationInstanceWrapper[]|undefined = instancesForTypes.get(plugin.getKey());
    log.debug("found some wrappers "+wrappers);
    if (wrappers){
      for (let wrapper of (wrappers as ApplicationInstanceWrapper[])){
        if (wrapper.applicationInstanceId === id){
          return wrapper;
        }
      }
    }
    return null;
  }

  //public
  let launchCallback: any = null;
  let postMessageCallback: any = null;  
  let constants:DispatcherConstants= new DispatcherConstants();
  let registerApplicationCallbacks = function(plugin:ZLUX.Plugin, applicationInstanceId: any, callbacks:ZLUX.ApplicationCallbacks): void {
    let wrapper = getAppInstanceWrapper(plugin,applicationInstanceId);
    if (wrapper) {
      wrapper.callbacks = callbacks;
    }
  };

  let runHeartbeat = function():void {
    let dispatcherHeartbeatFunction = () => {
      log.debug("dispatcher heart beat");
      log.debug("instances for Types = "+instancesForTypes.toString());
      let keyIterator:Iterator<string> = instancesForTypes.keys();
      while (true){
        let iterationValue = keyIterator.next();
        if (iterationValue.done) break;
        let key = iterationValue.value;
        let wrappers:ApplicationInstanceWrapper[]|undefined = instancesForTypes.get(key);
        log.debug("disp.heartbeat: key "+JSON.stringify(key)+" val="+wrappers);
        if (wrappers){
          for (let wrapper of (wrappers as ApplicationInstanceWrapper[])){
            log.debug("wrapper="+wrapper);
            postMessageCallback(wrapper.applicationInstanceId,
                                { dispatchType: "echo",
                                  dispatchData:  { a: 1 }
                                });
          }
        }
        
      }

      window.setTimeout(dispatcherHeartbeatFunction,dispatcherHeartbeatInterval);
    };
    window.setTimeout(dispatcherHeartbeatFunction,dispatcherHeartbeatInterval);
  };

  let deregisterPluginInstance = function(plugin: ZLUX.Plugin, applicationInstanceId: MVDHosting.InstanceId):void {
    log.info(`Dispatcher requested to deregister plugin ${plugin} with id ${applicationInstanceId}`);
    let key = plugin.getKey();
    let instancesArray = instancesForTypes.get(key);
    if (!instancesArray) {
      log.warn("Couldn't deregister instance for plugin ${plugin} because no instances were found");
    } else {
      for (let i = 0; i < instancesArray.length; i++) {
        if (instancesArray[i].applicationInstanceId === applicationInstanceId) {
          instancesArray.splice(i,1);
          log.debug(`Deregistered application instance with id ${applicationInstanceId} from plugin ${plugin} successfully`);
          let watchers = pluginWatchers.get(key);
          if (watchers) {
            for (let j = 0; j < watchers.length; j++) {
              watchers[j].instanceRemoved(applicationInstanceId);
            }
          }
          return;
        }
      }
      log.warn(`Could not find application instance with id ${applicationInstanceId} in plugins list. Already deregistered?`);
    }
  };

  let registerPluginInstance = function(plugin: ZLUX.Plugin, applicationInstanceId: MVDHosting.InstanceId, isIframe:boolean, isEmbedded?:boolean): void {
    log.info("Registering plugin="+plugin+" id="+applicationInstanceId);
    let instanceWrapper = new ApplicationInstanceWrapper(applicationInstanceId,isIframe);
    let key = plugin.getKey();
    if (!instancesForTypes.get(key)){
      instancesForTypes.set(key,[instanceWrapper]);
    } else {
      let ids:any[] = (instancesForTypes.get(key) as any[]);
      ids.push(instanceWrapper);
    }
    let watchers = pluginWatchers.get(key);
    if (watchers) {
      for (let i = 0; i < watchers.length; i++) {
        watchers[i].instanceAdded(applicationInstanceId, isEmbedded);
      }
    }
    // Michael - how to get window manager, IE, how to get interface to look up plugins,
    // or be called on plugin instance lifecycle stuff.
  };

  let setLaunchHandler = function(newLaunchCallback: any): void {
    launchCallback = newLaunchCallback;
  };

  let setPostMessageHandler = function(newPostMessageCallback: any):void{
    postMessageCallback = newPostMessageCallback;
  };
  
/* unused, typescript complained
  let matchInList = function(recognizersForIndex: any[],
                             propertyValue: any,
                             shouldCreate: boolean): any {
    for (let recognizersForValue of recognizersForIndex){
      if (recognizersForValue.propertyValue == propertyValue){
        return recognizersForValue;
      }
    };
    if (shouldCreate){
      let recognizersForValue = { propertyValue: propertyValue, recognizerList: [] };
      recognizersForIndex.push(recognizersForValue);
      return recognizersForValue;
    } else {
      return null;
    }
  };
*/
  
  let getRecognizers = function(tuple:any):RecognitionRule[] {
    let matchedRecognizers:any[] = [];
    // we can get the set of recognizers that match on this property at top clause
    // and those that don't, too.
    // PropertyRecognizers  table of propName-> ( tableOfRecognizersPerValue, otherRecognizers)
    // if tuple has a prop
    //   prop indexed
    //     get recognizers per value, or none
    //   prop not indexed
    //     use all recognizer list
    // need iteration on propertyNames for tuple
    // 
    log.debug("getRecognizers"+JSON.stringify(tuple));
    for (let propertyName in tuple){
      let recognizerIndex:RecognizerIndex|undefined = indexedRecognizers.get(propertyName);
      log.debug("recognizerIndex="+recognizerIndex);
      if (recognizerIndex){
        let ruleArray:RecognitionRule[]|undefined = recognizerIndex.valueMap.get(tuple[propertyName]);
        log.debug("ruleArray="+ruleArray);
        if (ruleArray){
          for (let rule of ruleArray){
            if (rule.predicate.match(tuple)){
              matchedRecognizers.push(rule);
            }
          }
        }
        return matchedRecognizers;  // since we had an index, good enough
      }
    } 
    recognizers.forEach( (recognizer:RecognitionRule) => {
      if (recognizer.predicate.match(tuple)){
        matchedRecognizers.push(recognizer);
      }
    });
    return matchedRecognizers;
  };

  let addRecognizerFromObject = function(predicateObject:ZLUX.RecognitionObjectPropClause | ZLUX.RecognitionObjectOpClause, actionID:string):void{
    addRecognizer(addRecognizerFromObjectInner(predicateObject), actionID);
  };

  let addRecognizer = function(predicate:RecognitionClause, actionID:string):void{
    let recognitionRule:RecognitionRule = new RecognitionRule(predicate,actionID);
    recognizers.push(recognitionRule);
    if (predicate.operation == RecognitionOp.AND){
      for (let subClause of predicate.subClauses){
        if ((subClause as RecognitionClause).operation == RecognitionOp.PROPERTY_EQ){
          let propertyClause:RecognitionClause = subClause as RecognitionClause;
          let propertyName:string = propertyClause.subClauses[0] as string;
          let propertyValue:string|number = propertyClause.subClauses[1] as string|number;
          let recognizerIndex = indexedRecognizers.get(propertyName);
          log.debug("addRecognizer recognizersForIndex="+recognizerIndex);
          // here - fix me
          // test server/client
          // filter crap - are the screen ID's broken??  - should be no screen ID in tuple on first page
          // why not getting 5 things?
          if (recognizerIndex){
            let ruleArray:RecognitionRule[]|undefined = recognizerIndex.valueMap.get(propertyValue); 
            if (!ruleArray){
              ruleArray = [];
              recognizerIndex.valueMap.set(propertyValue,ruleArray);
            }
            ruleArray.push(recognitionRule);
          }
        }
      }
    }
  };

  let registerPluginWatcher = function(plugin:ZLUX.Plugin, watcher: ZLUX.PluginWatcher) {
    let key = plugin.getKey();
    let watchers = pluginWatchers.get(key);
    if (!watchers) {
      watchers = new Array<ZLUX.PluginWatcher>();
      pluginWatchers.set(key,watchers);
    }
    watchers.push(watcher);
  };

  let deregisterPluginWatcher = function(plugin:ZLUX.Plugin, watcher: ZLUX.PluginWatcher): boolean {
    let key = plugin.getKey();
    let watchers = pluginWatchers.get(key);
    if (!watchers) {
      return false;
    }
    else {
      for (let i = 0; i < watchers.length; i++) {
        if (watchers[i] == watcher) {
          watchers.splice(i,1);
          return true;
        }
      }
      return false;
    }
  };
  

  /* what will callback be called with */
  let registerAction = function(action: Action):void {
    actionsByID.set(action.id,action);
  };


  let getAction = function(recognizer:any):Action|undefined {
    log.debug("actionName "+JSON.stringify(recognizer)+" in "+JSON.stringify(actionsByID));
    return actionsByID.get(recognizer.actionID);
  };

  let evaluateTemplateOp = function(operation:any, 
                                    eventContext:any, 
                                    localContext:any):any{
    let opName:string = operation.op as string;
    if (opName == "deref"){
      let derefSource:any = null;
      if (operation.source == "event"){
        derefSource = eventContext;
      } else if (operation.source == "deref"){
        derefSource = localContext;
      } else {
        throw "unknown deref source: "+operation.source;
      }
      if (!Array.isArray(operation.path)){
        throw "no path spec for deref: "+JSON.stringify(operation);
      }
      var path = operation.path;
      path.forEach((pathElement:any) => {
        if ((typeof pathElement) === "object"){
          if ((typeof pathElement.op) === "string"){
            pathElement = evaluateTemplateOp(pathElement,eventContext,derefSource);
          } else {
            log.debug("path element replacement before: "+pathElement);
            pathElement = buildObjectFromTemplate(pathElement,eventContext);
            log.debug("path element replacement after: "+pathElement);
          }
        }
        let pathElementType:string = (typeof pathElement);
        if ((pathElementType === "string") ||
            (pathElementType === "number")){
          derefSource = derefSource[pathElement];
          if ((typeof derefSource) === "undefined"){
            throw "dereference to unbound element from "+pathElement;
          }
        } else {
          throw "cannot dereference by "+JSON.stringify(pathElement);
        }
      });
      return derefSource;
    } else if (opName == "concat"){
      if (!Array.isArray(operation.parts)){
        throw "concat op must have array of parts "+JSON.stringify(operation);
      }
      let concatenatedString:string = "";
      operation.parts.forEach( (part:any) => {
        if ((typeof part) === "object"){
          if ((typeof part.op) === "string"){
            part = evaluateTemplateOp(part,eventContext,{});
          } else {
            part = buildObjectFromTemplate(part,eventContext);
          } 
        } else if (isAtomicType((typeof part))){
          // do nothing
        } else {
          part = JSON.stringify(part);
        }
        concatenatedString += part;
      });
      return concatenatedString;
    } else if (opName == "localeDate"){
      return (new Date()).toLocaleTimeString();
    } else {
      throw "unknown substitution op: "+opName;
    }
  };

  let buildObjectFromTemplate = function(template:any, eventContext:any):any{
    let outputObject:any = Array.isArray(template) ? [] : {};
    for (let propName in template){
      if (template.hasOwnProperty(propName)){
        let substitutionSpec:any = template[propName];
        let specType:string = (typeof substitutionSpec);
        if (substitutionSpec === null){
          outputObject[propName] = null;
        } else if (isAtomicType(specType)){
          outputObject[propName] = substitutionSpec;
        } else if (specType === "object"){
          if ((typeof substitutionSpec.op) === "string"){
            outputObject[propName] = evaluateTemplateOp(substitutionSpec, eventContext, {});
          } else {
            outputObject[propName] = buildObjectFromTemplate(substitutionSpec, eventContext);
          }
        } else {
	        throw "no known substitution for type "+specType+": "+substitutionSpec;
        }
      }
    }
    return outputObject;
  };

  let makeAction = function(id: string, defaultName: string, targetMode: ActionTargetMode, type: ActionType, targetPluginID: string, primaryArgument: any):Action{
    return new Action(id,defaultName,targetMode,type,targetPluginID,primaryArgument);
  };
  

  let createAsync = function(plugin:ZLUX.Plugin, action:Action, eventContext: any):Promise<ApplicationInstanceWrapper>{
    //let appPromise:Promise<MVDHosting.InstanceId>
    if (!launchCallback){
      return Promise.reject("no launch callback established");
    }
    let launchMetadata = buildObjectFromTemplate(action.primaryArgument, eventContext);
    let appPromise = 
      launchCallback(plugin, launchMetadata).then( (newAppID:MVDHosting.InstanceId) => {
        let wrapper = getAppInstanceWrapper(plugin,newAppID);
        if (wrapper){
          return wrapper;
        } else {
          return Promise.reject("could not find wrapper after launch/create for "+plugin.getIdentifier());
        }
      }).catch((error:any) => {
        log.warn("Caught error from launchcallback, e="+error);
      });
    return appPromise;
  };

  let getActionTarget= function(action:Action, eventContext: any):Promise<ApplicationInstanceWrapper>{
    let plugin:ZLUX.Plugin|undefined = ZoweZLUX.pluginManager.getPlugin(action.targetPluginID);
    let applicationInstanceId:MVDHosting.InstanceId|undefined = eventContext.applicationInstanceId;
    if (plugin){
      log.debug(" ectxt="+eventContext);
      switch (action.targetMode){
      case ActionTargetMode.PluginCreate:
        return createAsync(plugin,action, eventContext);
      case ActionTargetMode.PluginFindAnyOrCreate:
        let wrappers:ApplicationInstanceWrapper[]|undefined = instancesForTypes.get(plugin.getKey());
        if (wrappers && wrappers.length > 0) {
          return Promise.resolve(wrappers[0]);
        } else {
          return createAsync(plugin,action,eventContext);
        }
      case ActionTargetMode.PluginFindUniqueOrCreate:
        let existingWrapper = null;
        if (applicationInstanceId) {
          existingWrapper = getAppInstanceWrapper(plugin,applicationInstanceId);
        }
        if (existingWrapper){
          return Promise.resolve(existingWrapper);
        } else {
          return createAsync(plugin, action, eventContext);
        }
      case ActionTargetMode.System:
        return Promise.reject("not yet implemented");
      default:
        return Promise.reject("unknown target mode");
      }
    } else {
      return Promise.reject("no plugin");
    }
  };

  let invokeAction = function(action:Action, eventContext: any):any{
    log.info("invokeAction on context "+JSON.stringify(eventContext));
    getActionTarget(action,eventContext).then( (wrapper:ApplicationInstanceWrapper) => {
      switch (action.type) {
      case ActionType.Launch:
        log.debug("invoke Launch, which means do nothing if wrapper found: "+wrapper);
        break;
      case ActionType.Message:
        log.debug('Invoking message type Action');
        if (wrapper.callbacks && wrapper.callbacks.onMessage) {
          wrapper.callbacks.onMessage(eventContext);
        }
        break;
      case ActionType.Minimize:
      case ActionType.Maximize:
        log.warn('Max/Min not supported at this time. Concern if apps should be able to control other apps visibility.');
      default:
        log.warn("Unhandled action type = "+action.type);
      };
    });
  }

  //constructor
  runHeartbeat();


  return {
    constants: constants,
    makeAction: makeAction,
    getAction: getAction,
    registerAction: registerAction,
    deregisterPluginWatcher: deregisterPluginWatcher,
    registerPluginWatcher: registerPluginWatcher,
    addRecognizer: addRecognizer,
    addRecognizerFromObject: addRecognizerFromObject,
    getRecognizers: getRecognizers,
    setPostMessageHandler: setPostMessageHandler,
    setLaunchHandler: setLaunchHandler,
    registerPluginInstance: registerPluginInstance,
    deregisterPluginInstance: deregisterPluginInstance,
    registerApplicationCallbacks: registerApplicationCallbacks,
    invokeAction:invokeAction
  };
}

export class RecognitionRule {
  predicate:RecognitionClause;
  actionID:string;

  constructor(predicate:RecognitionClause, actionID:string){
    this.predicate = predicate;
    this.actionID = actionID;
  }

  static isReservedKey(key:string):boolean{
    return (key.startsWith("zlux_") ? true : false);
  }

  isSourceIndexable():boolean{

    return false; // ha
  }
}

export enum RecognitionOp {
  AND,
  OR,
  NOT,
  PROPERTY_EQ,        
  SOURCE_PLUGIN_TYPE,      // syntactic sugar
  MIME_TYPE,        // ditto
}

export class RecognitionClause{
  operation: RecognitionOp;
  subClauses: (RecognitionClause|number|string)[] = [];

  constructor(op:RecognitionOp){
    this.operation = op;
  }

  match(tuple:any):boolean{
     tuple;  // shuddup
     return false;
  }
}

export class RecognizerAnd extends RecognitionClause {
  constructor(...conjuncts:(RecognitionClause)[]){
    super(RecognitionOp.AND);
    this.subClauses = conjuncts;
  } 
  
  match(tuple:any):boolean{
    for (let subClause of this.subClauses){
      if (!(subClause as RecognitionClause).match(tuple)){
        return false;
      }
    }
    return true;
  }
}

export class RecognizerOr extends RecognitionClause {
  constructor(...disjuncts:(RecognitionClause|number|string)[]){
    super(RecognitionOp.OR);
    this.subClauses = disjuncts;
  } 

  match(tuple:any):boolean{
    for (let subClause of this.subClauses){
      if ((subClause as RecognitionClause).match(tuple)){
        return true;
      }
    }
    return false;
  }
}

export class RecognizerProperty extends RecognitionClause {
  constructor(propertyName:string, propertyValue:string|number){
    super(RecognitionOp.PROPERTY_EQ);
    this.subClauses[0] = propertyName;
    this.subClauses[1] = propertyValue;
  }

  match(tuple:any):boolean{
    return tuple[this.subClauses[0] as string] == this.subClauses[1];
  }
}

export enum ActionTargetMode {
  PluginCreate,                // require pluginType
  PluginFindUniqueOrCreate,    // required AppInstance/ID
  PluginFindAnyOrCreate,       // plugin type
  //should have PluginFindAnyOrFail
  System,                      // something that is always present
}

export enum ActionType {       // not all actions are meaningful for all target modes
  Launch,                      // essentially do nothing after target mode
  Focus,                       // bring to fore, but nothing else
  Route,                       // sub-navigate or "route" in target
  Message,                     // "onMessage" style event to plugin
  Method,                      // Method call on instance, more strongly typed
  Minimize,
  Maximize,
  Close,                       // may need to call a "close handler"
} 


export class Action implements ZLUX.Action {
    id: string;           // id of action itself.
    i18nNameKey: string;  // future proofing for I18N
    defaultName: string;  // default name for display purposes, w/o I18N
    description: string;
    targetMode: ActionTargetMode;
    type: ActionType;   // "launch", "message"
    targetPluginID: string;
    primaryArgument: any;

    constructor(id: string, 
                defaultName: string,
                targetMode: ActionTargetMode, 
                type: ActionType,
                targetPluginID: string,
                primaryArgument:any) {
       this.id = id;
       this.defaultName = defaultName;
       // proper name for ID/tye
       this.targetPluginID = targetPluginID; 
       this.targetMode = targetMode;
       this.type = type;
       this.primaryArgument = primaryArgument;
    }

    getDefaultName():string {
      return this.defaultName;
    }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

