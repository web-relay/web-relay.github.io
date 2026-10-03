---
title: Proposed architecture
description: The capability registry, package boundaries, execution path, and local fallback.
---

:::note[Design proposal]
These package boundaries and transport details are starting points for discussion. They are not implemented or published packages.
:::

## One internal capability model

```text
PWA SDK ─────────────────┐
Extension provider ──────┤
Browser commands ────────┼──→ Capability registry
WebMCP adapter (later) ──┤         │
Legacy adapter (later) ──┘         ├── Browser launcher
                                  ├── In-app palette
                                  └── Future interfaces
```

Providers describe capabilities; the registry tracks their metadata and availability; an interface presents relevant commands. Execution is routed back to the owning provider.

## Proposed packages

| Package | Responsibility |
| --- | --- |
| `@launcher/core` | Capability types, registration, availability, subscriptions, and execution. |
| `@launcher/ui` | Optional in-app command palette. |
| `@launcher/extension-bridge` | Communication between PWA registries and the launcher extension. |
| `@launcher/webmcp` | Translation between the internal capability model and WebMCP. |
| `@launcher/extension` | Provider SDK for another browser extension. |

The launcher extension itself supplies the global UI, active-tab context, browser commands, and provider connections. The `@launcher/*` scope comes from the original brief and is a placeholder.

## PWA execution path

```text
PWA registry
    ↕ window.postMessage (proposed)
Content script
    ↕ extension runtime messaging
Launcher extension
```

An application owns its functions and application state. The bridge should communicate capability descriptions and validated invocation requests rather than transferring executable function bodies.

## Extension discovery and local fallback

The proposed discovery handshake is `launcher:hello` from the PWA and `launcher:ready` from the extension.

When the extension is available, capabilities can appear in the global launcher. Without it, the application’s optional local palette should still work, using the same registrations. `Cmd/Ctrl + K` is the example in-app shortcut.

Handshake timeouts, protocol versioning, lifecycle cleanup, and shortcut coordination are open implementation questions.

## No backend in the critical path

The MVP registry, bridge, providers, and command execution remain local. Future services could improve synchronization, adapter distribution, signatures, metadata, or health monitoring, but must not become required for the launcher to function.

See [capabilities and context](/design/capabilities/) and [trust boundaries](/design/security/).
