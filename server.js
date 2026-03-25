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

// Serve all static files (HTML, CSS, JS, images) from /public
app.use(express.static(path.join(__dirname, "public")));
// Serve the root index.html
app.use(express.static(__dirname));

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
// CATCH-ALL: serve index.html for any unknown route
// ============================================================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log("");
  console.log("  ██╗  ██╗ ██████╗ ████████╗████████╗██████╗ ██████╗  ██████╗ ██████╗ ");
  console.log("  ██║  ██║██╔═══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗");
  console.log("  ███████║██║   ██║   ██║      ██║   ██║  ██║██████╔╝██║   ██║██████╔╝");
  console.log("  ██╔══██║██║   ██║   ██║      ██║   ██║  ██║██╔══██╗██║   ██║██╔═══╝ ");
  console.log("  ██║  ██║╚██████╔╝   ██║      ██║   ██████╔╝██║  ██║╚██████╔╝██║     ");
  console.log("  ╚═╝  ╚═╝ ╚═════╝    ╚═╝      ╚═╝   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ");
  console.log("");
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Powered by HD2.ai`);
  console.log(`  Press Ctrl+C to stop`);
  console.log("");
});
