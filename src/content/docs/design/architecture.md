---
title: Architecture and workspace
description: The capability registry, package boundaries, execution path, and local fallback.
---

:::note[Design proposal]
The local showcase now implements a provider-owned registry, PWA SDK bridge, launcher UI, browser actions, and a paired GitHub provider extension. This is a development prototype, not a released or security-reviewed platform. Broader SDK APIs and provider enrollment remain proposals.
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

The [runtime monorepo](https://github.com/web-relay/web-relay) is the reference implementation, example workspace, and integration test harness. It currently contains:

```text
apps/
  demo-pwa/             Local app and future in-app palette
  launcher-extension/   Global launcher extension
  webapp-extension/     Independent provider for another web app
packages/
  core/                 Provider-owned capability registry
  protocol/             Validated versioned wire contracts
  sdk/                  PWA SDK and page messaging
```

Use pnpm workspace dependencies to share TypeScript contracts. Build the two extensions as separate unpacked installations. Their source lives together; their browser identities and permission boundaries remain separate.

Real provider extensions and PWAs should live in their own folders or repositories. They communicate through the shared protocol and SDK; discovery does not depend on sharing a source directory. The launcher can be built and installed independently from the example apps.

The current prototype still pairs known GitHub and LLM provider IDs and two demo PWA origins. Moving an app's source does not change that pairing, but adding a new provider or serving a PWA at another origin requires explicit launcher configuration changes today. Configurable provider enrollment and separately consumable SDK packages are the next integration work, not implemented features.

The separate `llm-provider-extension` folder demonstrates an integration outside the monorepo. It uses `@web-relay/sdk/extension` and is built and installed independently. Its development build resolves the shared SDK from the sibling checkout; npm distribution remains deferred.

The notes PWA exposes create and pin actions through the SDK and its local palette. The launcher is now an injected dialog inside the active page. It discovers the active demo app, the paired GitHub extension, the paired LLM provider, browser actions, and tabs in the current window. GitHub capabilities navigate repository pages without DOM selectors or account writes. See the [showcase guide](/project/showcase/) for setup.

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

The original brief proposed a `launcher:hello` / `launcher:ready` handshake. The first implementation uses discovery requests described below.

When the extension is available, capabilities can appear in the global launcher. Without it, the application’s optional local palette should still work, using the same registrations. `Cmd/Ctrl + K` is the example in-app shortcut.

The implemented prototype uses pull discovery and versioned, correlated `discover` and `execute` requests instead of the proposed hello/ready handshake. It does not maintain a continuously pushed registry. Opening or refreshing the launcher discovers current commands; execution rechecks the active tab and availability. See the [current protocol](/design/protocol/).

## No backend in the critical path

The MVP registry, bridge, providers, and command execution remain local. Future services could improve synchronization, adapter distribution, signatures, metadata, or health monitoring, but must not become required for the launcher to function.

See [capabilities and context](/design/capabilities/) and [trust boundaries](/design/security/).


## Local unpacked-extension scope

The initial deliverable is local dogfooding with unpacked extensions. The UI delivers actions and can close after navigation or focus changes. Results are optional; returned errors are shown while the launcher remains present.

The service worker is an event-driven broker for toolbar injection, browser APIs, and cross-extension requests. Registries remain provider-owned. Only the launcher tab ID is saved in session storage for dismissal; there is no worker-held capability registry to keep alive.

The injected UI uses `activeTab` plus `scripting`, avoiding automatic access to every website. Browser internal and protected pages may block injection. Store packaging and generalized production enrollment are deferred beyond this local slice.
