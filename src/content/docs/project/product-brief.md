---
title: Original product brief
description: The original Browser Capability Launcher proposal, preserved as the project’s source brief.
---

:::note[Source proposal]
The original brief is preserved below. Package names, API examples, shortcuts, and future opportunities are proposals, not released functionality. The overview and design pages organize this brief for readers.
:::

# Browser Capability Launcher — PRD

## 1. Product Summary

Browser Capability Launcher is a **local-first command launcher and capability runtime for the browser**.

It provides a single, context-aware command interface across:

- PWAs and web applications
- browser extensions
- browser-native capabilities
- WebMCP-enabled websites
- legacy websites through optional adapters
- future agent, voice, and external-device interfaces

The initial user experience is similar to Raycast or a command palette:

```text
Open launcher
→ search for an action
→ execute it immediately
```

However, the project is not intended to be merely a “Raycast clone for the browser”.

Its deeper purpose is to provide a **common capability layer** through which applications can expose actions once and make them available to multiple interfaces.

```text
                    Capability Registry

             ┌──────────┬──────────┬──────────┐
             ▼          ▼          ▼          ▼
          Launcher    In-App      Agent      Voice
                     Palette
```

A developer should be able to define an action once:

```ts
launcher.register({
  id: "workspace.open-ai",
  title: "Open AI Workspace",

  run: async () => {
    // application logic
  }
});
```

and have the same capability available from:

- the application's own command palette
- the global browser launcher
- WebMCP / agents
- another browser extension
- future automation surfaces

---

# 2. Problem

Modern browser-based workflows are increasingly fragmented.

A developer or power user may spend most of the day inside a browser containing:

```text
PWAs
internal applications
GitHub
dashboards
admin tools
LLM applications
browser extensions
tab groups
developer tools
```

Each application exposes its own navigation, shortcuts, command palette, menus, and interaction model.

There is no shared command layer across them.

This creates several recurring problems.

---

# 3. Pain Points

## 3.1 Too much navigation for simple actions

Many browser actions require several UI interactions even when the user's intention is simple.

For example:

```text
Switch tab
→ navigate to page
→ open menu
→ locate action
→ click
```

The real intention may simply be:

```text
> Open AI workspace
```

or:

```text
> Save current podcast timestamp
```

or:

```text
> Open current customer in support portal
```

The browser already contains the necessary application state and authenticated session, but there is no universal way to invoke the action directly.

---

## 3.2 Every PWA implements its own command system

Developers often create application-specific command palettes such as:

```text
Cmd/Ctrl + K
```

However, each application implements:

- command registration
- search
- shortcuts
- availability rules
- execution
- UI

independently.

A user with several personal PWAs ends up with multiple isolated command systems.

The application developer also cannot easily expose the same capabilities to another interface.

---

## 3.3 Useful application capabilities are trapped inside the app

An application may already know how to perform actions such as:

```text
create note
open project
start task
save timestamp
restore workspace
open customer
run workflow
```

But these functions are only accessible through that application's UI.

They cannot easily be invoked from:

- a global launcher
- another extension
- an AI agent
- voice input
- external hardware

This creates unnecessary duplication.

---

## 3.4 Browser extensions are isolated from one another

Browser extensions frequently implement useful capabilities.

For example, a Tab Workspace Manager might already support:

```text
Open coding workspace
Restore tab group
Open LLM group
Save workspace
Move current tab to workspace
```

Another extension cannot easily surface these capabilities in a consistent user interface unless the two explicitly integrate.

The launcher should allow extensions to expose actions as first-class capabilities.

---

## 3.5 Context is lost between applications

Many useful actions depend on the current application context.

For example:

```text
Current customer: 1234
Current repository: cmwen/project
Current episode: Episode 42
Current workspace: AI Development
```

A traditional launcher usually knows little about the currently active application.

This results in unnecessary prompts or navigation.

A context-aware launcher should be able to expose actions such as:

```text
Open current customer in support portal
Copy current repo name
Save current episode timestamp
Move current tab to research workspace
```

without asking the user to re-enter information the browser already knows.

---

## 3.6 Agents need structured capabilities, not only DOM automation

AI browser agents can interact with applications through the DOM, but DOM interaction is often:

- slower
- less reliable
- difficult to maintain
- dependent on UI structure

Modern applications should instead be able to expose structured capabilities directly.

WebMCP is emerging as a standard mechanism for this.

The launcher should be able to consume WebMCP capabilities while maintaining its own internal capability model.

---

## 3.7 Legacy applications cannot easily adopt new standards

Many internal or older web applications will never implement WebMCP or a launcher SDK.

For stable applications, browser-extension adapters may provide a compatibility layer by reading:

- URL
- DOM
- page state
- existing application behavior

and exposing selected capabilities.

These adapters should be treated as a fallback rather than the primary integration model.

---

## 3.8 A public marketplace may create more noise than value

A large public extension marketplace could easily accumulate:

- abandoned integrations
- duplicate plugins
- low-quality AI-generated adapters
- insecure code
- broken selectors
- maintenance burden

The initial product should therefore focus on:

```text
local applications
self-developed PWAs
personal extensions
internal tools
high-value integrations
```

rather than building a marketplace.

---

# 4. Product Vision

The browser should behave more like an operating environment in which applications expose actions through a shared capability interface.

Instead of:

```text
Browser
├── App A UI
├── App B UI
├── Extension A UI
└── Extension B UI
```

the product introduces:

```text
Browser Environment
        │
        ▼
Capability Layer
        │
        ▼
Universal Launcher
```

Applications remain independent, but useful actions become discoverable through one interface.

---

# 5. Product Principles

## 5.1 Local-first

The launcher must work without a backend.

Core functionality should run entirely inside the browser and local applications.

A remote service may later support:

- synchronization
- adapter distribution
- updates
- metadata
- discovery

but it must not be required for command execution.

---

## 5.2 Define once, expose everywhere

Applications should define a command once and make it reusable across multiple surfaces.

```text
Application command
       │
       ├── In-app palette
       ├── Browser launcher
       ├── WebMCP
       ├── Agent
       └── Future voice/device interface
```

---

## 5.3 Context-aware by default

Commands should be available only when relevant.

For example:

```ts
when: () => currentEpisode != null
```

or:

```ts
when: ({ route }) =>
  route.startsWith("/customers/")
```

The global launcher should prioritize commands relevant to the active tab.

---

## 5.4 Integration should be lightweight

A self-developed PWA should require minimal code to expose capabilities.

Target developer experience:

```bash
pnpm add @launcher/core
```

then:

```ts
launcher.register(...)
```

A developer should not need to understand browser-extension messaging.

---

## 5.5 Standards should be adapters, not hard dependencies

WebMCP should be supported, but the internal architecture should not be tightly coupled to the WebMCP API.

```text
Internal Capability Model
          ↑
          │
     WebMCP Adapter
```

This allows the project to adapt if WebMCP evolves.

---

## 5.6 Prefer explicit capabilities over DOM automation

Priority order:

```text
1. Native Launcher SDK
2. Native WebMCP
3. Browser extension provider
4. Legacy site adapter
5. Generic browser action
```

DOM-based adapters are compatibility tools, not the default architecture.

---

# 6. Target Users

## Primary

Developers and technical power users who:

- build their own PWAs
- use multiple browser-based tools
- maintain browser extensions
- use internal enterprise applications
- want keyboard-driven workflows
- want to connect browser applications to AI agents

## Secondary

Teams building internal browser applications that want a shared command layer across multiple applications.

---

# 7. Core User Experience

The user installs the browser extension and activates the launcher.

Example:

```text
Alt + Space
```

The launcher displays commands based on the current context.

Inside a podcast PWA:

```text
Save current timestamp
Create episode note
Add episode to queue
────────────────────
Open AI Workspace
Restore Coding Workspace
Copy Current URL
```

Inside GitHub:

```text
Copy repository name
Open repository workspace
Create coding session
────────────────────
Open AI Workspace
Restore Coding Workspace
```

On a generic website:

```text
Copy URL
Copy title as Markdown
Open downloads
Restore workspace
```

The launcher dynamically combines commands from multiple capability sources.

---

# 8. Capability Sources

The launcher should support several providers.

## 8.1 PWA SDK

Self-developed applications integrate using the launcher SDK.

```text
PWA
 ↓
@launcher/core
 ↓
Capability Registry
```

This is the preferred integration path.

---

## 8.2 WebMCP

If the active application exposes WebMCP tools, the launcher can translate them into capabilities.

```text
WebMCP
 ↓
WebMCP Adapter
 ↓
Capability Registry
```

---

## 8.3 Browser Extensions

Other extensions may expose capabilities through cross-extension messaging.

Example:

```text
Tab Workspace Manager
        ↓
Extension Provider API
        ↓
Launcher Extension
```

---

## 8.4 Browser-Native Capabilities

The launcher itself may expose commands such as:

```text
Open new tab
Close current tab
Copy current URL
Open downloads
Search history
Switch tab
Manage tab groups
```

---

## 8.5 Legacy Site Adapters

For selected stable websites:

```text
Legacy Website
      ↓
Adapter
      ↓
Synthetic Capabilities
```

Adapters may inspect:

- URL
- DOM
- page state
- browser storage
- application events

They are expected to require maintenance when the target site changes.

---

# 9. Proposed SDK Architecture

```text
packages/

@launcher/core
@launcher/ui
@launcher/extension-bridge
@launcher/webmcp
@launcher/extension
```

## `@launcher/core`

Defines the internal capability model.

Example:

```ts
interface Capability {
  id: string;
  title: string;

  description?: string;
  keywords?: string[];
  icon?: string;

  inputSchema?: JsonSchema;

  when?: (
    context: CapabilityContext
  ) => boolean;

  run(
    input: unknown,
    context: CapabilityContext
  ): Promise<unknown>;
}
```

Primary APIs:

```ts
launcher.register()
launcher.unregister()
launcher.getCommands()
launcher.execute()
launcher.subscribe()
```

---

## `@launcher/ui`

Optional in-app command palette.

If the global extension is not installed, the application still has its own launcher.

```text
Cmd/Ctrl + K
```

---

## `@launcher/extension-bridge`

Connects a PWA registry to the browser extension.

Possible transport:

```text
window.postMessage
       ↓
content script
       ↓
extension runtime
```

---

## `@launcher/webmcp`

Maps registered capabilities to and from WebMCP.

---

## `@launcher/extension`

Allows another browser extension to expose capabilities.

Example:

```ts
launcher.register({
  id: "workspace.open-ai",
  title: "Open AI Workspace",
  run: openAiWorkspace
});
```

The SDK handles cross-extension messaging.

---

# 10. Extension Detection

A launcher-aware PWA should be able to detect whether the global extension is installed.

Example handshake:

```text
PWA
 │
 ├── launcher:hello
 │
 ▼
Extension
 │
 └── launcher:ready
```

Behavior:

```text
Extension available
→ use global launcher

Extension unavailable
→ use local in-app palette
```

The user should ideally experience the same shortcut and interaction model in either case.

---

# 11. Context Model

Applications may expose context alongside capabilities.

Example:

```ts
{
  app: "podcast",
  route: "/episode/42",

  context: {
    episodeId: "42",
    playing: true
  }
}
```

The launcher can use context to:

- filter commands
- rank commands
- pass context into actions
- avoid asking for already-known information

---

# 12. Backend Requirements

No backend is required for the MVP.

Local execution should work as:

```text
Browser Extension
├── Capability Registry
├── PWA connections
├── Extension providers
├── WebMCP discovery
└── Browser commands
```

A future backend could optionally support:

```text
adapter catalogue
sync
metadata
updates
signatures
health monitoring
```

The guiding rule is:

> A backend may improve the launcher, but should never be required for the launcher to function.

---

# 13. Adapter Strategy

Legacy adapters should only target applications where:

- the integration provides meaningful value
- the UI or DOM is relatively stable
- the user controls or understands the target system
- maintenance cost is acceptable

Adapters should ideally contain testable assumptions.

Future maintenance workflow:

```text
Scheduled coding agent
       ↓
Open target website
       ↓
Run adapter tests
       ↓
Detect failure
       ↓
Inspect current site
       ↓
Generate patch
       ↓
Run tests
       ↓
Create PR
```

This is a possible future feature, not an MVP requirement.

---

# 14. Security Principles

Capabilities may perform powerful actions.

The product should therefore:

- execute capabilities only from trusted providers
- clearly identify the capability source
- request host permissions incrementally
- avoid arbitrary downloaded executable JavaScript
- prefer local or built-in adapters
- allow users to disable capability providers
- preserve browser security boundaries

For community adapters, declarative definitions may eventually be preferable to arbitrary remote JavaScript.

---

# 15. MVP

The first version should intentionally remain small.

## MVP components

### Browser Launcher Extension

Provides:

- keyboard shortcut
- fuzzy command search
- capability registry
- active-tab context
- browser-native commands

### PWA SDK

Supports:

```text
register
unregister
execute
availability
```

### PWA Bridge

Allows the extension to discover and execute app commands.

### Local Command Palette

Allows the same PWA capabilities to work without the extension.

### Extension Provider SDK

Allows one other browser extension to expose commands.

---

# 16. MVP Dogfood Scenario

Use three components:

```text
1. Personal PWA
2. Launcher Extension
3. Tab Workspace Manager Extension
```

Example commands:

From the PWA:

```text
Create note
Search notes
Sync data
```

From Tab Workspace Manager:

```text
Open AI Workspace
Restore Coding Workspace
Save Current Workspace
```

From the browser:

```text
Copy current URL
Open downloads
Close current tab
```

All should appear through one launcher.

---

# 17. Non-Goals for Initial Release

Do not initially build:

- public marketplace
- cloud accounts
- cloud synchronization
- billing
- AI recommendation engine
- general website automation
- large adapter catalogue
- remote backend
- workflow automation engine

The MVP should prove one thing:

> Multiple browser applications and extensions can expose useful capabilities through one local, context-aware launcher.

---

# 18. Success Criteria

The MVP is successful if:

1. A developer can add launcher support to a PWA with a small SDK integration.
2. The same command appears in both the PWA's local palette and the global launcher.
3. Commands dynamically appear or disappear based on app context.
4. A separate browser extension can expose capabilities to the launcher.
5. Browser-native commands coexist with app-specific commands.
6. The entire system works without a backend.
7. Adding a new first-party application does not require modifying launcher core code.

---

# 19. Longer-Term Opportunities

If the core capability model proves useful, the same registry could power:

```text
keyboard launcher
voice commands
AI agents
WebMCP
browser automation
mobile remote control
ESP32 controller
workflow orchestration
```

At that point the launcher becomes one interface over a broader concept:

> **A local capability runtime for the browser environment.**

The browser extension is therefore not the entire product.

It is the first client of the capability platform.