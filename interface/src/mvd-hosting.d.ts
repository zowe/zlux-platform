

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/


declare namespace MVDHosting {
  export type ViewportId = number;
  export type InstanceId = number;
  export const enum Tokens {
    ApplicationManagerToken = "com.rs.mvd.hosting.application-manager",
    ViewportManagerToken = "com.rs.mvd.hosting.viewport-manager",
    PluginManagerToken = "com.rs.mvd.hosting.plugin-manager",
    AuthenticationManagerToken = "com.rs.mvd.hosting.authentication-manager"
  }

  export const enum ZoweNotificationType {
    System = 1,
    Application = 2
  }

  export const enum LoginScreenChangeReason {
    UserLogout,
    UserLogin,
    SessionExpired
  }

  export const enum DESKTOP_PLUGIN_DEFAULTS {
    WIDTH = 809,
    HEIGHT = 1280
  }

  export interface EmbeddedInstance {
    instanceId: InstanceId;
    viewportId: ViewportId;
  }

  export interface DesktopPluginDefinition extends ZLUX.ContainerPluginDefinition {
    getIdentifier(): string;
    getFramework(): string;
    getCopyright(): string;
    hasComponents(): boolean;
  }

  export interface ViewportManagerInterface {
    createViewport(providersProvider: any): MVDHosting.ViewportId;
    registerViewport(viewportId: MVDHosting.ViewportId, instanceId: MVDHosting.InstanceId): void;
    destroyViewport(viewportId: MVDHosting.ViewportId): Promise<void>;
    registerViewportCloseHandler(viewportId: MVDHosting.InstanceId, watcher: () => Promise<any>): void;
    getApplicationInstanceId(viewportId: MVDHosting.ViewportId): MVDHosting.InstanceId | null;
  }

  export interface ApplicationManagerInterface {
    spawnApplication(plugin: DesktopPluginDefinition, launchMetadata: any): Promise<MVDHosting.InstanceId>;
    spawnApplicationWithParms(plugin:ZLUX.Plugin, viewParms:any, launchMetadata:any):Promise<MVDHosting.InstanceId>;
    spawnApplicationWithTarget(plugin: DesktopPluginDefinition, launchMetadata: any, viewportId: MVDHosting.ViewportId): Promise<MVDHosting.InstanceId>;
    setEmbeddedInstanceInput(embeddedInstance: MVDHosting.EmbeddedInstance, input: string, value: any): void;
    getEmbeddedInstanceOutput(embeddedInstance: MVDHosting.EmbeddedInstance, output: string): Observable<any>|undefined;
    killApplication(plugin:ZLUX.Plugin, appId:MVDHosting.InstanceId):void;
    showApplicationWindow(plugin: DesktopPluginDefinition): Promise<MVDHosting.InstanceId>;
//must be same exact pointer, otherwise return = false, not found.
    isApplicationRunning(plugin: DesktopPluginDefinition): boolean;
    getViewportComponentRef(viewportId: MVDHosting.ViewportId): ComponentRef<any> | null;
  }

  export interface PluginManagerInterface {
    loadApplicationPluginDefinitions(update?: boolean): Promise<DesktopPluginDefinition[]>;
    loadApplicationPluginDefinitionsMap(update?: boolean): Promise<Map<string, DesktopPluginDefinition>>;
    findPluginDefinition(identifier: string, update?: boolean): Promise<DesktopPluginDefinition | null>;
    updateMap(): Promise<Map<string, DesktopPluginDefinition>>;
    pluginsAdded: EventEmitter<MVDHosting.DesktopPluginDefinition[]>
  }

  export interface LoginActionInterface {
    onLogin(username:string, plugins: ZLUX.Plugin[]):boolean;
  }

  export interface LogoutActionInterface {
    onLogout(username:string|null):boolean;
  }

  export interface AuthenticationManagerInterface {
    getUsername(): string | null;
    defaultUsername(): string | null;
    isLoggedIn(): boolean;
    requestLogin(): void;
    requestLogout(): void;
    registerPostLoginAction(action: LoginAction):void;
    registerPreLogoutAction(action: LogoutAction):void;
    performLogin(username: string, password: string): Observable<Response>;
    loginScreenVisibilityChanged: EventEmitter<LoginScreenChangeReason>;
  }

  export interface ZoweNotificationManagerInterface {
    notify(notification: ZoweNotification): number;
    serverNotify(message: any): void;
    updateHandlers(message: any): void;
    dismissNotification(id: number): void;
    getCount(): number;
    removeAll(): void;
    addMessageHandler(object: ZoweNotificationWatcher): void;
    removeMessageHandler(object: ZoweNotificationWatcher): void;
    createNotification(title: string, message: string, type :ZoweNotificationType, pluginId :string): void;
  }

  export interface ZoweNotificationWatcher {
    handleMessageAdded(test: any): void;
    handleMessageRemoved(id: number): void;
  }
}



/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
