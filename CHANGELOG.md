# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-02

### Added
- **Google Antigravity OAuth Provider**: Complete PKCE browser flow with local loopback callback (`localhost:51121`) and headless paste-URL support.
- **Gemini 3.8 Flash Day-One Support**: Support for `gemini-3.8-flash` with dynamic effort-tier routing (`-low`, `-medium`, `-high`), 65,536 max output token limits, and fallback chain.
- **Prompt Cache Affinity & Trajectory Chaining**:
  - Deterministic 63-bit session IDs derived from initial turn content to preserve KV-cache cluster routing.
  - Trajectory state tracking (`agentId`, `trajectoryId`, `stepIndex`).
  - Response ID chaining via `labels.last_execution_id` from SSE responses.
  - Endpoint stickiness (`lastGoodEndpoint`) across Cloud Code Assist cluster endpoints.
  - Cross-process session state persistence in `.pi/agent/cache/antigravity-sessions.json` to retain affinity across Pi restarts.
- **Image Generation**: Built-in `generate_image` tool and `/antigravity.image` command powered by Google's image models with aspect-ratio validation and directory containment.
- **Slash Commands**:
  - `/antigravity.usage` for session token statistics and cache metrics.
  - `/antigravity.models` for model catalog discovery.
  - `/antigravity.doctor` for connection health and token validation.
- **Test Suite**: 42 unit tests covering catalog routing, fallbacks, thinking, message conversion, security, session affinity, and cross-process restart persistence.
