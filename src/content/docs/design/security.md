---
title: Trust and permissions
description: Security principles and unresolved protocol requirements for browser capabilities.
---

A capability can modify application data, close tabs, or trigger workflows. The runtime must preserve browser security boundaries while making actions discoverable.

:::note[Intent, not a security guarantee]
These are requirements for a future implementation. No security-reviewed runtime exists yet.
:::

## Principles from the product brief

- Execute capabilities only from trusted providers.
- Clearly identify each capability’s source.
- Request host permissions incrementally.
- Avoid arbitrary downloaded executable JavaScript.
- Prefer local or built-in adapters.
- Let users disable providers.
- Preserve browser security boundaries.

## Boundaries to resolve before shipping

**Page to content script.** Validate message format and protocol version. Tie messages to the expected window, origin, tab, and connected application. A handshake discovers a connection; it does not independently prove trust.

**Extension to extension.** Identify and authorize provider extensions explicitly. Treat incoming metadata, context, and invocation arguments as untrusted data until validated.

**Discovery to execution.** Displaying an action is separate from allowing it to run. Recheck availability and input at execution time. Define permission and confirmation behavior for sensitive actions.

**Application context.** Minimize shared fields, avoid broadcasting secrets, and define how context expires when tabs navigate or disconnect.

**Adapters.** Avoid silently fetching executable code. Declarative community adapters may eventually offer a better distribution model, but are outside the MVP.

## Open design questions

How are providers approved and revoked? Which actions need confirmation? How are malformed messages, stale context, errors, and disconnects handled? How should origin permissions be explained to users?

These questions belong in the bridge and provider design before the runtime can be considered ready for general use.
