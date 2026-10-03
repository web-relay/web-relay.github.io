---
title: Discovery and invocation contract
description: The implemented version 1 development protocol and its trust and lifecycle boundaries.
---

The showcase uses a small, JSON-only protocol shared by the launcher, PWA bridge, and GitHub provider. It supports **discovery**, **execution without arguments**, and **bounded text input** for question actions. Broader schemas and generic provider enrollment remain deferred.

## Provider-owned registries

Each provider retains its functions and live context. Discovery returns descriptors containing `id`, `title`, optional `description` and `input: "text"`, `providerId`, and `providerKind`. The launcher combines these descriptors and routes an invocation to its owner.

The current providers are `demo-notes` (`pwa`), `github` (`extension`), and `browser` (`browser`). Capability IDs are unique within a provider; routing uses provider identity and capability ID together.

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

Tab context is optional. The GitHub provider receives it only for GitHub.com tabs; its global project-navigation action needs no repository context. PWA application context remains local and is supplied by the SDK registry’s context callback.

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

**GitHub extension:** the launcher uses `chrome.runtime.sendMessage` with the known provider extension ID. The provider accepts requests only from the paired development launcher ID.

**Browser:** built-in commands use the local registry. Clipboard results are copied by the foreground UI. AI handoffs copy the question or URL first, then ask the broker to open an allowlisted ChatGPT or Gemini destination. No prompt is automatically submitted.

**Injected UI:** a toolbar action or shortcut grants `activeTab` access. The broker injects an isolated content script that mounts the launcher in a Shadow DOM. Internal panel messages require this extension’s own top-frame sender and bind execution to its tab and URL. Real user activation is required for UI action clicks and keyboard execution; page-generated clicks are ignored.

## Discovery lifecycle

The launcher discovers capabilities when opened or refreshed and after executing an action. It does not persist capability lists across service-worker suspension. Provider enablement preferences are persisted separately.

Active-app commands appear before global browser commands. Search currently uses substring matching. Source statuses identify connected, unavailable, and disabled providers.

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

This version does not provide general input schemas, cancellation, retries, idempotency guarantees, dynamic extension enrollment, or workflow chaining. Development allowlists and fixed manifest keys are explicit prototype decisions, not a production onboarding system.
