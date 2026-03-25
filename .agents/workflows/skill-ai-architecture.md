---
name: Web3 AI Agent Architecture (Hottdrop Pattern)
description: Guidelines for building robust, fallback-ready AI agents within Web3 applications without relying on heavy external frameworks.
---

# Web3 AI Agent Architecture: The Hottdrop Pattern

This skill defines the architectural pattern used to build AI agents inside the Hottdrop application. It ensures a robust, production-ready system that falls back gracefully when API keys or upstream services are unavailable.

## 1. Core Principles

- **Zero Framework Dependency**: Build agents directly into the native backend (Express/Node.js) without heavy wrapper frameworks (like Langchain or AutoGen) unless strictly necessary. This keeps the codebase lean, atomic, and easy to debug.
- **Graceful Fallbacks**: Every AI endpoint must have a deterministic fallback path. If an API key is missing, or the LLM service timeouts/fails, the endpoint must still return a correctly structured mock response that allows the UI to render flawlessly.
- **Unified LLM Interface**: Route all LLM text requests through a single, shared helper function (e.g., `callLLM()`) that handles multiple providers (OpenAI, Gemini, etc.), environment variable checks, and error catching.
- **Human-in-the-Loop & Transparency**: AI generation should be explicitly labelled in Web3 applications, especially regarding artwork and NFT metadata. Provide clear `[AI ASSISTED]` vs `[HUMAN MADE]` data flags in the backend logic, and reflect these transparently in the frontend UI and on-chain metadata.

## 2. Implementation Pattern

### The `callLLM` Helper

Centralise the external API call logic. It should check for available keys, craft the correct payload format for the specific provider, and return raw text.

```javascript
async function callLLM(systemPrompt, userPrompt) {
  // 1. Check env vars for keys
  // 2. Format request for OpenAI, Gemini, etc.
  // 3. Try/catch block around the network request
  // 4. Return the parsed text, or null on failure/missing key
}
```

### The Agent Endpoint (The "Hottdrop Pattern")

Every agent endpoint follows a strict 3-step flow:

1. **Parse & Validate**: Collect input parameters and set defaults.
2. **Attempt AI Call**: Call the `callLLM()` helper or external media API (e.g., Replicate). Crucially, this must be wrapped in a `.catch(() => null)` or `try/catch` block so failures don't crash the request.
3. **Parse or Fallback, then Return**: Evaluate the AI response. If it's valid, parse it (e.g., from JSON) and use it. If it's null, missing, or malformed, use standard string interpolation and math to create a beautiful, deterministic fallback response.

```javascript
app.post("/my-agent", async (req, res) => {
  const { input_data } = req.body;

  // 1. Setup
  let output_1, output_2;

  // 2. Attempt LLM call
  const llmResult = await callLLM(systemPrompt, userPrompt).catch(() => null);

  if (llmResult) {
    try {
      const parsed = JSON.parse(llmResult);
      output_1 = parsed.val1;
      output_2 = parsed.val2;
    } catch {
      // JSON parse failed, let fallback handle it
    }
  }

  // 3. Fallback logic
  if (!output_1) {
    output_1 = `Mock response based on ${input_data}`;
    output_2 = `Static generic string`;
  }

  // Ensure JSON response contract is identical for both paths
  return res.json({ success: true, data: { output_1, output_2, status: llmResult ? "LIVE" : "FALLBACK" }});
});
```

## 3. The "Append-Only" Strategy for Iteration

When iterating on existing, working MVP codebases:
- Avoid deleting or aggressively refactoring existing files and templates.
- **Append** new helper functions and endpoints to the bottom of the files.
- Inject new UI tabs clearly segregated from old ones.
- This minimises regression risk and allows the user to easily review the exact lines added to power the new Agent features.

## 4. Web3 Specifics (Art & Metadata)

When an agent generates assets intended for on-chain minting:
- Include a boolean flag from the frontend (e.g., `ai_assist: true/false`).
- Map this flag directly into the NFT `attributes` array before IPFS upload or contract execution.
- Example: `{ trait_type: "Artwork Source", value: "AI Assisted" }`
