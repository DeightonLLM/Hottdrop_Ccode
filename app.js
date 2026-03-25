// ============================================================
// HOTTDROP — app.js
// Frontend logic: Web3 wallet, API calls, UI interactions
// Powered by HD2.ai
// ============================================================

// ---- Config ----
// If running with "node server.js", the API is on the same server.
// If deployed separately, change this to your server URL.
const API_BASE = window.location.origin;

// ---- State ----
let walletAddress = null;
let provider = null;
let signer = null;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Smooth scroll to a section by ID */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 72; // nav height
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/** Toggle mobile nav drawer */
function toggleMobileNav() {
  const drawer = document.getElementById("navMobile");
  drawer.classList.toggle("open");
}

/** Show a toast notification */
function showToast(message, type = "info", duration = 4000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/** Switch terminal tabs */
function switchTab(tabName, clickedBtn) {
  // Hide all panels
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  // Show selected
  document.getElementById(`tab-${tabName}`).classList.add("active");
  clickedBtn.classList.add("active");
}

/** Truncate wallet address for display */
function truncateAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/** Format JSON output for terminal display */
function formatTerminalOutput(data) {
  const lines = [];
  function walk(obj, indent = 0) {
    const pad = "  ".repeat(indent);
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        lines.push(`${pad}<span class="output-key">${k}</span>:`);
        v.forEach((item, i) => {
          if (typeof item === "object") {
            lines.push(`${pad}  [${i}]:`);
            walk(item, indent + 2);
          } else {
            lines.push(`${pad}  <span class="output-str">"${item}"</span>`);
          }
        });
      } else if (typeof v === "object" && v !== null) {
        lines.push(`${pad}<span class="output-key">${k}</span>:`);
        walk(v, indent + 1);
      } else if (typeof v === "number") {
        lines.push(`${pad}<span class="output-key">${k}</span>: <span class="output-val">${v}</span>`);
      } else if (typeof v === "boolean") {
        lines.push(`${pad}<span class="output-key">${k}</span>: <span class="output-val">${v}</span>`);
      } else {
        lines.push(`${pad}<span class="output-key">${k}</span>: <span class="output-str">"${v}"</span>`);
      }
    }
  }
  walk(data);
  return lines.join("\n");
}

// ============================================================
// NAV SCROLL BEHAVIOUR
// ============================================================
window.addEventListener("scroll", () => {
  const nav = document.getElementById("nav");
  if (window.scrollY > 30) {
    nav.style.borderBottomColor = "var(--border)";
  } else {
    nav.style.borderBottomColor = "var(--border)";
  }
});

// Close mobile nav on outside click
document.addEventListener("click", (e) => {
  const nav = document.getElementById("navMobile");
  const hamburger = document.getElementById("navHamburger");
  if (nav.classList.contains("open") && !nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove("open");
  }
});

// ============================================================
// WEB3 — WALLET CONNECTION
// Using ethers.js v6 loaded via CDN
// ============================================================

async function connectWallet() {
  const btn = document.getElementById("walletBtn");
  const label = document.getElementById("walletLabel");
  const labelMobile = document.getElementById("walletLabelMobile");

  // If already connected — disconnect
  if (walletAddress) {
    walletAddress = null;
    provider = null;
    signer = null;
    btn.classList.remove("connected");
    label.textContent = "CONNECT WALLET";
    if (labelMobile) labelMobile.textContent = "CONNECT WALLET";
    showToast("Wallet disconnected", "info");
    return;
  }

  // Check for MetaMask / injected provider
  if (!window.ethereum) {
    showToast("No Web3 wallet found. Please install MetaMask.", "error", 5000);
    window.open("https://metamask.io/download/", "_blank");
    return;
  }

  try {
    btn.textContent = "CONNECTING...";
    btn.disabled = true;

    // ethers v6 BrowserProvider
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    walletAddress = await signer.getAddress();

    // Update UI
    btn.classList.add("connected");
    label.innerHTML = `<span class="wallet-icon">◈</span> ${truncateAddress(walletAddress)}`;
    if (labelMobile) labelMobile.textContent = truncateAddress(walletAddress);

    const network = await provider.getNetwork();
    showToast(`Wallet connected: ${truncateAddress(walletAddress)} on ${network.name}`, "success");

    // Prefill wallet address into NFT drop form if visible
    const nftArtistInput = document.getElementById("nft-artist");
    if (nftArtistInput && !nftArtistInput.value) {
      // Leave for user to fill, just note the connection
    }

  } catch (err) {
    console.error("Wallet connection error:", err);
    const msg = err.code === 4001
      ? "Connection rejected by user."
      : "Failed to connect wallet. Please try again.";
    showToast(msg, "error");
  } finally {
    btn.disabled = false;
    // Restore button if connection failed
    if (!walletAddress) {
      label.innerHTML = `<span class="wallet-icon">◈</span> CONNECT WALLET`;
      if (labelMobile) labelMobile.textContent = "CONNECT WALLET";
    }
  }
}

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      walletAddress = null;
      document.getElementById("walletBtn").classList.remove("connected");
      document.getElementById("walletLabel").innerHTML = `<span class="wallet-icon">◈</span> CONNECT WALLET`;
      showToast("Wallet disconnected", "info");
    } else {
      walletAddress = accounts[0];
      document.getElementById("walletLabel").innerHTML = `<span class="wallet-icon">◈</span> ${truncateAddress(walletAddress)}`;
      showToast(`Switched to ${truncateAddress(walletAddress)}`, "info");
    }
  });
}

// ============================================================
// API CALL — GENERATE RELEASE PACK
// POST /generate-release
// ============================================================
async function generateRelease() {
  const artist = document.getElementById("rel-artist").value.trim();
  const track  = document.getElementById("rel-track").value.trim();
  const style  = document.getElementById("rel-style").value;

  if (!artist || !track || !style) {
    showToast("Please fill in all fields before generating.", "error");
    return;
  }

  const btn = document.querySelector("#tab-release .btn-terminal");
  const btnText = document.getElementById("rel-btn-text");
  const output = document.getElementById("release-output");

  // Set loading state
  btn.disabled = true;
  btnText.innerHTML = `<span class="spinner"></span> GENERATING...`;
  output.innerHTML = `<div class="output-placeholder"><span class="cursor-blink">_</span> Connecting to HD2.ai...</div>`;

  try {
    const res = await fetch(`${API_BASE}/generate-release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist_name: artist, track_name: track, style }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    const { data } = await res.json();

    // Build output HTML
    const html = `
<div style="margin-bottom:12px;">
  <span class="output-key">// RELEASE PACK GENERATED</span>
  <span style="color:var(--muted); font-size:11px; float:right;">${new Date().toLocaleTimeString()}</span>
</div>

<div style="margin-bottom:16px;">
  <div style="font-size:10px; letter-spacing:0.16em; color:var(--muted); margin-bottom:6px;">TRACK DESCRIPTION</div>
  <div style="color:var(--text); line-height:1.7; background:rgba(0,0,0,0.3); padding:12px; border-radius:4px; border-left:2px solid var(--cyan-dim);">
    ${data.track_description}
  </div>
</div>

<div style="margin-bottom:16px;">
  <div style="font-size:10px; letter-spacing:0.16em; color:var(--muted); margin-bottom:6px;">NFT DESCRIPTION</div>
  <div style="color:var(--text); line-height:1.7; background:rgba(0,0,0,0.3); padding:12px; border-radius:4px; border-left:2px solid var(--amber);">
    ${data.nft_description}
  </div>
</div>

<div style="margin-bottom:8px;">
  <div style="font-size:10px; letter-spacing:0.16em; color:var(--muted); margin-bottom:8px;">SOCIAL CAPTIONS (3)</div>
  ${data.social_captions.map((caption, i) => `
    <div class="output-caption">
      <span style="font-size:10px; color:var(--muted);">CAPTION ${i + 1}</span>
      <button class="copy-btn" onclick="copyText(this, \`${caption.replace(/`/g, "\\`")}\`)">COPY</button>
      <div style="margin-top:6px;">${caption}</div>
    </div>
  `).join("")}
</div>

<div style="font-size:10px; color:var(--muted); margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
  Powered by <a href="https://hd2.ai" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">HD2.ai</a> | Ref: ${Date.now().toString(36).toUpperCase()}
</div>
    `;

    output.innerHTML = html;
    showToast("Release pack generated!", "success");

  } catch (err) {
    console.error("Generate release error:", err);
    output.innerHTML = `<div class="output-err">ERROR: ${err.message}</div>
<div style="color:var(--muted); font-size:11px; margin-top:8px;">Make sure the server is running: node server.js</div>`;
    showToast("Failed to generate release pack", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "▶ GENERATE RELEASE PACK";
  }
}

/** Copy text to clipboard */
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "COPIED!";
    btn.style.color = "var(--green)";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = "";
    }, 1800);
  }).catch(() => {
    showToast("Copy failed. Please copy manually.", "error");
  });
}

// ============================================================
// API CALL — CREATE NFT DROP
// POST /create-drop
// ============================================================
async function createDrop() {
  const artist  = document.getElementById("nft-artist").value.trim();
  const track   = document.getElementById("nft-track").value.trim();
  const edition = document.getElementById("nft-edition").value.trim();
  const price   = document.getElementById("nft-price").value.trim();

  if (!artist || !track) {
    showToast("Artist name and track name are required.", "error");
    return;
  }

  if (!walletAddress) {
    showToast("Connect your wallet first to simulate a mint.", "info");
    connectWallet();
    return;
  }

  const btn = document.querySelector("#tab-nft .btn-terminal");
  const btnText = document.getElementById("nft-btn-text");
  const output = document.getElementById("nft-output");

  btn.disabled = true;
  btnText.innerHTML = `<span class="spinner"></span> MINTING ON-CHAIN...`;
  output.innerHTML = `<div class="output-placeholder"><span class="cursor-blink">_</span> Broadcasting transaction...</div>`;

  // Simulate the minting delay for realism
  await new Promise((r) => setTimeout(r, 1800));

  try {
    const res = await fetch(`${API_BASE}/create-drop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_name: artist,
        track_name: track,
        edition_size: edition || 100,
        price_eth: price || 0.05,
        wallet_address: walletAddress,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    const { data } = await res.json();

    const html = `
<div style="margin-bottom:16px;">
  <span class="output-val" style="font-size:13px; font-weight:bold;">✓ MINTED SUCCESSFULLY</span>
  <span style="color:var(--muted); font-size:11px; float:right;">${new Date().toLocaleTimeString()}</span>
</div>

<div style="background:rgba(0,255,133,0.04); border:1px solid rgba(0,255,133,0.2); border-radius:4px; padding:16px; margin-bottom:16px;">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px;">
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">STATUS</div>
      <div style="color:var(--green);">${data.status}</div>
    </div>
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">TOKEN ID</div>
      <div style="color:var(--cyan);">#${data.token_id}</div>
    </div>
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">EDITION</div>
      <div>${data.token_id} of ${data.edition_size}</div>
    </div>
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">MINT PRICE</div>
      <div style="color:var(--amber);">${data.price_eth} ETH</div>
    </div>
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">NETWORK</div>
      <div>${data.network}</div>
    </div>
    <div>
      <div style="color:var(--muted); font-size:10px; margin-bottom:3px;">ROYALTY</div>
      <div style="color:var(--green);">${data.royalty_percent}%</div>
    </div>
  </div>
</div>

<div style="margin-bottom:12px;">
  <div style="font-size:10px; color:var(--muted); margin-bottom:4px;">TX HASH</div>
  <div style="font-size:10px; color:var(--green); word-break:break-all; padding:8px; background:rgba(0,0,0,0.4); border-radius:4px;">
    ${data.tx_hash}
    <button class="copy-btn" onclick="copyText(this, '${data.tx_hash}')">COPY</button>
  </div>
</div>

<div style="margin-bottom:12px;">
  <div style="font-size:10px; color:var(--muted); margin-bottom:4px;">CONTRACT ADDRESS</div>
  <div style="font-size:10px; color:var(--cyan); word-break:break-all; padding:8px; background:rgba(0,0,0,0.4); border-radius:4px;">
    ${data.contract_address}
    <button class="copy-btn" onclick="copyText(this, '${data.contract_address}')">COPY</button>
  </div>
</div>

<div style="margin-bottom:12px;">
  <div style="font-size:10px; color:var(--muted); margin-bottom:4px;">IPFS METADATA</div>
  <div style="font-size:10px; color:var(--amber); word-break:break-all; padding:8px; background:rgba(0,0,0,0.4); border-radius:4px;">
    ${data.ipfs_metadata}
  </div>
</div>

<div style="margin-bottom:12px;">
  <div style="font-size:10px; color:var(--muted); margin-bottom:4px;">NFT ATTRIBUTES</div>
  <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
    ${data.metadata.attributes.map(a => `
      <span style="background:var(--void); border:1px solid var(--border); font-size:10px; padding:3px 8px; border-radius:2px; color:var(--muted);">
        <span style="color:var(--text);">${a.trait_type}</span>: ${a.value}
      </span>
    `).join("")}
  </div>
</div>

<div style="font-size:10px; color:var(--muted); margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
  Powered by <a href="https://hd2.ai" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">HD2.ai</a> | ${data.minted_at}
</div>
    `;

    output.innerHTML = html;
    showToast("NFT minted! Transaction confirmed.", "success");

  } catch (err) {
    console.error("Create drop error:", err);
    output.innerHTML = `<div class="output-err">ERROR: ${err.message}</div>
<div style="color:var(--muted); font-size:11px; margin-top:8px;">Make sure the server is running: node server.js</div>`;
    showToast("Mint failed", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "◈ SIMULATE NFT MINT";
  }
}

// ============================================================
// QUICK MINT FLOW — triggered from drop cards
// Opens a pre-filled modal with mint simulation
// ============================================================
function triggerMintFlow(trackName, artistName, style, priceEth) {
  const modal = document.getElementById("mintModal");
  const content = document.getElementById("mintModalContent");

  content.innerHTML = `
    <h3>◈ MINT: ${trackName}</h3>
    <p style="color:var(--muted); font-size:12px; margin-bottom:20px;">
      ${artistName} x Hottdrop — ${style}
    </p>

    ${!walletAddress ? `
    <div style="background:rgba(0,212,255,0.06); border:1px solid var(--cyan-dim); border-radius:4px; padding:16px; margin-bottom:20px; font-size:12px; color:var(--cyan);">
      Connect your wallet to mint this NFT.
    </div>
    <button class="btn-primary" style="width:100%; justify-content:center; margin-bottom:12px;" onclick="connectWallet(); closeMintModal();">
      ◈ CONNECT WALLET FIRST
    </button>
    ` : ""}

    <div class="form-row">
      <label>QUANTITY</label>
      <select id="modal-qty">
        <option value="1">1 edition</option>
        <option value="2">2 editions</option>
        <option value="5">5 editions</option>
      </select>
    </div>

    <div style="background:var(--void); border:1px solid var(--border); border-radius:4px; padding:16px; margin:16px 0; font-size:12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted);">Mint price</span>
        <span>${priceEth} ETH per edition</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted);">Platform fee</span>
        <span>15% (artist: 85%)</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--muted);">Royalty on resale</span>
        <span style="color:var(--green);">15%</span>
      </div>
      <div style="border-top:1px solid var(--border); padding-top:8px; display:flex; justify-content:space-between;">
        <span>Total</span>
        <span style="color:var(--cyan); font-weight:bold;" id="modal-total">${priceEth} ETH</span>
      </div>
    </div>

    <button class="btn-primary" style="width:100%; justify-content:center;" id="modal-mint-btn"
      onclick="executeModalMint('${trackName}', '${artistName}', '${style}', '${priceEth}')">
      <span id="modal-mint-text">◈ CONFIRM MINT</span>
    </button>

    <div id="modal-result" style="margin-top:16px;"></div>
  `;

  // Update total on qty change
  document.getElementById("modal-qty").addEventListener("change", (e) => {
    const qty = parseInt(e.target.value);
    const total = (parseFloat(priceEth) * qty).toFixed(3);
    document.getElementById("modal-total").textContent = `${total} ETH`;
  });

  modal.classList.add("open");
}

async function executeModalMint(trackName, artistName, style, priceEth) {
  if (!walletAddress) {
    showToast("Connect your wallet first!", "error");
    return;
  }

  const btn = document.getElementById("modal-mint-btn");
  const text = document.getElementById("modal-mint-text");
  const result = document.getElementById("modal-result");
  const qty = document.getElementById("modal-qty").value;

  btn.disabled = true;
  text.innerHTML = `<span class="spinner"></span> MINTING...`;
  result.innerHTML = `<div style="color:var(--muted); font-size:12px;"><span class="cursor-blink">_</span> Broadcasting to Polygon...</div>`;

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const res = await fetch(`${API_BASE}/create-drop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_name: artistName,
        track_name: trackName,
        edition_size: 100,
        price_eth: parseFloat(priceEth) * parseInt(qty),
        wallet_address: walletAddress,
      }),
    });

    const { data } = await res.json();

    result.innerHTML = `
      <div class="modal-status">
        <div style="color:var(--green); font-size:13px; margin-bottom:8px;">✓ MINT CONFIRMED</div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:4px;">Token ID: <span style="color:var(--cyan);">#${data.token_id}</span></div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:4px;">Block: <span style="color:var(--text);">${data.block_number}</span></div>
        <div class="modal-tx">${data.tx_hash}</div>
        <div style="font-size:10px; color:var(--muted); margin-top:8px;">Powered by <a href="https://hd2.ai" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">HD2.ai</a></div>
      </div>
    `;
    btn.style.display = "none";
    showToast(`Minted ${qty}x "${trackName}"!`, "success");

  } catch (err) {
    result.innerHTML = `<div style="color:var(--red); font-size:12px;">Mint failed: ${err.message}</div>`;
    btn.disabled = false;
    text.textContent = "◈ CONFIRM MINT";
  }
}

function closeMintModal(event) {
  // Close only if clicking the overlay directly (not the box)
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById("mintModal");
  modal.classList.remove("open");
}

// ============================================================
// API CALL — ARTIST ONBOARDING
// POST /artist-onboard
// ============================================================
async function submitApplication(event) {
  event.preventDefault();

  const name  = document.getElementById("app-name").value.trim();
  const email = document.getElementById("app-email").value.trim();
  const style = document.getElementById("app-style").value;
  const links = document.getElementById("app-links").value.trim();
  const bio   = document.getElementById("app-bio").value.trim();

  if (!name || !email || !style) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  const btn = document.getElementById("apply-btn");
  const btnText = document.getElementById("apply-btn-text");
  const resultEl = document.getElementById("applyResult");

  btn.disabled = true;
  btnText.innerHTML = `<span class="spinner"></span> EVALUATING...`;
  resultEl.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/artist-onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, style, links, bio }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    const { data } = await res.json();

    // Map decision to CSS class
    const classMap = {
      ACCEPT:    "result-accept",
      REVIEW:    "result-review",
      RESUBMIT:  "result-resubmit",
    };
    const colorMap = {
      ACCEPT:    "var(--green)",
      REVIEW:    "var(--amber)",
      RESUBMIT:  "var(--red)",
    };
    const iconMap = {
      ACCEPT:   "✓",
      REVIEW:   "◎",
      RESUBMIT: "↺",
    };

    resultEl.className = `apply-result ${classMap[data.decision] || ""}`;
    resultEl.innerHTML = `
      <div class="result-score" style="color:${colorMap[data.decision]};">${data.score}</div>
      <div class="result-decision" style="color:${colorMap[data.decision]};">
        ${iconMap[data.decision]} ${data.decision}
        ${data.badge ? ` — ${data.badge.replace(/_/g, " ")}` : ""}
      </div>
      <div style="color:var(--text); font-size:13px; line-height:1.7;">${data.message}</div>
      <div class="result-ref">
        Ref: ${data.ref_id} | Submitted: ${new Date(data.submitted_at).toLocaleString()}
      </div>
    `;
    resultEl.style.display = "block";

    const toastMsg = data.decision === "ACCEPT"
      ? `Welcome to Hottdrop, ${name}! Check your email.`
      : `Application submitted, ${name}. Reference: ${data.ref_id}`;
    showToast(toastMsg, data.decision === "ACCEPT" ? "success" : "info");

    // Scroll to result
    setTimeout(() => {
      resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 200);

  } catch (err) {
    console.error("Artist onboard error:", err);
    resultEl.className = "apply-result result-resubmit";
    resultEl.innerHTML = `<div style="color:var(--red);">Error: ${err.message}</div>
<div style="color:var(--muted); font-size:12px; margin-top:8px;">Make sure the server is running: node server.js</div>`;
    resultEl.style.display = "block";
    showToast("Submission failed. Is the server running?", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "SUBMIT APPLICATION";
  }
}

// ============================================================
// NEWSLETTER SUBSCRIPTION
// ============================================================
function subscribeNewsletter() {
  const emailInput = document.getElementById("newsletter-email");
  const email = emailInput.value.trim();

  if (!email || !email.includes("@")) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  // In production, POST to your newsletter endpoint here.
  // For now, simulate success.
  emailInput.value = "";
  showToast(`Subscribed! Watch out for drops at ${email}`, "success");
}

// ============================================================
// DECODE TEXT ANIMATION
// Scrambles the hero title on page load
// ============================================================
function decodeText() {
  const elements = document.querySelectorAll(".decode-text");
  const chars = "!@#$%^&*◈◉◦▪▫▸▾⬡⬢0123456789ABCDEF";

  elements.forEach((el) => {
    const target = el.dataset.text || el.textContent;
    let frame = 0;
    const totalFrames = 24;
    const interval = setInterval(() => {
      el.textContent = target
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < (frame / totalFrames) * target.length) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      frame++;
      if (frame > totalFrames) {
        el.textContent = target;
        clearInterval(interval);
      }
    }, 45);
  });
}

// ============================================================
// SCROLL ANIMATIONS — fade in sections on scroll
// ============================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  // Observe cards and sections
  document.querySelectorAll(".drop-card, .dao-card, .event-card, .benefits-list li").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });
}

// ============================================================
// PROGRESS BARS — animate on scroll
// ============================================================
function initProgressBars() {
  const bars = document.querySelectorAll(".drop-bar");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.style.width;
        bar.style.width = "0";
        setTimeout(() => { bar.style.width = target; }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach((b) => observer.observe(b));
}

// ============================================================
// INITIALISE
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  decodeText();
  initScrollAnimations();
  initProgressBars();
});
