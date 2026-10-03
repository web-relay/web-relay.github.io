---
title: Discovery and invocation contract
description: The implemented version 1 development protocol and its trust and lifecycle boundaries.
---

The showcase uses a small, JSON-only protocol shared by the launcher, PWA bridge, and GitHub provider. It supports **discovery** and **execution of actions without input arguments**. Broader schemas and generic provider enrollment remain deferred.

## Provider-owned registries

Each provider retains its functions and live context. Discovery returns descriptors containing `id`, `title`, optional `description`, `providerId`, and `providerKind`. The launcher combines these descriptors and routes an invocation to its owner.

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

An execution request uses `"type": "execute"` and adds `"capabilityId": "github.repo-issues"`. The caller generates a fresh request ID. Unsupported versions and malformed messages are ignored by provider listeners and rejected by the caller if they do not produce a valid correlated response.

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

The caller validates version, response shape, matching request ID, JSON data, metadata, and provider identity. Duplicate descriptor IDs are rejected. Functions are never sent across a bridge.

## Transports

**PWA:** the launcher sends a request to the active tab’s top-frame content script. The content script relays it through `window.postMessage`, with `source: "web-relay:extension"`. The SDK replies using `source: "web-relay:pwa"`. Window source, exact origin, and request correlation are checked.

**GitHub extension:** the launcher uses `chrome.runtime.sendMessage` with the known provider extension ID. The provider accepts requests only from the paired development launcher ID.

**Browser:** built-in commands use the local registry. Clipboard execution returns the URL to the popup, which writes it using its clipboard permission.

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

This version does not provide input schemas, cancellation, retries, idempotency guarantees, dynamic extension enrollment, or workflow chaining. Development allowlists and fixed manifest keys are explicit prototype decisions, not a production onboarding system.
