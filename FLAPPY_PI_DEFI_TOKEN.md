# Flappy Pi — DeFi Token Setup (Pi Testnet)

This page explains how to create and list a DeFi token for the Flappy Pi project on Pi Testnet and how to make it appear in Pi Wallet.

## Table of Contents

- [Prerequisites](#prerequisites)
- [How tokens are created](#how-tokens-are-created)
- [Steps (Issuer / Distributor)](#steps-issuer--distributor)
- [Token Minting - NodeJS Example](#token-minting---nodejs-example)
- [Setting Home Domain - NodeJS Example](#setting-home-domain---nodejs-example)
- [Content for `pi.toml`](#content-for-pitoml)
- [Token Distribution](#token-distribution)
- [Hosting `pi.toml` and image requirements](#hosting-pitoml-and-image-requirements)
- [Additional resources](#additional-resources)

## Prerequisites

- Two Pi Testnet wallets created in Pi Wallet: one will act as the `Issuer`, the other as the `Distributor`.
- Export the wallets' secret keys (from Pi Wallet settings) for use in scripts.
- NodeJS environment with `@stellar/stellar-sdk` installed when running the examples.

## How tokens are created

On Pi (Stellar-compatible), tokens exist once a trustline for that asset is established on-chain. The first wallet to add a trustline for a new (issuer, code) pair effectively registers that asset on-chain. After that, the issuer can send (mint) tokens to any account that trusts the asset.

## Steps (Issuer / Distributor)

1. From the `Distributor` account, create a trustline to your token (asset code + issuer public key). Since this is the first trustline, the token will be written on-chain.
2. From the `Issuer` account, perform a `payment` operation to the `Distributor` for the desired supply amount. This acts as minting.

## Token Minting - NodeJS Example

Install dependency:

```powershell
npm install @stellar/stellar-sdk
```

Example script (naive, for testing on Pi Testnet):

```javascript
const StellarSDK = require("@stellar/stellar-sdk");

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// prepare keypairs (use real secrets)
const issuerKeypair = StellarSDK.Keypair.fromSecret("<ISSUER_SECRET>");
const distributorKeypair = StellarSDK.Keypair.fromSecret("<DISTRIBUTOR_SECRET>");

const customToken = new StellarSDK.Asset("TestToken", issuerKeypair.publicKey());

async function run() {
  const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());

  // get base fee
  const response = await server.ledgers().order("desc").limit(1).call();
  const latestBlock = response.records[0];
  const baseFee = latestBlock.base_fee_in_stroops;

  // create trustline (distributor)
  const trustlineTx = new StellarSDK.TransactionBuilder(distributorAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await server.fetchTimebounds(90),
  })
    .addOperation(StellarSDK.Operation.changeTrust({ asset: customToken }))
    .build();

  trustlineTx.sign(distributorKeypair);
  await server.submitTransaction(trustlineTx);
  console.log("Trustline created successfully");

  // now mint by sending from issuer to distributor
  const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

  const paymentTx = new StellarSDK.TransactionBuilder(issuerAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await server.fetchTimebounds(90),
  })
    .addOperation(
      StellarSDK.Operation.payment({
        destination: distributorKeypair.publicKey(),
        asset: customToken,
        amount: "100000"
      })
    )
    .build();

  paymentTx.sign(issuerKeypair);
  await server.submitTransaction(paymentTx);
  console.log("Token issued successfully");

  // check balances
  const updated = await server.loadAccount(distributorKeypair.publicKey());
  updated.balances.forEach(b => {
    if (b.asset_type === "native") console.log(`Test-Pi: ${b.balance}`);
    else console.log(`${b.asset_code} (${b.asset_issuer}): ${b.balance}`);
  });
}

run().catch(console.error);
```

## Setting Home Domain - NodeJS Example

To have Pi Server recognize your token and display a `toml` link, set the issuer's `home_domain` via `setOptions`.

```javascript
// assume server and baseFee same as above, and issuerKeypair defined
const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

const setOptionsTx = new StellarSDK.TransactionBuilder(issuerAccount, {
  fee: baseFee,
  networkPassphrase: NETWORK_PASSPHRASE,
  timebounds: await server.fetchTimebounds(90),
})
  .addOperation(StellarSDK.Operation.setOptions({ homeDomain: "example.com" }))
  .build();

setOptionsTx.sign(issuerKeypair);
await server.submitTransaction(setOptionsTx);
console.log("Home Domain set successfully");
```

After setting `home_domain` you should see `toml.href` return `https://<YOUR_DOMAIN>/.well-known/pi.toml` when calling:

```
https://api.testnet.minepi.com/assets?asset_code=<YOUR_CODE>&asset_issuer=<ISSUER_PUBKEY>
```

## Content for `pi.toml`

Create a public file at `https://<YOUR_DOMAIN>/.well-known/pi.toml` with `content-type: text/plain`.

Example:

```toml
[[CURRENCIES]]
code = "TestToken"
issuer = "GCNCQ6RRVEERQXWGKB3XMRK6VGJRIHGT5UTDAAU6QEU5NL2AHFOJDYLC"
name = "Flappy Pi Team"
desc = "Test token for Flappy Pi DeFi page — no monetary value."
image = "https://<YOUR_DOMAIN>/images/testtoken.png"
```

Required fields per token: `code`, `issuer`, `name`, `desc`, `image`.

If your issuer has multiple tokens, add one `[[CURRENCIES]]` section per token.

## Hosting `pi.toml` and image requirements

- Serve via `https` and ensure `Content-Type: text/plain` for `pi.toml`.
- The image must be reachable via `https` and remain available (cache recommended).
- Pi Server periodically scans issuer accounts and the linked `pi.toml`.

## Token Distribution

1. Direct Payment: send tokens from your distributor/issuer to users who have already added the token to their Pi Wallet (created a trustline).
2. Liquidity Pool (LP): create an LP between Test-Pi and your token in Pi Wallet so users can swap Test-Pi for your token.

Steps for LP in Pi Wallet:

- In Pi Wallet: `Tokens` → `Liquidity Pools` → `Create New Pool`.
- Select `Test-Pi` and your token, add amounts and create the pool.

## Additional recommendations

- Consider implementing a maximum supply and disabling the issuing account (lock) after minting if you want a fixed supply.
- Test thoroughly on Pi Testnet before any production deployment.

## Additional resources

- Stellar Developer Docs: https://developers.stellar.org
- Stellar JS SDK: https://stellar.github.io/js-stellar-sdk
- Token Best Practices: https://developers.stellar.org/docs/tokens/how-to-issue-an-asset

---

If you want, I can:

- Add a small frontend page in the Flappy Pi repo that displays token metadata and a link to `pi.toml`.
- Add a sample `pi.toml` and a small static `/.well-known/` host example in the repo for testing (with local HTTPS instructions).

Tell me which next step you prefer.
