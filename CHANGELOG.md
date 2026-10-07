# Zlux Platform Changelog

All notable changes to the Zlux Platform package will be documented in this file.
This repo is part of the app-server Zowe Component, and the change logs here may appear on Zowe.org in that section.

## 3.6.0
- Enhancement: Added `host?: string` to the `ZLUX.AgentConfig` interface, exposing the ZSS/agent hostname alongside the existing `mediationLayer` property.
- Enhancement: Added `getAgentHost(): Promise<string|undefined>` to the `ZLUX.Environment` interface and its `Environment` implementation. Reads `agent.host` from the cached `/server/environment` response, allowing any plugin to retrieve the agent hostname via `ZoweZLUX.environment.getAgentHost()` without making an additional HTTP request.
