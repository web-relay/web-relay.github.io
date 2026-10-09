---
title: Integration paths
description: How PWAs, extensions, browser commands, WebMCP, and legacy sites could expose capabilities.
---

The working showcase includes a local notes PWA through `@web-relay/sdk`, an independent GitHub.com provider extension through the shared protocol, built-in browser actions, and a separately built LLM provider using `@web-relay/sdk/extension`. Follow the [showcase guide](/project/showcase/) to try them.

Different providers feed one internal model. Explicit app integrations should take priority over DOM-based automation.

## 1. PWA SDK — preferred path

A self-developed app registers its own actions through the proposed core SDK. The bridge makes them discoverable by the extension, while the optional local UI provides a fallback.

The target is a small integration: register the app’s existing functions and publish relevant context. SDK 0.1.4 is published on npm and also supports a standalone development tarball with JavaScript and declarations. Follow the [PWA integration guide](/guides/pwa/) to install and pair it.

## 2. Native WebMCP — standards adapter

The launcher now has an opt-in native WebMCP adapter for top-level page tools, JSON arguments, schema review, and page-owned execution. Saved site registrations expose tools globally and reopen the owning page when needed. Existing WebMCP sites need no additional SDK. Follow the [WebMCP preview guide](/guides/webmcp/). Exposing SDK capabilities through WebMCP remains proposed.

WebMCP is treated as an evolving integration target. Actual browser support, discovery, API semantics, and permission behavior must be verified during implementation. Web Relay’s model should remain independent of the standard.

## 3. Browser extension provider

A workspace manager could expose “Open AI workspace,” “Restore coding workspace,” and “Save current workspace” using a provider SDK and cross-extension messaging.

The first implementation uses a GitHub navigation extension rather than a workspace manager. Fixed manifest public keys stabilize both development IDs; the provider accepts discovery and execution only from the paired launcher. Broader provider registration remains future work. See the [protocol](/design/protocol/).

## 4. Legacy site adapters — selective fallback

An adapter may inspect a known site’s URL, DOM, page state, storage, or events to synthesize capabilities. This is appropriate when an integration has meaningful value, the target is stable, and its maintenance cost is acceptable.

DOM assumptions should be testable. Site changes can break adapters, so they should not become the default integration strategy.

## 5. Browser-native commands

The launcher can supply actions such as copying the current URL, switching tabs, opening downloads, managing tab groups, or closing the active tab, subject to browser permissions and API support.

## MVP versus follow-on work

The first milestone includes PWA integration, one extension provider, and browser-native commands. An opt-in WebMCP preview adapter now extends that core workflow. Legacy adapters remain a proposed follow-on path.

## Independent LLM provider

The separate `llm-provider-extension` folder uses the extension SDK to register ChatGPT and Gemini actions. Its ChatGPT action copies a prompt containing the source URL and opens ChatGPT for user paste/send. Automatic composer filling was unreliable, and no supported prompt deep link has been verified. Its Gemini action still uses an app-specific content script to start a fresh chat and submit once. If login or changed Gemini controls prevent sending, the destination panel retains the prompt for manual use. Source page contents are not extracted.

The development build consumes the standalone SDK tarball produced by the sibling checkout; the installed extension has no filesystem dependency. Fixed manifest public keys and an explicit paired provider ID keep discovery reproducible. Additional extension pairing is available through launcher settings; development launcher 0.0.3 adds PWA settings pairing with optional host approval and origin/path routing. See [extension integration](/guides/extensions/) and [PWA integration](/guides/pwa/). See [installation and validation](/project/showcase/#separate-llm-provider).
