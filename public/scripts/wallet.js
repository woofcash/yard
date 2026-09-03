const RH_CHAIN_ID = 4663;
const RH_CHAIN_HEX = "0x" + RH_CHAIN_ID.toString(16);
const RH_CHAIN = {
  chainId: RH_CHAIN_HEX,
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://explorer.robinhood.xyz"],
};

let provider = null;
let account = null;

function shortAddr(a) {
  return a ? a.slice(0, 6) + "\u2026" + a.slice(-4) : "";
}

function paintAuth() {
  const corner = document.getElementById("auth-status");
  const modal = document.getElementById("wallet-status");
  if (account) {
    if (corner) corner.textContent = shortAddr(account) + " \u00b7 4663";
    if (modal) modal.textContent = "Connected " + shortAddr(account) + " on Robinhood 4663. Factory not deployed \u2014 deposit stays off.";
  } else {
    if (corner) corner.textContent = "not connected";
    if (modal) modal.textContent = "Wallet idle.";
  }
}

function pickProvider() {
  return new Promise((resolve) => {
    const found = [];
    function onAnnounce(e) {
      if (e.detail && e.detail.provider) found.push(e.detail.provider);
    }
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      resolve(found[0] || window.ethereum || null);
    }, 80);
  });
}

async function ensureChain(p) {
  try {
    await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: RH_CHAIN_HEX }] });
  } catch (err) {
    const code = err && err.code;
    if (code === 4902 || /unrecognized chain|not added/i.test(String(err && err.message))) {
      await p.request({ method: "wallet_addEthereumChain", params: [RH_CHAIN] });
    } else if (code === 4001) {
      throw new Error("cancelled");
    } else {
      throw err;
    }
  }
}

async function connectWallet() {
  const p = await pickProvider();
  if (!p) {
    const modal = document.getElementById("wallet-status");
    if (modal) modal.textContent = "No injected wallet. Install Rabby or MetaMask.";
    return;
  }
  provider = p;
  try {
    const accs = await p.request({ method: "eth_requestAccounts" });
    account = Array.isArray(accs) && accs[0] ? String(accs[0]) : null;
    await ensureChain(p);
    if (account) localStorage.setItem("wc.account", account);
    paintAuth();
  } catch (err) {
    const modal = document.getElementById("wallet-status");
    if (modal) modal.textContent = (err && err.message) || "connect failed";
  }
}

async function bootWallet() {
  paintAuth();
  const p = await pickProvider();
  if (!p) return;
  provider = p;
  try {
    const accs = await p.request({ method: "eth_accounts" });
    if (accs && accs[0]) {
      account = String(accs[0]);
      paintAuth();
    }
  } catch (_) {}
  const btn = document.getElementById("btn-connect");
  if (btn) btn.addEventListener("click", connectWallet);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootWallet);
} else {
  bootWallet();
}
