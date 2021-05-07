import { Router } from 'express';

declare namespace ZLUXServerFramework {

    export interface Capabilities {
        canGetStatus: boolean,
        canRefresh: boolean,
        canAuthenticate: boolean,
        canAuthorize: boolean,
        canAddProxyAuthorization: boolean
    }

    export interface AuthenticateResult {
        success: boolean,
        username: string,
        expms: number
    }

    export interface AuthorizeResult {
        authenticated: boolean,
        authorized: boolean
    }

    export interface NodeAuthenticationInterface {
        authenticate(request: Object, sessionState: Object): Promise<AuthenticateResult>;
        getCapabilities(): Capabilities | Object;
        getStatus(sessionState: Object): Object;
        refreshStatus(request: Object, sessionState: Object): Promise<AuthenticateResult>;
        authorized(request: Object, sessionState: Object): AuthorizeResult;
    }

    export type StorageLocationType = 'ha' | 'cluster' | 'local';
    
    type Dict = { [key: string]: any };
    
    export interface PluginStorage {
      get(key: string, storageType?: StorageLocationType): Promise<any>;
      getAll(storageType?: StorageLocationType): Promise<Dict>;
      set(key: string, value: any, storageType?: StorageLocationType): Promise<void>;
      setAll(dict: Dict, storageType?: StorageLocationType): Promise<void>;
      delete(key: string, storageType?: StorageLocationType): Promise<void>;
      deleteAll(storageType?: StorageLocationType): Promise<void>;
    }
    
    export interface DataServiceContext {
      storage: PluginStorage;
      logger:  ZLUX.ComponentLogger;
      addBodyParseMiddleware: (router: Router) => void;
    }
    
}