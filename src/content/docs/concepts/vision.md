---
title: Why a shared capability layer?
description: The browser workflow problems and principles behind the proposal.
---

Browser workflows span PWAs, internal dashboards, GitHub, admin tools, extensions, and tab groups. Each has its own navigation, shortcuts, menus, and command palette. Useful actions become isolated inside individual interfaces.

## From navigation to intent

A simple intention such as “open this customer in the support portal” may require switching tabs, finding a page, opening a menu, and locating an action. The active application already knows which customer is selected.

Web Relay proposes a direct path:

```text
User intent → relevant capability → application execution
```

## Six guiding principles

| Principle | Design consequence |
| --- | --- |
| Local-first | Core command execution works without a backend. |
| Define once, expose everywhere | The same registration powers local and global interfaces. |
| Context-aware by default | Availability and ranking reflect the active app and state. |
| Lightweight integration | App developers should not need to implement extension messaging themselves. |
| Standards through adapters | WebMCP maps to the internal model rather than defining it. |
| Explicit capabilities first | Native integration takes priority over DOM-based compatibility. |

## Capabilities should leave the app UI

“Create note,” “save timestamp,” “restore workspace,” and “open project” are application capabilities, not just buttons. Exposing them explicitly can make them reusable without duplicating application logic.

The extension is the first client of this platform. The longer-term idea is a local capability runtime for the browser environment.

## Start with a small ecosystem

The initial focus is personal applications, self-developed extensions, internal tools, and a few high-value integrations. A broad marketplace risks abandoned adapters, duplicate plugins, insecure code, and maintenance overhead before the model proves useful.

[The roadmap](/project/roadmap/) keeps the first milestone deliberately small.
