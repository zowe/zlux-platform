
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/*
 * This file currently produces some build issues because Typescript has poorly conceived handling of
 * .d.ts dependencies. We can clean this up later using the workaround in:
 *
 * https://github.com/Microsoft/TypeScript/issues/7352#issuecomment-191547232
 */

declare namespace ZLUX {
  type Observable<T> = Rx.Observable<T>;

  interface Dispatcher {
    /**
     * This is the interface that is called by the window manager or app manager to tell the
     * dispatcher about an application (i.e. plugin instance).
     */
    registerPluginWatcher(plugin:ZLUX.Plugin, watcher: PluginWatcher): void;
    //only removes watcher when same exact object
    deregisterPluginWatcher(plugin:ZLUX.Plugin, watcher: PluginWatcher): boolean; 
    registerPluginInstance(plugin: Plugin, applicationInstanceId: any, isIframe: boolean, isEmbedded?:boolean): void;
    deregisterPluginInstance(plugin: Plugin, applicationInstanceId: any): void;
    setLaunchHandler(launchCallback: any): void;
    setPostMessageHandler(postMessageCallback: any): void;
    getRecognizers(tuple: any): RecognitionRule[];
    addRecognizerFromObject(predicateObject:RecognitionObjectPropClause | RecognitionObjectOpClause, actionID:string):void;
    addRecognizer(predicate: RecognitionClause, actionID: string): void;
    registerAction(action: Action): void;
    getAction(recognizer: any): Action | undefined;
    invokeAction(action: Action, eventContext: any, targetId?: number): any;
    makeAction(id: string, defaultName: string, targetMode: ActionTargetMode, type: ActionType, targetPluginID: string, primaryArgument: any): Action;
    registerApplicationCallbacks(plugin: Plugin, applicationInstanceId: any, callbacks: ApplicationCallbacks): void;
    clear(): void;
    iframeLoaded(instanceId: MVDHosting.InstanceId, identifier: string);
    attachWindowManager(windowManager: any);
    constants: DispatcherConstants;
  }

  type RecognizerObject = {
    id: string,
    clause: RecognitionObjectPropClause | RecognitionObjectOpClause
  }

  type RecognitionObjectOpClause = {
    op:string,
    args: Array<RecognitionObjectPropClause | RecognitionObjectOpClause>
  }

  type RecognitionObjectPropClause = {
    prop: string[]
  }

  interface RecognitionRule {

  }

  interface RecognitionClause {

  }

  type ApplicationOnMessage = (eventContext: any) => Promise<any>;

  type ApplicationCallbacks = {
    onMessage?: ApplicationOnMessage
  }

  enum ActionTargetMode {
    PluginCreate = 0,
    PluginFindUniqueOrCreate = 1,
    PluginFindAnyOrCreate = 2,
    System = 3,
  }

  enum ActionType {
    Launch = 0,
    Focus = 1,
    Route = 2,
    Message = 3,
    Method = 4,
    Minimize = 5,
    Maximize = 6,
    Close = 7,
    CreateChannel = 8
  }

  type DispatcherConstants = {
    ActionTargetMode: any,
    ActionType: any
  }

  interface Action {
    getDefaultName(): string;
  }

  interface ComponentLogger {
    log(minimumLevel: number, ...loggableItems:any[]): void;
    info(...loggableItems:any[]): void;
    warn(...loggableItems:any[]): void;
    severe(...loggableItems:any[]): void;    
    debug(...loggableItems:any[]): void;
    makeSublogger(componentNameSuffix: string): ComponentLogger;
  }

  interface Logger {
    makeComponentLogger(componentName: string): ComponentLogger;
    setLogLevelForComponentName(componentName: string, level: number): void;
  }

  interface Globalization {
    getLanguage(): string;
    getLocale(): string;
  }

  type UnixFileUriOptions = {
    sourceEncoding?: string,
    targetEncoding?: string,
    newName?: string,
    forceOverwrite?: boolean,
    sessionID?: number,
    lastChunk?: boolean,
    responseType?: string
  }

  /**
     An interface which allows an App easy access to URIs specific to its own namespace
     @interface
   */
  interface UriBroker {
    desktopRootUri(): string;
    datasetMetadataHlqUri(updateCache?: boolean, types?: string, workAreaSize?: number, resumeName?: string, resumeCatalogName?: string): string;
    datasetMetadataUri(dsn: string, detail?: string, types?: string, listMembers?: boolean, workAreaSize?: number, includeMigrated?: boolean, includeUnprintable?: boolean, resumeName?: string, resumeCatalogName?: string): string;
    datasetContentsUri(dsn: string): string;
    VSAMdatasetContentsUri(dsn: string, closeAfter?: boolean): string;
    /*TODO: for breaking change, we need to change this into a passed object so that its way cleaner and
            more clear as to what is going on
    */
    unixFileUri(route: string, absPath: string,
                sourceEncodingOrOptions?: string | UnixFileUriOptions | undefined,
                targetEncoding?: string | undefined, newName?: string | undefined,
                forceOverwrite?: boolean | undefined, sessionID?: number | undefined, 
                 lastChunk?: boolean | undefined, responseType?: string): string;
    omvsSegmentUri(): string;
    rasUri(uri: string): string;
    serverRootUri(uri: string): string;
    pluginResourceUri(pluginDefinition: Plugin, relativePath: string): string;
    pluginListUri(pluginType?: PluginType): string;
    pluginConfigForScopeUri(pluginDefinition: ZLUX.Plugin, scope: string, resourcePath: string, resourceName?: string): string;
    /**
       Returns a URI for accessing a resource for a particular user. NOTE: This command should be gated by authorization that restricts it to administrative use.
       Temporarily removed until authorization checks are in place
       @function
     */
    //pluginConfigForUserUri(pluginDefinition: ZLUX.Plugin, user: string, resourcePath: string, resourceName?: string): string;
    /**
       Returns a URI for accessing a resource for a particular group. NOTE: This command should be gated by authorization that restricts it to administrative use.
       Temporarily removed until authorization checks are in place
       @function
     */
    //pluginConfigForGroupUri(pluginDefinition: ZLUX.Plugin, group: string, resourcePath: string, resourceName?: string): string;
    pluginConfigUri(pluginDefinition: ZLUX.Plugin, resourcePath: string, resourceName?: string): string;
    pluginWSUri(pluginDefinition: Plugin, serviceName: string, 
        relativePath: string, version?: string): string;
    pluginRESTUri(pluginDefinition: Plugin, serviceName: string, 
        relativePath: string, version?: string): string;
  }

  
  interface PluginWatcher {
    instanceAdded(instanceId: MVDHosting.InstanceId, isEmbedded: boolean|undefined): void;
    instanceRemoved(instanceId: MVDHosting.InstanceId): void;
  }

  const enum PluginType {
    Desktop = "desktop",
    Application = "application"
  }

  interface Plugin {
    getKey():string;
    getIdentifier():string;
    getVersion():string;
    getWebContent():any;
    getType():PluginType;
    getCopyright(): string;
    hasComponents(): boolean;
  }

  interface ContainerPluginDefinition {
    getBasePlugin():Plugin;
  }

  /**
   * An abstract component factory capable of instantiating a component into a DOM Element.
   */
  interface ComponentFactory {
    /**
     * Obtains the class of the component this factory can create.
     *
     * @returns The class of the component created by this factory
     */
    getClass(): ComponentClass;

    /**
     * Obtains the set of capabilities offered by the component created by this factory.
     *
     * @returns An array of capabilities offered by this component.
     */
    getCapabilities(): Capability[];

    /**
     * Instantiates the component into the specified DOM element and returns an implementation of the component's capabilities.
     *
     * @param   target The DOM element into which the component should be constructed
     * @returns        An implementation of the instances corresponding to the capabilities offered by this component
     */
    instantiateIntoDOM(target: HTMLElement): Rx.Observable<IComponent>;
  }

  /**
   * A registry of component factories.
   */
  interface Registry {
    /**
     * Registers a component factory into the registry. Subsequent calls to `getComponentFactories` will be able to retrieve this factory.
     */
    registerComponentFactory(factory: ComponentFactory): void;

    /**
     * Gets a component factory of the specified class offering the specified capabilities.
     *
     * @param   componentClass The class of component desired
     * @param   capabilities   An array containing the desired capabilities
     * @returns                An array of component factories that create components of the specified type with the specified capabilities
     */
    getComponentFactories(componentClass: ComponentClass, capabilities: Capability[]): ComponentFactory[];
  }

  const enum ComponentClass {
    Editor = "zlux.component-class.editor",
    FileBrowser = "zlux.component-class.file-browser"
  }

  /**
   * The union type of all capabilities. This type encompasses the capabilities offered by all classes of components.
   */
  type Capability = EditorCapabilities | FileBrowserCapabilities;

  /**
   * The capabilities offered by editor components.
   */
  const enum EditorCapabilities {
    /**
     * The capability of a basic editor, providing at least single buffer editing functionality. This capability is required for all editors.
     */
    Editor = 'zlux.capability.editor',
    /**
     * The editor offers multi-buffer editting.
     */
    EditorMultiBuffer = 'zlux.capability.editor.multi_buffer',
    /**
     * The editor offers syntax highlighting.
     */
    EditorSyntaxHighlighting = 'zlux.capability.editor.syntax_highlighting',
    /**
     * The editor supports project contexts, either for single files or large sets of files.
     */
    EditorProjectAware = 'zlux.capability.editor.project_aware',
    /**
     * The editor is capable of performing build actions.
     */
    EditorBuildSupport = 'zlux.capability.editor.build_support',
    /**
     * The editor is capable of utilizing a language server using the VSCode language server protocol.
     */
    EditorLanguageSupport = 'zlux.capability.editor.language_support'
  }

  /**
   * The capabilities offered by a file browser.
   */
  const enum FileBrowserCapabilities {
    /**
     * The capability of a basic file browser. This capability is required for all file browsers.
     */
    FileBrowser = 'zlux.capability.file_browser',
    /**
     * The file browser supports selecting multiple files or folders.
     */
    FileBrowserMultiSelect = 'zlux.capability.file_browser.multi_select',
    /**
     * The file browser supports selecting folders.
     */
    FileBrowserFolderSelect = 'zlux.capability.file_browser.folder_select',
    /**
     * The file browser supports selecting USS files.
     */
    FileBrowserUSS = 'zlux.capability.file_browser.uss',
    /**
     * The file browser supports selecting MVS datasets.
     */
    FileBrowserMVS = 'zlux.capability.file_browser.mvs'
  }

  /**
   * The base interface for a component. It provides functionality to determine the DOM element into which the component was rendered and the component's full set of capabilities.
   */
  interface IComponent {
    /**
     * Obtains the DOM element into which the component was rendered.
     *
     * @returns The DOM element where the component was rendered
     */
    getDOMElement(): HTMLElement;

    /**
     * Obtains all of the component's capabiltiies.
     *
     * @returns An array of the component's capabilities
     */
    getCapabilities(): Capability[];
  }


  /**
   * An opaque handle to a buffer within an editor instance.
   */
  type EditorBufferHandle = any;

  /**
   * An opaque handle to a project within an editor instance.
   */
  type EditorProjectHandle = any;

  /**
   * The set of potential build results.
   */
  const enum BuildStatus {
    /**
     * Indicates a successful build with no warnings or errors.
     */
    Success = 0,
    /**
     * Indicates a warning produced during the build process.
     */
    Warning = 1,
    /**
     * Indicates an error produced during the build process.
     */
    Error = 2,
    /**
     * Indicates a failure of the build system above the level of code warnings or errors.
     */
    Fatal = 3
  }

  /**
   * Contains the results from an attempted build.
   */
  interface BuildResult {
    /**
     * The final status of the build.
     */
    finalStatus: BuildStatus;
  }

  /**
   * The definition of a language server that can be used in the editor. It adheres to the VSCode Language Server Protocol.
   */
  interface IEditorLanguageServer {
    /**
     * Gets the language supported by this server.
     *
     * @returns The name of the language supported by this server
     */
    getSupportedLanguage(): string;

    /*
     * TODO: implementation of the language server API
     */
  }

  /**
   * Contains information about an event triggered when a file is opened into a buffer.
   */
  interface EditorFileOpenedEvent {
    /**
     * A handle to the buffer into which the file is opened.
     */
    buffer: EditorBufferHandle;

    /**
     * The file opened into the buffer.
     */
    file: string;
  }

  /**
   * Contains information about an event triggered when a buffer is saved into a file.
   */
  interface EditorBufferSavedEvent {
    /**
     * A handle to the buffer that was saved into the file.
     */
    buffer: EditorBufferHandle;

    /**
     * The file into which the buffer was saved.
     */
    file: string;
  }

  /**
   * Contains information about an event triggered when a new buffer is created.
   */
  interface EditorBufferCreatedEvent {
    /**
     * A handle to the new buffer created within the editor
     */
    buffer: EditorBufferHandle;
  }

  /**
   * Contains information about an event triggered when a buffer is closed.
   */
  interface EditorBufferDestroyedEvent {
    /**
     * A handle to the buffer that was closed.
     */
    buffer: EditorBufferHandle;

    /**
     * The path of the file that was open in the buffer, if available.
     */
    file: string | null;
  }

  /**
   * The abstract interface for a basic text editor, providing at least one buffer and basic open/save functionality.
   */
  interface IEditor extends IComponent {
    /**
     * Get a handle to the primary (currently focused) buffer in the editor.
     *
     * @returns A handle to the primary buffer in the editor
     */
    getPrimaryBuffer(): EditorBufferHandle;

    /**
     * Get the path of the file currently open in a given buffer.
     *
     * @param   buffer  A handle to the buffer
     * @returns         The path of the file open in that buffer, or null if the buffer is not associated with a file.
     */
    getBufferPath(buffer: EditorBufferHandle): string | null;

    /**
     * Open a file into a buffer.
     *
     * @param   file         The path of the file that should be opened
     * @param   targetBuffer The buffer into which the file should be opened, or null to open a new buffer
     * @returns              An observable that pushes a handle to the buffer into which the file was opened
     */
    openFile(file: string, targetBuffer: EditorBufferHandle | null): Rx.Observable<EditorBufferHandle>;

    /**
     * Save a buffer into a file.
     *
     * @param   buffer  The buffer that should be saved
     * @param   path    The path of the file into which the buffer should be saved, or null if the buffer is already associated with a file
     * @returns         An observable that pushes when the file has been saved
     */
    saveBuffer(buffer: EditorBufferHandle, path: string | null): Rx.Observable<void>;

    /**
     * Get the contents of a buffer.
     *
     * @param   buffer  The buffer that should be read
     * @returns         An observable that pushes the contents of the buffer.
     */
    getBufferContents(buffer: EditorBufferHandle): Rx.Observable<string>;

    /**
     * Checks if the buffer has been modified.
     *
     * @param   buffer The buffer to be checked
     * @returns        An observable that pushes whether or not the buffer has been modified
     */
    isBufferModified(buffer: EditorBufferHandle): Rx.Observable<boolean>;

    /**
     * An event that is triggered when a file is opened inside the editor.
     */
    fileOpened: Subject<EditorFileOpenedEvent>;

    /**
     * An event that is triggered when a file is saved inside the editor.
     */
    bufferSaved: Subject<EditorBufferSavedEvent>;
  }

  /**
   * The abstract interface for a multi-buffer editor, providing functionality for managing multiple buffers.
   */
  interface IEditorMultiBuffer extends IEditor {
    /**
     * Get the set of open buffers.
     *
     * @returns   An array of handles for all buffers open in the editor
     */
    getOpenBuffers(): EditorBufferHandle[];

    /**
     * Create a new buffer in the editor.
     *
     * @returns   A handle to the newly created buffer.
     */
    createBuffer(): EditorBufferHandle;

    /**
     * Destroys an existing buffer inside the editor.
     *
     * @param   buffer  The buffer that should be destroyed
     * @param   force   True to close the buffer even if it contains unsaved content, false to prompt the user
     * @returns       An observable that pushes when buffer is destroyed
     */
    destroyBuffer(buffer: EditorBufferHandle, force: boolean): Rx.Observable<void>;

    /**
     * An event that is triggered when a new buffer is created.
     */
    bufferCreated: Subject<EditorBufferCreatedEvent>;

    /**
     * An event that is triggered when a buffer is destroyed.
     */
    bufferDestroyed: Subject<EditorBufferDestroyedEvent>;
  }

  /**
   * The abstract interface for a buffer capable of syntax highlighting for languages.
   */
  interface IEditorSyntaxHighlighting extends IEditor {
    /**
     * Sets the highlighting mode for a given buffer.
     *
     * @param buffer   The buffer for which the highlighting mode should be set
     * @param language The highlighting mode for the buffer
     */
    setHighlightingModeForBuffer(buffer: EditorBufferHandle, language: string): void;

    /**
     * Gets the highlighting mode for a given buffer.
     *
     * @param   buffer The buffer for which the highlighting mode should be checked
     * @returns        The highlighting mode of the buffer
     */
    getHighlightingModeForBuffer(buffer: EditorBufferHandle): string;

    /**
     * Gets recommendations for the highlighting mode based on the contents or file associated with a given buffer.
     *
     * @param   buffer The buffer for which the recommendations should be issued
     * @returns        An observable that pushes an array of recommended highlighting modes for the buffer
     */
    getRecommendedHighlightingModesForBuffer(buffer: EditorBufferHandle): Rx.Observable<string[]>;

    /**
     * Gets the set of supported highlighting modes for this editor.
     *
     * @returns An observable that pushes an array of supported highlighting modes
     */
    getSupportedHighlightingModes(): Rx.Observable<string[]>;
  }

  /**
   * The abstract interface for an editor capable of managing one or more projects for development, building, or testing.
   */
  interface IEditorProjectAware extends IEditor {
    /**
     * Gets the full set of projects open in the editor.
     *
     * @returns An array of handles to the editor's open projects.
     */
    getOpenProjects(): EditorProjectHandle[];

    /**
     * Gets the root directory or file of the current project. For editors that support single-file projects, this may be a file path.
     *
     * @param   project The project to be inspected
     * @returns         The root path of the current project
     */
    getProjectRoot(project: EditorProjectHandle): string;
  }

  /**
   * The abstract interface for an editor capable of building projects.
   *
   * In the future, this interface will be extended to support a full VSCode Debug Protocol-based build and debug system.
   */
  interface IEditorBuildSupport extends IEditorProjectAware {
    /**
     * Perform a builds and returns the results of that build.
     *
     * @param   buildParams Any parameters that should be passed to the build operation
     * @returns             An observable that returns the results of the build
     */
    performBuild(buildParams: any): Rx.Observable<BuildResult>;
  }

  interface IEditorLanguageSupport extends IEditor {
    /**
     * Obtains the set of built-in language servers for the editor.
     *
     * @returns The set of built-in language servers for the editor.
     */
    getBuiltInLanguageServers(): IEditorLanguageServer[];

    /**
     * Attaches a language server for parsing a given buffer.
     *
     * @param buffer The buffer for which to attach the language server
     * @param server The server to attach to the buffer
     */
    attachLanguageServer(buffer: EditorBufferHandle, server: IEditorLanguageServer): void;

    /**
     * Gets the recommended languages for a given buffer, if avilable. These recommendations may be made based on open files, content, or other contextual information.
     *
     * @param   buffer The buffer for which to issue recommendations
     * @returns A set of recommendations for the contents of the buffer
     */
    getRecommendedLanguagesForBuffer(buffer: EditorBufferHandle): Rx.Observable<string[]>;
  }

  /**
   * The information associated with an event triggered when a file has been selected.
   */
  interface FileBrowserFileSelectedEvent {
    /**
     * An array of the paths of the selected files.
     */
    path: string[];
  }

  /**
   * The interface for a basic file browser. It supports functionality for retrieving the selected path and issues events when a new file is selected.
   */
  interface IFileBrowser extends IComponent {
    /**
     * Gets the currently selected path in the file browser.
     *
     * @returns The selected path
     */
    getSelectedPath(): string;

    /**
     * Opens the file browser to a specified file or directory.
     *
     * @param path  The path to which the browser should be opened
     */
    browsePath(path: string): void;

    /**
     * An event that is triggered when a file is selected in the file browser. It contains information about the chosen file.
     */
    fileSelected: Subject<FileBrowserFileSelectedEvent>;
  }

  /**
   * The interface for a file browser supporting multi-select.
   */
  interface IFileBrowserMultiSelect extends IFileBrowser {
    /**
     * Gets the set of currently selected files in the file browser.
     */
    getSelectedPaths(): string[];
  }

  /**
   * The interface for a file browser supporting folder selection.
   */
  interface IFileBrowserFolderSelect extends IFileBrowser {
  }

  /**
   * The interface for a file browser supporting USS file selection.
   */
  interface IFileBrowserUSS extends IFileBrowser {
  }

  /**
   * The interface for a file browser supporting MVS dataset selection.
   */
  interface IFileBrowserMVS extends IFileBrowser {
  }
}

/* We assume the presence of a global require function for acquiring shared libraries */
declare const require: (identifier: string) => any;

declare var ZoweZLUX: typeof ZoweZLUXResources;

declare class ZoweZLUXResources {
  //previously was PluginManager
  static pluginManager: any;
  static uriBroker: ZLUX.UriBroker;
  static dispatcher: ZLUX.Dispatcher;
  static logger: ZLUX.Logger;
  static registry: ZLUX.Registry;
  //previously was NotificationManager
  static notificationManager: any;
  static globalization: ZLUX.Globalization;
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
