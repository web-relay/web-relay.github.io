---
title: Architecture and workspace
description: The capability registry, package boundaries, execution path, and local fallback.
---

:::note[Design proposal]
The pnpm monorepo and three-app development structure are accepted decisions. Transport details and SDK APIs remain proposals. The current implementation is a scaffold, with no connected discovery or execution yet.
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

## Accepted development structure

The [runtime monorepo](https://github.com/web-relay/web-relay) contains:

```text
apps/
  demo-pwa/             Local app and future in-app palette
  launcher-extension/   Global launcher extension
  webapp-extension/     Independent provider for another web app
packages/
  core/                 Shared capability metadata; future registry
  protocol/             Future validated discovery and invocation contracts
```

Use pnpm workspace dependencies to share TypeScript contracts. Build the two extensions as separate unpacked installations. Their source lives together; their browser identities and permission boundaries remain separate.

The demo PWA has an offline-capable shell. Both extensions have loadable starter manifests and popups. Provider discovery, runtime execution, trust approval, and command aggregation are not implemented yet.

The documentation remains in [web-relay.github.io](https://github.com/web-relay/web-relay.github.io), publishing at the organization’s root URL. Update it as implementation reveals details and decisions are accepted.

## Discovery and composition

Start with applications and extensions we own and run locally. Explicit local provider configuration should make the first integration easier to inspect and test. Locality does not automatically identify or authorize a provider: origin checks, extension identities, message validation, and permissions are still required.

Each app owns its live context and execution functions. The global launcher should hold discoverable metadata and route requests back to the owning provider; it should not receive executable function bodies.

For the MVP, composition means collecting commands from several sources in one interface. Chaining commands into workflows remains out of scope.

## Proposed SDK packages

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
