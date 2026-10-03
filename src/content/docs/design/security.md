---
title: Trust and permissions
description: Security principles and unresolved protocol requirements for browser capabilities.
---

A capability can modify application data, close tabs, or trigger workflows. The runtime must preserve browser security boundaries while making actions discoverable.

:::note[Intent, not a security guarantee]
The development showcase implements the controls below, but has not undergone a security review. Broader production trust and permission flows remain requirements.
:::

## Current development controls

- The PWA bridge checks same-window source and exact origin, and only runs in the top frame at `http://localhost:4173` or `http://127.0.0.1:4173`.
- The launcher targets bundled GitHub/LLM defaults plus extension IDs explicitly approved in its Options page and saved locally. Settings checks connectivity and rechecks identity at approval; provider names are self-reported. Only the extension settings document can change pairings. Additional providers receive no tab context unless URL sharing is approved. Each provider allows only the paired launcher ID through `externally_connectable` and a sender check.
- The injected UI’s privileged messages require this extension’s own top-frame sender, bound to its tab and URL. The extension’s own diagnostic document is also permitted. Page-bridge messages cannot invoke the panel API, and synthetic page clicks do not execute UI actions.
- Wire requests and responses validate protocol version, request correlation, JSON shape, capability IDs, and provider identity.
- Active tab ID and URL are rechecked before invocation; app availability is rechecked in the owning registry.
- Disabling the GitHub provider prevents both listing and execution. Preferences survive service-worker restarts through extension storage.
- The GitHub provider performs navigation only. It does not download executable adapters, inspect GitHub DOM selectors, use an API token, or perform account writes.

Manifest public keys stabilize unpacked extension IDs. They are development pairing identities, not protection against a person who controls and modifies the unpacked source. Code running in the trusted PWA origin is part of the same trust boundary.

The launcher requests `activeTab` and `scripting` to inject the UI after a user action, plus `tabs`, `storage`, `clipboardWrite`, and local-host access. It does not request automatic access to all websites. AI commands belong to the separate LLM provider. Its ChatGPT action returns a clipboard prompt and an allowlisted destination for the launcher to open after copying; no ChatGPT host access is requested. The provider requests access only to `https://gemini.google.com/*` to fill and submit one message in a provider-created tab. It claims a matching, expiring handoff through its own extension worker and does not act in ordinary chat tabs. A destination panel preserves the prompt if sending fails. The GitHub provider requests access to `https://github.com/*`. Local host match patterns cover more ports than the script allows; the bridge checks the exact origin before installing its listener. Incremental production permission onboarding is not implemented yet.

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
