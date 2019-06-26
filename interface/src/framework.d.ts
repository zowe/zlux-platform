declare namespace ZLUXFramework {

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
}