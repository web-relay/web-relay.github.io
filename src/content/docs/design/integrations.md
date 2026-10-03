---
title: Integration paths
description: How PWAs, extensions, browser commands, WebMCP, and legacy sites could expose capabilities.
---

The working showcase includes a local notes PWA through `@web-relay/sdk`, an independent GitHub.com provider extension through the shared protocol, built-in browser actions, and a separately built LLM provider using `@web-relay/sdk/extension`. Follow the [showcase guide](/project/showcase/) to try them.

Different providers feed one internal model. Explicit app integrations should take priority over DOM-based automation.

## 1. PWA SDK — preferred path

A self-developed app registers its own actions through the proposed core SDK. The bridge makes them discoverable by the extension, while the optional local UI provides a fallback.

The target is a small integration: register the app’s existing functions and publish relevant context. The private workspace SDK is implemented for the demo. There is no released package to install yet.

## 2. Native WebMCP — standards adapter

The design proposes translating WebMCP tools into internal capabilities and optionally exposing registered capabilities through WebMCP.

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

The first milestone includes PWA integration, one extension provider, and browser-native commands. WebMCP and legacy adapters are documented design paths to explore after that core workflow is proven.

## Independent LLM provider

The separate `llm-provider-extension` folder uses the extension SDK to register ChatGPT and Gemini actions. It opens a fresh destination tab and sends one message with the source URL as context. It uses app-specific content scripts rather than an undocumented prompt URL. If login or changed controls prevent sending, the destination panel retains the prompt for manual use. Source page contents are not extracted.

The development build bundles shared SDK source from the sibling checkout; the installed extension has no filesystem dependency. Fixed manifest public keys and an explicit paired provider ID keep discovery reproducible. Published SDK packages and generic enrollment remain future work. See [installation and validation](/project/showcase/#separate-llm-provider).
