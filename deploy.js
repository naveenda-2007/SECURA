/**
 * deploy.js
 * Deploys the compiled Secura contract to a running Ganache instance
 * using ethers.js, then prints (and saves) the deployed contract address.
 *
 * Prerequisites:
 *   1. Ganache must be running (default RPC: http://127.0.0.1:7545)
 *   2. Run `npm run compile` first to generate artifacts/Secura.json
 *
 * Run with:  npm run deploy
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

async function main() {
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "Secura.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found. Run `npm run compile` first.");
    process.exit(1);
  }
  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  let wallet;
  if (process.env.PRIVATE_KEY) {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } else {
    // Fall back to the first unlocked Ganache account for convenience.
    const accounts = await provider.listAccounts();
    if (!accounts.length) {
      console.error("No accounts found. Is Ganache running at " + rpcUrl + " ?");
      process.exit(1);
    }
    wallet = await provider.getSigner(accounts[0].address);
  }

  console.log("Deploying Secura contract using account:", await wallet.getAddress());

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Secura contract deployed at:", address);

  // Persist the address so the server can pick it up automatically.
  const addressFile = path.resolve(__dirname, "..", "artifacts", "contract-address.json");
  fs.writeFileSync(addressFile, JSON.stringify({ address }, null, 2));

  console.log("\nNext step: copy this address into your .env file as CONTRACT_ADDRESS=" + address);
}

main().catch((err) => {
  console.error("Deployment failed:", err.message || err);
  process.exit(1);
});
