// ============================================================
// HOTTDROP - Backend Server
// Powered by HD2.ai
// Run with: npm install && node server.js
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// Serverless deployments do not need static middleware; Vercel handles static files natively.

// ============================================================
// ENDPOINT: POST /generate-release
// Input: artist_name, track_name, style
// Output: track description, NFT description, 3 social captions
// ============================================================
app.post("/generate-release", (req, res) => {
  const { artist_name, track_name, style } = req.body;

  if (!artist_name || !track_name || !style) {
    return res.status(400).json({ error: "Missing required fields: artist_name, track_name, style" });
  }

  const styleDescriptors = {
    dubstep:    ["bass-heavy", "glitchy", "cinematic sub-bass", "aggressive wobble", "sonic warfare"],
    reggae:     ["conscious roots", "irie vibrations", "cultural resistance", "rolling bass lines", "spiritual energy"],
    dancehall:  ["high-energy riddim", "bashment vibes", "lyrical fire", "digital dancehall", "dutty steppers"],
    dnb:        ["170bpm precision", "Amen break science", "liquid rollers", "neuro-charged", "jungle pressure"],
    jungle:     ["breakbeat science", "chopped amen", "ragga sampling", "hardcore continuum", "rave heritage"],
    hiphop:     ["lyrical depth", "hard-hitting 808s", "sample-flip artistry", "street authenticity", "wordsmith fire"],
  };

  const styleKey = style.toLowerCase().replace(/[^a-z]/g, "");
  const descriptors = styleDescriptors[styleKey] || ["boundary-pushing", "experimental", "genre-defying", "raw", "authentic"];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const trackDescription = `"${track_name}" by ${artist_name} is a ${pick(descriptors)}, ${pick(descriptors)} ${style} track that refuses to be confined. ` +
    `Built from the ground up with ${pick(descriptors)} production, this release marks a pivotal moment in ${artist_name}'s sonic evolution. ` +
    `Every element — from the opening bar to the final drop — has been engineered to leave an imprint on the listener.`;

  const nftDescription = `Limited edition NFT release from ${artist_name}. "${track_name}" is minted as a ${style.toUpperCase()} collectible on the Hottdrop platform. ` +
    `Holders receive: unlockable stems, exclusive remix rights, DAO governance tokens, and lifetime royalty participation. ` +
    `Only the first adopters shape the legacy. Powered by HD2.ai smart contract infrastructure.`;

  const captions = [
    `🔥 NEW DROP: "${track_name}" by @${artist_name.replace(/\s/g, "")} just landed on Hottdrop. ${style.toUpperCase()} heat. Mint yours before they're gone. #Hottdrop #Web3Music #NFT`,
    `Artists own their work. Fans own a piece of the culture. "${track_name}" — ${artist_name} × Hottdrop. Limited edition ${style} NFT — live now. 🎵 #${style.replace(/\s/g, "")} #HD2ai`,
    `The future of music is on-chain. ${artist_name} drops "${track_name}" exclusively on @Hottdrop. ${style} never sounded this free. Collect. Support. Own. 💎 #Web3 #MusicNFT`,
  ];

  return res.json({
    success: true,
    data: {
      artist_name,
      track_name,
      style,
      track_description: trackDescription,
      nft_description: nftDescription,
      social_captions: captions,
      generated_at: new Date().toISOString(),
      powered_by: "HD2.ai",
    },
  });
});

// ============================================================
// ENDPOINT: POST /artist-onboard
// Input: name, email, style, links
// Output: score (0-100), decision, message
// ============================================================
app.post("/artist-onboard", (req, res) => {
  const { name, email, style, links, bio } = req.body;

  if (!name || !email || !style) {
    return res.status(400).json({ error: "Missing required fields: name, email, style" });
  }

  // Scoring logic — simulated AI evaluation
  let score = 50; // base score

  // Email quality check
  if (email.includes("@") && email.includes(".")) score += 10;

  // Style check — preferred genres get a boost
  const preferredGenres = ["dubstep", "jungle", "dnb", "reggae", "dancehall", "hip-hop", "hiphop"];
  if (preferredGenres.some((g) => style.toLowerCase().includes(g))) score += 15;

  // Bio/links presence
  if (bio && bio.length > 50) score += 10;
  if (links) {
    const linkCount = links.split(/[\s,\n]+/).filter((l) => l.startsWith("http")).length;
    score += Math.min(linkCount * 5, 15); // up to 15 points for links
  }

  // Add some realistic variance
  score += Math.floor(Math.random() * 10) - 3;
  score = Math.min(100, Math.max(0, score));

  // Decision logic
  let decision, message, badge;
  if (score >= 75) {
    decision = "ACCEPT";
    badge = "FOUNDING_ARTIST";
    message = `Welcome to the family, ${name}. Your profile scores strongly — you're a perfect fit for the Hottdrop ecosystem. ` +
      `We're placing you in our Founding Artist cohort (limited to 50 artists). ` +
      `Expect a call from the HD2.ai team within 48 hours to begin your onboarding.`;
  } else if (score >= 50) {
    decision = "REVIEW";
    badge = "GENRE_PIONEER";
    message = `Thanks for applying, ${name}. Your application is solid and has gone to manual review. ` +
      `To strengthen your position, add links to your music (SoundCloud, Spotify, Bandcamp) and a fuller bio. ` +
      `Our team reviews applications within 3-5 working days. Watch your inbox.`;
  } else {
    decision = "RESUBMIT";
    badge = null;
    message = `Thanks for applying, ${name}. We'd love to see more from you before moving forward. ` +
      `Please add music links, a full bio, and social profiles, then resubmit. ` +
      `We evaluate every artist fairly — the more we know about your work, the better.`;
  }

  return res.json({
    success: true,
    data: {
      name,
      email,
      style,
      score,
      decision,
      badge,
      message,
      ref_id: `HD2-${Date.now().toString(36).toUpperCase()}`,
      submitted_at: new Date().toISOString(),
      powered_by: "HD2.ai",
    },
  });
});

// ============================================================
// ENDPOINT: POST /create-drop
// Input: artist_name, track_name, edition_size, price_eth
// Output: simulated mint with tx hash + metadata
// ============================================================
app.post("/create-drop", (req, res) => {
  const { artist_name, track_name, edition_size, price_eth, wallet_address } = req.body;

  if (!artist_name || !track_name) {
    return res.status(400).json({ error: "Missing required fields: artist_name, track_name" });
  }

  const editions = parseInt(edition_size) || 100;
  const price = parseFloat(price_eth) || 0.05;

  // Generate realistic-looking fake transaction hash and token ID
  const txHash = "0x" + crypto.randomBytes(32).toString("hex");
  const contractAddress = "0x" + crypto.randomBytes(20).toString("hex");
  const tokenId = Math.floor(Math.random() * 9000) + 1000;
  const ipfsCid = "Qm" + crypto.randomBytes(23).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 44);

  const metadata = {
    name: `${track_name} — ${artist_name} #${tokenId}`,
    description: `Limited edition NFT by ${artist_name}. Part of the Hottdrop Genesis collection. Powered by HD2.ai.`,
    image: `ipfs://${ipfsCid}/cover.jpg`,
    animation_url: `ipfs://${ipfsCid}/track.mp3`,
    external_url: `https://hottdrop.io/token/${tokenId}`,
    attributes: [
      { trait_type: "Artist", value: artist_name },
      { trait_type: "Track", value: track_name },
      { trait_type: "Edition", value: `${tokenId} of ${editions}` },
      { trait_type: "Platform", value: "Hottdrop" },
      { trait_type: "Powered By", value: "HD2.ai" },
      { trait_type: "Royalty", value: "15%" },
      { trait_type: "DAO Governance", value: "Enabled" },
    ],
  };

  return res.json({
    success: true,
    data: {
      status: "MINTED",
      tx_hash: txHash,
      contract_address: contractAddress,
      token_id: tokenId,
      network: "Polygon Mainnet (simulated)",
      block_number: Math.floor(Math.random() * 1000000) + 50000000,
      gas_used: Math.floor(Math.random() * 50000) + 80000,
      minter: wallet_address || "0x0000000000000000000000000000000000000000",
      edition_size: editions,
      price_eth: price,
      royalty_percent: 15,
      ipfs_metadata: `ipfs://${ipfsCid}/metadata.json`,
      opensea_url: `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`,
      metadata,
      minted_at: new Date().toISOString(),
      powered_by: "HD2.ai",
    },
  });
});

// ============================================================
// LLM HELPER — shared by all agents
// Supports OpenAI and Gemini. Falls back gracefully.
// Set OPENAI_API_KEY or GEMINI_API_KEY in .env
// ============================================================
require("dotenv").config();
const https = require("https");

async function callLLM(systemPrompt, userPrompt) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
      });
      const req = https.request(
        { hostname: "api.openai.com", path: "/v1/chat/completions", method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}`, "Content-Length": Buffer.byteLength(body) } },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try { resolve(JSON.parse(data).choices[0].message.content.trim()); }
            catch { reject(new Error("OpenAI parse error")); }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  if (geminiKey) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.8 },
      });
      const path = `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const req = https.request(
        { hostname: "generativelanguage.googleapis.com", path, method: "POST",
          headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try { resolve(JSON.parse(data).candidates[0].content.parts[0].text.trim()); }
            catch { reject(new Error("Gemini parse error")); }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  return null; // No key — caller falls back to template logic
}

// ============================================================
// ENDPOINT: POST /dao-agent
// Summarises a DAO proposal and generates community messaging
// ============================================================
app.post("/dao-agent", async (req, res) => {
  const { proposal_text, dao_name } = req.body;
  if (!proposal_text) return res.status(400).json({ error: "Missing proposal_text" });

  const dao = dao_name || "Hottdrop DAO";
  let summary, recommendation, announcement;

  const llmResult = await callLLM(
    `You are the AI agent for ${dao}, a Web3 music DAO on Hottdrop. You help members understand proposals clearly and vote with confidence.`,
    `Summarise this proposal in exactly 3 bullet points (each max 15 words), give a one-sentence recommendation (for/against/neutral + reason), and write a 2-sentence Discord announcement. Proposal: "${proposal_text}"\n\nRespond as valid JSON: { "bullets": ["...","...","..."], "recommendation": "...", "announcement": "..." }`
  ).catch(() => null);

  if (llmResult) {
    try {
      const parsed = JSON.parse(llmResult.replace(/```json|```/g, "").trim());
      summary = parsed.bullets;
      recommendation = parsed.recommendation;
      announcement = parsed.announcement;
    } catch {
      // LLM returned not-JSON — use fallback
    }
  }

  // Fallback
  if (!summary) {
    const words = proposal_text.split(" ").slice(0, 6).join(" ");
    summary = [
      `Proposal: ${words}...`,
      `Affects ${dao} treasury and governance rights`,
      `Requires majority vote by token holders`,
    ];
    recommendation = "Review carefully — impact on community treasury requires full member discussion.";
    announcement = `📋 New proposal live in ${dao}: "${words}..." — cast your vote now. All $HOTT holders can participate. Powered by HD2.ai.`;
  }

  return res.json({
    success: true,
    data: {
      dao_name: dao,
      proposal_summary: summary,
      recommendation,
      community_announcement: announcement,
      proposal_id: `PROP-${Date.now().toString(36).toUpperCase()}`,
      generated_at: new Date().toISOString(),
      powered_by: "HD2.ai",
    },
  });
});

// ============================================================
// ENDPOINT: POST /revenue-agent
// Tracks royalties and generates a distribution report
// ============================================================
app.post("/revenue-agent", async (req, res) => {
  const { wallet_address, artist_name, royalty_percent } = req.body;
  if (!wallet_address) return res.status(400).json({ error: "Missing wallet_address" });

  const royalty = parseFloat(royalty_percent) || 15;
  const artist = artist_name || "Artist";

  // Simulated on-chain earnings data (replace with Alchemy/Moralis in phase 2)
  const primarySales  = parseFloat((Math.random() * 4 + 0.5).toFixed(4));
  const secondarySales = parseFloat((Math.random() * 1.5 + 0.1).toFixed(4));
  const royaltyEarned = parseFloat(((secondarySales * royalty) / 100).toFixed(4));
  const totalEarned   = parseFloat((primarySales * 0.85 + royaltyEarned).toFixed(4));
  const pendingPayout = parseFloat((totalEarned * 0.3).toFixed(4));

  let reportSummary;
  const llmResult = await callLLM(
    `You are the Revenue Agent for Hottdrop, a Web3 music label. You write clear, encouraging royalty reports for artists.`,
    `Write a 2-sentence royalty report summary for artist "${artist}". They earned ${totalEarned} ETH total (${primarySales} ETH primary sales, ${royaltyEarned} ETH royalties). Keep it punchy and positive. No markdown.`
  ).catch(() => null);

  reportSummary = llmResult || `${artist} has earned ${totalEarned} ETH across primary sales and on-chain royalties this period. ${pendingPayout} ETH is pending distribution to your wallet — powered by HD2.ai smart contracts.`;

  return res.json({
    success: true,
    data: {
      wallet: wallet_address,
      artist: artist,
      period: "Last 30 days",
      earnings: {
        primary_sales_eth: primarySales,
        secondary_royalties_eth: royaltyEarned,
        platform_share_eth: parseFloat((primarySales * 0.15).toFixed(4)),
        artist_total_eth: totalEarned,
      },
      pending_payout_eth: pendingPayout,
      royalty_rate: `${royalty}%`,
      next_distribution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      report_summary: reportSummary,
      powered_by: "HD2.ai",
    },
  });
});

// ============================================================
// ENDPOINT: POST /generate-artwork
// Generates cover art via Replicate (Flux) or returns prompt metadata
// Set REPLICATE_API_TOKEN in .env to activate real generation
// ============================================================
app.post("/generate-artwork", async (req, res) => {
  const { style, mood, palette, track_name, artist_name, ai_assist } = req.body;
  if (!style || !mood) return res.status(400).json({ error: "Missing style or mood" });

  const track = track_name || "Untitled";
  const artist = artist_name || "Artist";
  const isAI = ai_assist !== false; // default true for this endpoint

  // Build the image generation prompt
  const promptParts = [
    `Album cover art for "${track}" by ${artist}`,
    `Style: ${style}`,
    `Mood: ${mood}`,
    palette ? `Colour palette: ${palette}` : null,
    "High resolution, no text, no words, professional music artwork",
    "Ultra detailed, cinematic lighting",
  ].filter(Boolean);
  const imagePrompt = promptParts.join(". ");

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  let imageUrl = null;
  let generationStatus = "FALLBACK";

  if (replicateToken) {
    try {
      // Kick off Replicate prediction (black-forest-labs/flux-schnell)
      const startBody = JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: { prompt: imagePrompt, aspect_ratio: "1:1", output_quality: 90 },
      });
      const prediction = await new Promise((resolve, reject) => {
        const req2 = https.request(
          { hostname: "api.replicate.com", path: "/v1/models/black-forest-labs/flux-schnell/predictions",
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Token ${replicateToken}`, "Content-Length": Buffer.byteLength(startBody) } },
          (r) => { let d = ""; r.on("data", c => d += c); r.on("end", () => { try { resolve(JSON.parse(d)); } catch { reject(new Error("Replicate parse error")); } }); }
        );
        req2.on("error", reject); req2.write(startBody); req2.end();
      });

      // Poll for result (max 30s)
      const pollUrl = `/v1/predictions/${prediction.id}`;
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const poll = await new Promise((resolve, reject) => {
          const r = https.request(
            { hostname: "api.replicate.com", path: pollUrl, method: "GET",
              headers: { Authorization: `Token ${replicateToken}` } },
            (res2) => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => { try { resolve(JSON.parse(d)); } catch { reject(); } }); }
          );
          r.on("error", reject); r.end();
        });
        if (poll.status === "succeeded") { imageUrl = poll.output?.[0] || poll.output; generationStatus = "GENERATED"; break; }
        if (poll.status === "failed") break;
      }
    } catch (e) {
      console.error("Replicate error:", e.message);
    }
  }

  return res.json({
    success: true,
    data: {
      image_url: imageUrl,
      generation_status: generationStatus,
      prompt_used: imagePrompt,
      style, mood, palette: palette || null,
      track_name: track,
      artist_name: artist,
      ai_label: isAI ? "AI ASSISTED" : "HUMAN UPLOAD",
      nft_attribute: isAI ? { trait_type: "Artwork", value: "AI Assisted" } : { trait_type: "Artwork", value: "Human Made" },
      generated_at: new Date().toISOString(),
      powered_by: "HD2.ai",
    },
  });
});

// Export the app for Vercel
module.exports = app;

// Local development fallback
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`  Server running locally at: http://localhost:${PORT}`);
    console.log(`  Powered by HD2.ai`);
  });
}

