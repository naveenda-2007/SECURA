# SECURA
### Decentralized Identity and Digital Asset Security Management System with Blockchain Verification

A B.Tech Information Technology academic project prototype demonstrating **digital
asset integrity verification with identity association using blockchain**.

---

## 1. Project Overview

SECURA lets a user:

1. Register an identity.
2. Register a digital asset (e.g. a certificate) under that identity.
3. Generate a SHA-256 hash of the asset and anchor it on a local Ethereum-compatible
   blockchain (Ganache) via a Solidity smart contract.
4. Later re-upload the same (or a modified) asset for verification.
5. See a clear **MATCH** or **MISMATCH** result based on comparing the freshly
   computed hash against the registered hash.

This demonstrates tamper-evident storage: since the hash is anchored on-chain,
any change to the file — however small — produces a different SHA-256 hash and
is immediately detectable.

---

## 2. Features

- Identity registration (Registered → Verified) stored in MongoDB.
- Digital asset registration with real SHA-256 hashing of the uploaded file.
- On-chain hash anchoring through a custom Solidity smart contract deployed to
  a local Ganache blockchain, using ethers.js for all contract interaction.
- Asset verification flow that re-hashes an uploaded file and compares it
  against the registered hash (read from the blockchain, with a MongoDB
  fallback if the chain is unreachable).
- Records page with search, filtering, and a detail view showing full
  registration and verification history for an asset.
- Dashboard with live counts of identities, assets, verifications, and
  blockchain connection status.
- Basic, explainable error handling (missing file, invalid Asset ID, DB/chain
  connection failures, etc.) — no functionality is faked.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| Hashing | SHA-256 (Node's built-in `crypto` module) |
| Blockchain | Ganache (local Ethereum-compatible chain) |
| Smart Contract | Solidity (compiled with `solc`) |
| Blockchain Integration | ethers.js |
| Dev Tools | VS Code, GitHub |

---

## 4. Prerequisites

Install these before you begin:

- **Node.js** v18 or later (includes npm) — https://nodejs.org
- **MongoDB Community Server** (running locally) — https://www.mongodb.com/try/download/community
- **Ganache** (GUI app or `ganache-cli`) — https://trufflesuite.com/ganache/
- **VS Code** (recommended editor)
- **Git** (optional, for version control)

---

## 5. Installation

```bash
# 1. Unzip / clone the project, then move into it
cd secura

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env
```

---

## 6. MongoDB Setup

1. Start MongoDB locally. On most systems this is either:
   - A background service (Windows/macOS installers usually set this up), or
   - Run manually: `mongod --dbpath <path-to-your-data-folder>`
2. By default SECURA connects to `mongodb://127.0.0.1:27017/secura`
   (the `secura` database is created automatically on first write — no
   manual setup needed).
3. If you use MongoDB Atlas or a different host/port, update
   `MONGODB_URI` in `.env` accordingly.

---

## 7. Ganache Setup

1. Open **Ganache** (GUI) and start a new workspace, or run:
   ```bash
   npx ganache
   ```
2. Note the **RPC Server URL** shown in Ganache (GUI default is usually
   `http://127.0.0.1:7545`; `ganache-cli`/`npx ganache` defaults to
   `http://127.0.0.1:8545`).
3. Copy the **private key** of any one of the pre-funded test accounts shown
   in Ganache (click the key icon next to an account).
4. These are local, throwaway development accounts funded with fake test
   ETH — they have no real-world value. Never reuse this pattern with a
   real wallet's private key.

---

## 8. Smart Contract Deployment

With Ganache running:

```bash
# 1. Compile the Solidity contract -> writes artifacts/Secura.json
npm run compile

# 2. Deploy the compiled contract to Ganache
npm run deploy
```

`npm run deploy` will:
- Connect to the RPC URL in `.env` (or `http://127.0.0.1:7545` by default).
- Deploy `Secura.sol` using the `PRIVATE_KEY` in `.env`, or fall back to the
  first unlocked Ganache account if no key is set.
- Print the deployed **contract address** and also save it to
  `artifacts/contract-address.json` for reference.

Copy the printed contract address into `.env` as `CONTRACT_ADDRESS`.

---

## 9. Environment Variables

Edit `.env` (created from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secura
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<address printed by npm run deploy>
PRIVATE_KEY=<private key of a Ganache test account>
```

`PRIVATE_KEY` and `CONTRACT_ADDRESS` are read only on the server side and are
never exposed to the frontend.

---

## 10. Running the Application

With MongoDB and Ganache running, and the contract deployed:

```bash
npm start
```

Then open your browser at:

```
http://localhost:5000
```

(or whichever `PORT` you configured).

---

## 11. Demo Workflow

This is the exact flow to demonstrate during a project review:

**Step 1 — Register an Identity** (Identity Management page)
```
Name: Arun Kumar
Email: arun@example.com
Organization: ABC College
```
The identity is created with status **Verified**.

**Step 2 — Register a Certificate** (Register Asset page)
- Select the identity created above.
- Upload a file, e.g. `BTech_Certificate.pdf`.
- Asset Type: `Academic Certificate`.
- SECURA generates a SHA-256 hash, sends it to the Secura smart contract on
  Ganache, and stores the resulting transaction hash and metadata in MongoDB.
- Result: **Asset Registered Successfully**, with Asset ID, SHA-256 hash, and
  blockchain transaction hash displayed.

**Step 3 — Verify the Original Certificate** (Verify Asset page)
- Enter the Asset ID from Step 2.
- Upload the *same* file again.
- Result: **MATCH** — the newly computed hash equals the registered hash.

**Step 4 — Verify a Modified Certificate**
- Make any small change to the file (edit a line, add a character, etc.).
- Upload the modified file with the same Asset ID.
- Result: **MISMATCH** — *"The submitted asset differs from the registered
  version."*

**Step 5 — Records**
- Open the Records page to see the asset's status update, and click
  **View** to see its full registration and verification history.

---

## 12. Project Structure

```
secura/
├── client/                  # Static frontend (HTML/CSS/vanilla JS)
│   ├── index.html            # Dashboard
│   ├── identity.html         # Identity Management
│   ├── register-asset.html   # Register Digital Asset
│   ├── verify.html           # Verify Asset
│   ├── records.html          # Records
│   ├── css/style.css
│   └── js/
│       ├── common.js          # Shared fetch helpers
│       ├── dashboard.js
│       ├── identity.js
│       ├── register.js
│       ├── verify.js
│       └── records.js
│
├── server/                  # Express backend
│   ├── server.js              # App entry point
│   ├── routes/                # Route definitions
│   ├── controllers/           # Request handlers / business logic
│   ├── models/                # Mongoose schemas (Identity, Asset, Verification)
│   ├── services/              # hashService.js, blockchainService.js
│   ├── middleware/upload.js   # Multer file upload config
│   └── uploads/                # Uploaded files land here
│
├── contracts/
│   └── Secura.sol             # Smart contract: registerAsset/getAsset/verifyAsset
│
├── scripts/
│   ├── compile.js             # Compiles Secura.sol with solc
│   └── deploy.js              # Deploys the compiled contract to Ganache
│
├── artifacts/                # Generated: ABI/bytecode + deployed address
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 13. How Each Module Works (for viva/review)

- **Identity Management**: Simple CRUD-style registration into the
  `identities` MongoDB collection. For this prototype, "verification" of an
  identity is represented simply as a status flip to `Verified` on
  registration rather than a full KYC process.

- **Asset Registration**: The uploaded file never leaves the server
  unhashed — `hashService.js` reads the file buffer and computes a real
  SHA-256 digest with Node's `crypto` module. That hash, plus the asset ID
  and identity ID, are sent to the `registerAsset()` function of the
  deployed `Secura.sol` contract via `blockchainService.js` (ethers.js). The
  resulting transaction hash and all metadata are then saved to the `assets`
  collection.

- **Smart Contract (`Secura.sol`)**: A single contract with a mapping from
  `assetId` to a struct holding the identity reference, hash, and
  timestamp. `registerAsset()` writes a new record (and rejects duplicate
  asset IDs); `getAsset()` is a free on-chain read; `verifyAsset()` does an
  on-chain string comparison of a supplied hash against the stored one.

- **Verification**: On the Verify Asset page, the uploaded file is re-hashed
  the same way. The registered hash is read primarily from the blockchain
  (falling back to MongoDB if the chain is temporarily unreachable, which is
  reported honestly rather than hidden). The two hashes are compared and the
  result — **MATCH** or **MISMATCH** — plus a `verifications` record are
  saved and shown to the user.

- **Records**: Aggregates the `assets` collection (joined with identity
  names) with search/filter query parameters, and a details endpoint that
  also pulls the asset's full verification history.

---

## 14. Error Handling

The system surfaces clear, user-friendly messages for:
- No file uploaded / unsupported file type / file too large
- Missing required fields
- Invalid or unknown Asset ID
- Identity not found
- MongoDB connection failure (server refuses to start and logs the reason)
- Blockchain / Ganache connection failure (asset registration fails with a
  clear message rather than silently faking a transaction hash)
- Smart contract transaction failures (e.g. duplicate Asset ID)

---

## 15. Security Notes (Prototype Scope)

- Uploaded files are validated by extension and size (20 MB limit).
- Required fields are validated on both client and server.
- All sensitive configuration (Mongo URI, RPC URL, contract address, private
  key) lives in `.env` and is never sent to the frontend.
- The private key used is a **local Ganache development account only** —
  it holds no real value and must never be a real wallet key.
- This is an academic prototype: it does not implement enterprise-grade
  security (rate limiting, authentication/authorization, CSRF protection,
  encryption at rest, etc.).

---

## 16. Limitations

- Single-user/demo style app — there is no login/authentication layer.
- Identity "verification" is a status flag, not real KYC.
- Uses a single local Ganache chain rather than a public testnet/mainnet.
- File storage is local disk only, intended for demonstration.
- No role-based access control between different identities/organizations.

---

## 17. Future Enhancements

*(Not implemented in this prototype — listed for discussion only)*

- Mobile application
- Multi-organization network support
- Multiple blockchain support (e.g. testnets, other chains)
- Advanced access control / authentication
- Additional digital asset types
- Automated verification services (e.g. scheduled re-checks)
- AI-assisted verification (explicitly out of scope for the current core
  implementation)
