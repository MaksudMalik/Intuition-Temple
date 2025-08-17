import { BrowserProvider, Contract } from "https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js";
import { contractAddress, contractABI, myCustomChainId, customChain } from "./config.js";

let provider;
let signer;
let contract;
let intervalId;
let isConnected = false;

// --- Functions ---
async function switchToCustomChain() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: customChain.chainId }]
        });
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [customChain]
                });
                return true;
            } catch (addError) {
                console.error("Failed to add network:", addError);
                alert("Please add the network manually in MetaMask.");
                return false;
            }
        } else {
            console.error("Failed to switch network:", switchError);
            alert("Please switch network manually in MetaMask.");
            return false;
        }
    }
}

async function connectWallet() {
    if (isConnected) {
        // Disconnect
        provider = null;
        signer = null;
        contract = null;
        isConnected = false;
        document.getElementById("walletAddress").style.display = 'none';

        document.getElementById("walletAddress").innerText = "";
        document.getElementById("connectWallet").innerText = "CONNECT WALLET";
        document.getElementById("clickButton").disabled = true;
        clearInterval(intervalId);
        document.getElementById("timer").innerText = "";
        document.getElementById("status").innerText = "";
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        alert("Please install a wallet like MetaMask or Coinbase Wallet.");
        document.getElementById("status").innerText = "PLEASE INSTALL A WALLET TO USE THIS DAPP";
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const { chainId } = await provider.getNetwork();
        if (chainId !== BigInt(myCustomChainId)) {
            const switched = await switchToCustomChain();
            if (!switched) return; // Stop if user didn't switch
        }

        contract = new Contract(contractAddress, contractABI, signer);

        const address = await signer.getAddress();
        document.getElementById("walletAddress").innerText =
            `${address.substring(0, 6)}..........${address.substring(address.length - 4)}`;
        document.getElementById("walletAddress").style.display = 'block';
        document.getElementById("connectWallet").innerText = "DISCONNECT";
        isConnected = true;

        checkClickable();
    } catch (error) {
        console.error("Wallet connection failed:", error);
        document.getElementById("status").innerText = "CONNECTION FAILED. PLEASE TRY AGAIN.";
    }
}

async function checkClickable() {
    if (!contract || !signer) return;

    try {
        const address = await signer.getAddress();
        const canPray = await contract.canPray(address);
        const button = document.getElementById("clickButton");
        button.disabled = !canPray;

        if (canPray) {
            document.getElementById("status").innerText = "YOU CAN PRAY NOW!";
            document.getElementById("timer").innerText = "";
        } else {
            document.getElementById("status").innerText = "ALREADY PRAYED IN THE LAST 24 HOURS!";
            startCountdown();
        }
    } catch (e) {
        console.error("Error checking clickable status:", e);
        document.getElementById("status").innerText =
            "Error checking status. Make sure you are on the correct network.";
    }
}

async function prayNow() {
    if (!contract) {
        document.getElementById("status").innerText = "PLEASE CONNECT YOUR WALLET FIRST";
        return;
    }

    const status = document.getElementById("status");
    status.innerText = "SENDING TRANSACTION...";

    try {
        const tx = await contract.Pray();
        await tx.wait();

        status.innerText = "YOU'RE BLESSSED! COME BACK IN 24 HOURS";
        document.getElementById("clickButton").disabled = true;
        startCountdown();
    } catch (e) {
        console.error("Transaction failed:", e);
        status.innerText = "TRANSACTION FAILED";
    }
}

async function startCountdown() {
    if (!contract || !signer) return;

    const address = await signer.getAddress();
    const lastPray = await contract.lastPray(address);
    const timerDiv = document.getElementById("timer");
    clearInterval(intervalId);

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        let remaining = Number(lastPray) + 24 * 3600 - now;

        if (remaining <= 0) {
            timerDiv.innerText = "YOU CAN CLICK NOW!";
            document.getElementById("clickButton").disabled = false;
            clearInterval(intervalId);
            return;
        }

        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerDiv.innerText = `NEXT PRAYER IN: ${hrs}H ${mins}M ${secs}S`;
    };

    update();
    intervalId = setInterval(update, 1000);
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectWallet").onclick = connectWallet;
    document.getElementById("clickButton").onclick = prayNow;
});

if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) connectWallet(); // auto-disconnect
        else if (!isConnected) connectWallet(); // auto-connect new account
    });

    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}
