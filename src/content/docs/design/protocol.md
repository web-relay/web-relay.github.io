---
title: Discovery and invocation contract
description: The implemented version 1 development protocol and its trust and lifecycle boundaries.
---

The showcase uses a small, JSON-only protocol shared by the launcher, PWA bridge, GitHub provider, and separate LLM provider. It supports **discovery**, **execution without arguments**, and **bounded text input** for question actions. Extension enrollment and development launcher 0.0.3 PWA enrollment are available through settings; broader schemas remain deferred. See the [SDK integration guides](/guides/sdk/).

## Provider-owned registries

Each provider retains its functions and live context. Discovery returns descriptors containing `id`, `title`, optional `description` and `input: "text"`, `providerId`, and `providerKind`. The launcher combines these descriptors and routes an invocation to its owner.

Default providers are `demo-notes` (`pwa`), `github` and `llm` (`extension`), and `browser` and `tabs` (`browser`). Additional extension pairings are approved in settings and saved locally. Bundled defaults and PWA origins remain in `apps/launcher-extension/src/providers.ts`. Capability IDs are unique within a provider; routing uses provider identity and capability ID together.

## Requests

```json
{
  "channel": "web-relay",
  "version": 1,
  "requestId": "a-unique-request-id",
  "type": "discover",
  "context": {
    "tabId": 42,
    "url": "https://github.com/web-relay/web-relay"
  }
}
```

An execution request uses `"type": "execute"` and adds `"capabilityId": "github.repo-issues"`. A text-input execution request also includes `"input": "your question"`, limited to 2000 characters. The registry requires nonblank text for a text-input capability and rejects arguments for no-input capabilities. The caller generates a fresh request ID. Unsupported versions and malformed messages are ignored by provider listeners and rejected by the caller if they do not produce a valid correlated response.

PWA requests can include `providerId`. SDK 0.1.4 ignores requests addressed to another mounted provider; unaddressed requests remain compatible. The launcher addresses discovery and execution to the paired provider after checking its exact origin and path.

Tab context is optional. The GitHub provider receives it only for GitHub.com tabs; its global project-navigation action needs no repository context. The LLM provider receives HTTP(S) source-tab context and uses its URL as the first message context for a new chat. PWA application context remains local and is supplied by the SDK registry’s context callback.

## Provider identity for pairing

SDK 0.1.3 accepts a context-free `"type": "describe"` request and replies with `{ "providerId": "workspaces", "name": "Saved workspaces", "protocolVersion": 1 }` in the ordinary correlated success envelope. It validates the paired launcher sender first, then answers without registration or actions. Names are provider-reported rather than verified browser/store names. Published PWA SDK 0.1.3 rejects describe; PWA SDK 0.1.4 responds with the same identity, and supports optional providerId addressing. Older PWAs pair through validated nonempty discovery.

The settings page checks connectivity, reviews identity, and explicitly approves a short-lived proposal bound to that settings document. Approval rechecks identity before storing the pairing. Older extension providers may ignore `describe`; the launcher can fall back to validated nonempty discovery. It cannot infer an older provider's identity from an empty command list. Disabled/removed providers cannot route future invocations. Current-tab context is only sent to additional providers when the user approves URL sharing.

## Responses

```json
{
  "channel": "web-relay",
  "version": 1,
  "requestId": "a-unique-request-id",
  "type": "result",
  "ok": true,
  "data": { "message": "Navigated to the repository page." }
}
```

Discovery uses the same success envelope with a descriptor array as `data`. Failure responses use `"ok": false` and an `error` object with `code` and `message`.

An action function may return nothing; the registry normalizes this to a successful `null` result. If an execution transport resolves without a reply, the launcher reports “Action sent; no result returned.” This does not confirm completion. Discovery still requires a valid metadata response.

The caller validates version, response shape, matching request ID, JSON data, metadata, and provider identity. Duplicate descriptor IDs are rejected. Functions are never sent across a bridge.

## Transports

**PWA:** the launcher sends a request to the active tab’s top-frame content script. The content script relays it through `window.postMessage`, with `source: "web-relay:extension"`. The SDK replies using `source: "web-relay:pwa"`. Window source, exact origin, and request correlation are checked.

**Provider extensions:** the launcher uses `chrome.runtime.sendMessage` with the known provider extension ID. Each provider accepts requests only from the paired development launcher ID. The separate LLM provider uses `createExtensionProvider` from `@web-relay/sdk/extension` for validation, provider-owned registration, execution, and response envelopes.

**Browser:** built-in commands use the local registry. Clipboard results are copied by the foreground UI. The LLM provider’s ChatGPT action returns a clipboard prompt and destination. The UI copies it before asking the broker to open the allowlisted destination. The user pastes and sends it. Gemini submission remains inside the provider. Tabs use a local registry populated from the current window; execution rechecks that the selected tab still exists in that window.

**Injected UI:** a toolbar action or shortcut grants `activeTab` access. The broker injects an isolated content script that mounts the launcher in a Shadow DOM. Internal panel messages require this extension’s own top-frame sender and bind execution to its tab and URL. Real user activation is required for UI action clicks and keyboard execution; page-generated clicks are ignored.

## Discovery lifecycle

The launcher discovers capabilities when opened or refreshed and after executing an action. It does not persist capability lists across service-worker suspension. Provider enablement preferences are persisted separately.

Active-app commands appear before global browser commands. Search requires every query word to match a substring across title, description, or provider ID. Provider-scoped navigation and fuzzy ranking remain proposals. Source statuses identify connected, unavailable, and disabled providers.

An already-open launcher does not receive pushed app-state updates. A manual refresh picks up changes; execution always rechecks availability, even if the visible list is old.

## Before execution

1. Verify the active tab ID and URL still match the discovered snapshot.
2. Discover again and check that the selected provider and capability are still enabled and available.
3. Recheck tab context before routing the invocation.
4. Let the owning registry evaluate `when` again against live context before calling the action.

GitHub navigation requests also check the live tab inside the provider extension. Its repository capabilities derive context from the URL, not DOM selectors. Generic browser actions and GitHub’s global project navigation do not require a repository.

## Failures and limits

Errors include unavailable commands, stale context, invalid responses, disconnected providers, and timeouts. Provider calls have a three-second outer timeout; the page relay responds with a timeout after 2.5 seconds if the SDK does not reply.

**A timeout does not cancel an action.** The UI does not automatically retry an invocation. Check the application before retrying, because execution may already have completed.

The UI may close after dispatch; actions do not need to return a result. Returned errors are displayed while it remains open. Errors refreshing commands after delivery are kept separate from execution errors.

This version does not provide general input schemas, cancellation, retries, idempotency guarantees, automatic enrollment, or workflow chaining. Development allowlists and fixed manifest keys are explicit prototype decisions, not a production onboarding system.
