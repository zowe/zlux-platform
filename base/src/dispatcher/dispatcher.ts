

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


const IFRAME_LOAD_TIMEOUT = 180000; //3 minutes

class ActionTarget {
  constructor(
    public readonly wrapper: ApplicationInstanceWrapper,
    public readonly preexisting: boolean){}
}

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

class IframeContext {
  constructor(
    public readonly timestamp: number,
    public readonly data: any
  ){}
}

export class Dispatcher implements ZLUX.Dispatcher {
   private pendingIframes: Map<string,IframeContext[]> = new Map();
   private instancesForTypes : Map<string,ApplicationInstanceWrapper[]> = new Map();
   private recognizers:RecognitionRule[] = [];
   private actionsByID :Map<string,Action> = new Map();
   private indexedRecognizers :Map<String,RecognizerIndex> = new Map();
   launchCallback: any = null;
   private pluginWatchers: Map<String,Array<ZLUX.PluginWatcher>> = new Map();
   postMessageCallback: any = null;
   public readonly constants:DispatcherConstants = new DispatcherConstants();
   private log:ZLUX.ComponentLogger;
   private windowManager: any;
  constructor(
    logger: ZLUX.Logger,
  ){
     /* dispatcher created early on - refering to logger from window object as a result */
     this.log = logger.makeComponentLogger("ZLUX.Dispatcher");
     this.runHeartbeat();
   }

  
   registerApplicationCallbacks(plugin:ZLUX.Plugin, applicationInstanceId: any, callbacks:ZLUX.ApplicationCallbacks): void {
     let wrapper = this.getAppInstanceWrapper(plugin,applicationInstanceId);
     if (wrapper) {
       wrapper.callbacks = callbacks;
     }
   }

   static dispatcherHeartbeatInterval:number = 60000; /* one minute */

   clear(): void {
    this.instancesForTypes.clear();
    this.indexedRecognizers.clear();
    this.recognizers = [];
    this.actionsByID.clear();
   }

   runHeartbeat():void {
     let dispatcherHeartbeatFunction = () => {
     this.log.debug('Recognizers: ', this.recognizers);
     this.log.debug("dispatcher heart beat");
     this.log.debug("instances for Types = ", this.instancesForTypes);
     this.log.debug("indexed recognizers = ", this.indexedRecognizers);
     let keyIterator:Iterator<string> = this.instancesForTypes.keys();
     while (true){
       let iterationValue = keyIterator.next();
       if (iterationValue.done) break;
       let key = iterationValue.value;
       let wrappers:ApplicationInstanceWrapper[]|undefined = this.instancesForTypes.get(key);
       this.log.debug("disp.heartbeat: key "+JSON.stringify(key)+" val=",wrappers);
       if (wrappers){
         for (let wrapper of (wrappers as ApplicationInstanceWrapper[])){
           this.log.debug("wrapper=",wrapper);
           if (wrapper.isIframe && this.postMessageCallback) {
             this.postMessageCallback(wrapper.applicationInstanceId,
              { dispatchType: "echo",
                dispatchData:  { a: 1 }
              });
           }
         }
       }
      
     }

     window.setTimeout(dispatcherHeartbeatFunction,Dispatcher.dispatcherHeartbeatInterval);
    };
    window.setTimeout(dispatcherHeartbeatFunction,Dispatcher.dispatcherHeartbeatInterval);
   }

  iframeLoaded(instanceId: MVDHosting.InstanceId, identifier: string):void {
    this.log.debug(`Dequeuing iframe data`);
    if (this.postMessageCallback) {
      const contexts = this.pendingIframes.get(identifier);
      if (contexts && contexts.length > 0) {
        let context = contexts.shift();
        if (context) {
          this.log.debug(`Sending postmessage of type launch to ${identifier} instance=${instanceId}`,context.data);
          this.postMessageCallback(instanceId,{dispatchType: 'launch', dispatchData: {launchMetadata: context.data}});
        }
      }
    }
   }   

   deregisterPluginInstance(plugin: ZLUX.Plugin, applicationInstanceId: MVDHosting.InstanceId):void {
     this.log.info(`Dispatcher requested to deregister plugin ${plugin} with id ${applicationInstanceId}`);
     let key = plugin.getKey();
     let instancesArray = this.instancesForTypes.get(key);
     if (!instancesArray) {
       this.log.warn("Couldn't deregister instance for plugin ${plugin} because no instances were found");
     } else {
       for (let i = 0; i < instancesArray.length; i++) {
         if (instancesArray[i].applicationInstanceId === applicationInstanceId) {
           instancesArray.splice(i,1);
           this.log.debug(`Deregistered application instance with id ${applicationInstanceId} from plugin ${plugin} successfully`);
           let watchers = this.pluginWatchers.get(key);
           if (watchers) {
             for (let j = 0; j < watchers.length; j++) {
               watchers[j].instanceRemoved(applicationInstanceId);
             }
           }
           return;
         }
       }
       this.log.warn(`Could not find application instance with id ${applicationInstanceId} in plugins list. Already deregistered?`);
     }
   }

   registerPluginInstance(plugin: ZLUX.Plugin, applicationInstanceId: MVDHosting.InstanceId, isIframe:boolean, isEmbedded?:boolean): void {
     this.log.info("Registering plugin="+plugin+" id="+applicationInstanceId);
     let instanceWrapper = new ApplicationInstanceWrapper(applicationInstanceId,isIframe);

     let key = plugin.getKey();
     if (!this.instancesForTypes.get(key)){
       this.instancesForTypes.set(key,[instanceWrapper]);
     } else {
       let ids:any[] = (this.instancesForTypes.get(key) as any[]);
       ids.push(instanceWrapper);
     }
     let watchers = this.pluginWatchers.get(key);
     if (watchers) {
       for (let i = 0; i < watchers.length; i++) {
         watchers[i].instanceAdded(applicationInstanceId, isEmbedded);
       }
     }
     // Michael - how to get window manager, IE, how to get interface to look up plugins,
     // or be called on plugin instance lifecycle stuff.
   }

   setLaunchHandler(launchCallback: any): void {
      this.launchCallback = launchCallback;
   }

   setPostMessageHandler( postMessageCallback: any):void{
     this.postMessageCallback = postMessageCallback;
   }

   matchInList(recognizersForIndex: any[],
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
   }

   getRecognizers(tuple:any):RecognitionRule[] {
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
     this.log.debug("getRecognizers"+JSON.stringify(tuple));
     for (let propertyName in tuple){
       let recognizerIndex:RecognizerIndex|undefined = this.indexedRecognizers.get(propertyName);
       this.log.debug("recognizerIndex="+recognizerIndex);
       if (recognizerIndex){
         let ruleArray:RecognitionRule[]|undefined = recognizerIndex.valueMap.get(tuple[propertyName]);
         this.log.debug("ruleArray="+ruleArray);
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
     this.recognizers.forEach( (recognizer:RecognitionRule) => {
       if (recognizer.predicate.match(tuple)){
         matchedRecognizers.push(recognizer);
       }
     });
     return matchedRecognizers;
   }

  addRecognizerFromObject(predicateObject:ZLUX.RecognitionObjectPropClause | ZLUX.RecognitionObjectOpClause, actionID:string):void{
    this.addRecognizer(this.addRecognizerFromObjectInner(predicateObject), actionID);
  }

  private addRecognizerFromObjectInner(predicateObject:ZLUX.RecognitionObjectPropClause | ZLUX.RecognitionObjectOpClause):RecognitionClause{
    // type checking as illustrated in "Type Guards and Differentiating Types" of https://www.typescriptlang.org/docs/handbook/advanced-types.html
    if ((<ZLUX.RecognitionObjectOpClause>predicateObject).op) {
      const predicateOp: ZLUX.RecognitionObjectOpClause = <ZLUX.RecognitionObjectOpClause>predicateObject
      switch (predicateOp.op) {
      case 'AND':
      case 'OR':
        if (predicateOp.args) {
          let args:any = [];
          predicateOp.args.forEach((arg:any)=> {
            args.push(this.addRecognizerFromObjectInner(arg));
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
  
   addRecognizer(predicate:RecognitionClause, actionID:string):void{
     let recognitionRule:RecognitionRule = new RecognitionRule(predicate,actionID);
     this.recognizers.push(recognitionRule);
     if (predicate.operation == RecognitionOp.AND){
       for (let subClause of predicate.subClauses){
         if ((subClause as RecognitionClause).operation == RecognitionOp.PROPERTY_EQ){
           let propertyClause:RecognitionClause = subClause as RecognitionClause;
           let propertyName:string = propertyClause.subClauses[0] as string;
           let propertyValue:string|number = propertyClause.subClauses[1] as string|number;
           let recognizerIndex = this.indexedRecognizers.get(propertyName);
           this.log.debug("addRecognizer recognizersForIndex="+recognizerIndex);
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
   }

  registerPluginWatcher(plugin:ZLUX.Plugin, watcher: ZLUX.PluginWatcher) {
    let key = plugin.getKey();
    let watchers = this.pluginWatchers.get(key);
    if (!watchers) {
      watchers = new Array<ZLUX.PluginWatcher>();
      this.pluginWatchers.set(key,watchers);
    }
    watchers.push(watcher);
  }

  deregisterPluginWatcher(plugin:ZLUX.Plugin, watcher: ZLUX.PluginWatcher): boolean {
    let key = plugin.getKey();
    let watchers = this.pluginWatchers.get(key);
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
  }
    

/* what will callback be called with */
  registerAction(action: Action):void {
      this.actionsByID.set(action.id,action);
   }


   getAction(recognizer:any):Action|undefined {
     this.log.debug("actionName "+JSON.stringify(recognizer)+" in "+JSON.stringify(this.actionsByID));
     return this.actionsByID.get(recognizer.actionID);
   }

   static isAtomicType(specType:string):boolean{
     return ((specType === "boolean") ||
             (specType === "number") ||	
             (specType === "string") ||
             (specType === "symbol") ||
             (specType === "function"));
   }

   evaluateTemplateOp(operation:any, 
                      eventContext:any, 
                      localContext:any):any{
     let opName:string = operation.op as string;
     let dispatcher:Dispatcher = this;
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
             pathElement = this.evaluateTemplateOp(pathElement,eventContext,derefSource);
           } else {
             this.log.debug("path element replacement before: "+pathElement);
             pathElement = dispatcher.buildObjectFromTemplate(pathElement,eventContext);
             this.log.debug("path element replacement after: "+pathElement);
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
             part = dispatcher.evaluateTemplateOp(part,eventContext,{});
           } else {
             part = dispatcher.buildObjectFromTemplate(part,eventContext);
           } 
         } else if (Dispatcher.isAtomicType((typeof part))){
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
   }

   buildObjectFromTemplate(template:any, eventContext:any):any{
      let outputObject:any = Array.isArray(template) ? [] : {};
      let dispatcher:Dispatcher = this;
      for (let propName in template){
        if (template.hasOwnProperty(propName)){
          let substitutionSpec:any = template[propName];
          let specType:string = (typeof substitutionSpec);
          if (substitutionSpec === null){
            outputObject[propName] = null;
          } else if (Dispatcher.isAtomicType(specType)){
            outputObject[propName] = substitutionSpec;
          } else if (specType === "object"){
            if ((typeof substitutionSpec.op) === "string"){
              outputObject[propName] = dispatcher.evaluateTemplateOp(substitutionSpec, eventContext, {});
            } else {
              outputObject[propName] = dispatcher.buildObjectFromTemplate(substitutionSpec, eventContext);
            }
          } else {
	        throw "no known substitution for type "+specType+": "+substitutionSpec;
          }
        }
      }
      return outputObject;
   }        

   makeAction(id: string, defaultName: string, targetMode: ActionTargetMode, type: ActionType, targetPluginID: string, primaryArgument: any):Action{
     return new Action(id,defaultName,targetMode,type,targetPluginID,primaryArgument);
   }
  
  private getAppInstanceWrapper(plugin:ZLUX.Plugin, id:MVDHosting.InstanceId) :ApplicationInstanceWrapper|null{
    let wrappers:ApplicationInstanceWrapper[]|undefined = this.instancesForTypes.get(plugin.getKey());
    this.log.debug("found some wrappers "+wrappers);
    if (wrappers){
      for (let wrapper of (wrappers as ApplicationInstanceWrapper[])){
        if (wrapper.applicationInstanceId === id){
          return wrapper;
        }
      }
    }
    return null;
  }

  private createAsync(plugin:ZLUX.Plugin, action:Action, eventContext: any):Promise<ActionTarget>{
    //let appPromise:Promise<MVDHosting.InstanceId>
    if (!this.launchCallback){
      return Promise.reject("no launch callback established");
    }
    let launchMetadata = this.buildObjectFromTemplate(action.primaryArgument, eventContext);
    if (this.postMessageCallback && plugin.getWebContent().framework === 'iframe') {
      let contexts = this.pendingIframes.get(plugin.getIdentifier());
      if (!contexts) {
        contexts = [];
        this.pendingIframes.set(plugin.getIdentifier(), contexts);
      }
      contexts.push(new IframeContext(Date.now()+IFRAME_LOAD_TIMEOUT, launchMetadata));
      setTimeout(()=> {
        if (contexts) {
          let now = Date.now();
          for (let i = 0; i < contexts.length; i++) {
            if (contexts[i].timestamp > now) {
              if (i > 0) {
                contexts.splice(0,i);
              }
              return;
            }
          }
          //clear
          this.pendingIframes.set(plugin.getIdentifier(),[]);
        }
      },IFRAME_LOAD_TIMEOUT+1);
    }
    let appPromise = 
      this.launchCallback(plugin, launchMetadata).then( (newAppID:MVDHosting.InstanceId) => {
        let wrapper = this.getAppInstanceWrapper(plugin,newAppID);
        if (wrapper){
          return new ActionTarget(wrapper,false);
        } else {
          return Promise.reject("could not find wrapper after launch/create for "+plugin.getIdentifier());
        }
      }).catch((error:any) => {
        this.log.warn("Caught error from launchcallback, e="+error);
      });
    return appPromise;
  }

  private getActionTarget(action:Action, eventContext: any):Promise<ActionTarget>{
    let plugin:ZLUX.Plugin|undefined = ZoweZLUX.pluginManager.getPlugin(action.targetPluginID);
    let applicationInstanceId:MVDHosting.InstanceId|undefined = eventContext.applicationInstanceId;
    if (plugin){
      this.log.debug(" ectxt="+eventContext);
      switch (action.targetMode){
        case ActionTargetMode.PluginCreate:
          return this.createAsync(plugin,action, eventContext);
        case ActionTargetMode.PluginFindAnyOrCreate:
          let wrappers:ApplicationInstanceWrapper[]|undefined = this.instancesForTypes.get(plugin.getKey());
          if (wrappers && wrappers.length > 0) {
            return Promise.resolve(new ActionTarget(wrappers[0], true));
          } else {
            return this.createAsync(plugin,action,eventContext);
          }
        case ActionTargetMode.PluginFindUniqueOrCreate:
          let existingWrapper = null;
          if (applicationInstanceId) {
            existingWrapper = this.getAppInstanceWrapper(plugin,applicationInstanceId);
          }
          if (existingWrapper){
            return Promise.resolve(new ActionTarget(existingWrapper, true));
          } else {
            return this.createAsync(plugin, action, eventContext);
          }
        case ActionTargetMode.System:
          return Promise.reject("not yet implemented");
        default:
          return Promise.reject("unknown target mode");
      }
    } else {
      return Promise.reject("no plugin");
    }
  }

  invokeAction(action:Action, eventContext: any, targetId?: number):any{
    this.log.info("dispatcher.invokeAction on context "+JSON.stringify(eventContext));
    this.getActionTarget(action,eventContext).then( (target: ActionTarget) => {
      const wrapper = target.wrapper; 
      switch (action.type) {
      case ActionType.Launch:
        if (!target.preexisting) {
          break;
        } //else fall-through
      case ActionType.Message:
        this.log.debug('Invoking message type Action');
        //TODO is eventContext here different from this.buildObjectFromTemplate(action.primaryArgument, eventContext);
        if (wrapper.callbacks && wrapper.callbacks.onMessage) {
          wrapper.callbacks.onMessage(eventContext);
        } else if (this.postMessageCallback && wrapper.isIframe) {
          this.postMessageCallback(wrapper.applicationInstanceId,
                                   { dispatchType: 'message',
                                     dispatchData: eventContext
                                   });
        }
        break;
      case ActionType.Minimize:
          if (targetId && this.windowManager) {
             this.windowManager.minimize(targetId);
          }else {
           this.log.warn('Target ID not provided or windowManager not initialized');
          }
          break;
      case ActionType.Maximize:
          if (targetId && this.windowManager) {
             this.windowManager.maximize(targetId);
          }else {
             this.log.warn('Target ID not provided or windowManager not initialized');
          }
          break;
      default:
        this.log.warn("Unhandled action type = "+action.type);
      };
    });
  }

  attachWindowManager(windowManager:any): boolean{
    if (!this.windowManager) {
       this.windowManager = windowManager;
       return true;
    }
    this.log.warn('windowManager has already been initialized');
    return false;

  }
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

