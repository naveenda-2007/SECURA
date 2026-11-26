/**
 * compile.js
 * Compiles contracts/Secura.sol using solc (Solidity compiler) and
 * writes the ABI + bytecode to artifacts/Secura.json.
 *
 * Run with:  npm run compile
 */
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const CONTRACT_NAME = "Secura.sol";
const contractPath = path.resolve(__dirname, "..", "contracts", CONTRACT_NAME);
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    [CONTRACT_NAME]: { content: source },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

console.log("Compiling", CONTRACT_NAME, "...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  output.errors.forEach((err) => {
    console.log(err.formattedMessage || err.message);
    if (err.severity === "error") hasError = true;
  });
  if (hasError) {
    console.error("Compilation failed.");
    process.exit(1);
  }
}

const contractOutput = output.contracts[CONTRACT_NAME]["Secura"];
const abi = contractOutput.abi;
const bytecode = "0x" + contractOutput.evm.bytecode.object;

const artifactsDir = path.resolve(__dirname, "..", "artifacts");
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

fs.writeFileSync(
  path.join(artifactsDir, "Secura.json"),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log("Compiled successfully. Artifact written to artifacts/Secura.json");
