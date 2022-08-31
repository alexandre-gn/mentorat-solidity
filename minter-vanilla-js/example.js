"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

// Contract imports
import {contractAddress, contractABI} from "./nft-contract.js"

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let providerFromWeb3Modal;

// Address of the selected account
let selectedAccount;

/**
 * Setup
 */
function init() {
  console.log("Initializing example");

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "5d340696e7584a328ee6f2f0b9d14849",
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  // Get instance for the wallet
  const provider = new ethers.providers.Web3Provider(providerFromWeb3Modal);
  const signer = provider.getSigner();

  // Get connected chain id from Ethereum node
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await provider.listAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];

  document.querySelector("#selected-account").textContent = selectedAccount;

  // Display fully loaded UI for wallet data
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block";
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(providerFromWeb3Modal);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
  console.log("Opening a dialog");

  try {
    providerFromWeb3Modal = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  providerFromWeb3Modal.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  providerFromWeb3Modal.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  providerFromWeb3Modal.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

/**
 * Mint button pressed.
 */
async function onMint() {
  const provider = new ethers.providers.Web3Provider(providerFromWeb3Modal);
  const signer = provider.getSigner();

  console.log("Get total supply");
  let totalSupply = 0;
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    totalSupply = await contract.totalSupply();
  } catch(e) {
    console.log("Could not call function on contract", e);
  }

  console.log("Mint NFT");
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    const tx = await contract.mint("");
    const ret = await tx.wait();
    if (ret) {
      console.log("Transaction is successful!!!" + '\n' + "Transaction Hash:", tx.hash + '\n' + "Block Number:" + ret.blockNumber + '\n' + "Navigate to https://rinkeby.etherscan.io/tx/" + tx.hash, "to see your transaction")
    } else {
      console.log("Error submitting transaction")
    }
    // Purge
    document.querySelector("#mint-addr").innerHTML = '';
    // Add link to OpeanSea
    var a = document.createElement('a');
    a.setAttribute('target', '_blank');
    var link = document.createTextNode("Link");
    a.appendChild(link);
    a.text = "https://testnets.opensea.io/assets/rinkeby/"+contractAddress+"/"+totalSupply;
    a.href = "https://testnets.opensea.io/assets/rinkeby/"+contractAddress+"/"+totalSupply;
    document.querySelector("#mint-addr").appendChild(a);
  } catch(e) {
    console.log("Could not call function on contract", e);
  }
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", providerFromWeb3Modal);

  // TODO: Which providers have close method?
  if(providerFromWeb3Modal.close) {
    await providerFromWeb3Modal.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    providerFromWeb3Modal = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}

/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  document.querySelector("#btn-mint").addEventListener("click", onMint);
});
