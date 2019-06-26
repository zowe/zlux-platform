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

    export interface SessionState {
        authenticated: boolean,
        zssUsername: string,
        sessionExpTime: number,
        zssCookies: string
    }

    export interface NodeAuthenticationInterface {
        authenticate(request: Object, sessionState: SessionState): Promise<AuthenticateResult>;
        getCapabilities(): Capabilities | Object;
        getStatus(sessionState: SessionState): SessionState | Object;
        refreshStatus(request: Object, sessionState: SessionState): Promise<AuthenticateResult>;
        authorized(request: Object, sessionState: SessionState): AuthorizeResult;
    }
}