#!/usr/bin/env node
require('dotenv').config();
const StellarSDK = require('@stellar/stellar-sdk');
const readline = require('readline');

const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
const NETWORK_PASSPHRASE = 'Pi Testnet';

const ISSUER_SECRET = process.env.ISSUER_SECRET;
const DISTRIBUTOR_SECRET = process.env.DISTRIBUTOR_SECRET;
const TOKEN_CODE = process.env.TOKEN_CODE || 'FLAPPY';
const AMOUNT = process.env.AMOUNT || '100000';
const HOME_DOMAIN = process.env.HOME_DOMAIN || '';

if (!ISSUER_SECRET || !DISTRIBUTOR_SECRET) {
  console.error('Missing secrets. Create a local .env with ISSUER_SECRET and DISTRIBUTOR_SECRET.');
  process.exit(1);
}

const issuerKP = StellarSDK.Keypair.fromSecret(ISSUER_SECRET);
const distributorKP = StellarSDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);
const asset = new StellarSDK.Asset(TOKEN_CODE, issuerKP.publicKey());

async function getBaseFee() {
  const resp = await server.ledgers().order('desc').limit(1).call();
  return resp.records[0].base_fee_in_stroops;
}

async function confirmPrompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (ans) => { rl.close(); res(ans); }));
}

async function run() {
  console.log('Pi Testnet token setup script');
  console.log(`Token: ${TOKEN_CODE}  Issuer: ${issuerKP.publicKey()}  Distributor: ${distributorKP.publicKey()}`);

  const ans = await confirmPrompt('Proceed to perform on Pi Testnet? type YES to continue: ');
  if (ans.trim() !== 'YES') {
    console.log('Aborted by user.');
    process.exit(0);
  }

  const baseFee = await getBaseFee();

  // 1) Create trustline from distributor
  const distributorAccount = await server.loadAccount(distributorKP.publicKey());
  const trustTx = new StellarSDK.TransactionBuilder(distributorAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
  })
    .addOperation(StellarSDK.Operation.changeTrust({ asset }))
    .build();

  trustTx.sign(distributorKP);
  console.log('Submitting trustline (distributor) transaction...');
  await server.submitTransaction(trustTx);
  console.log('Trustline created.');

  // 2) Mint by sending from issuer to distributor
  const issuerAccount = await server.loadAccount(issuerKP.publicKey());
  const paymentTx = new StellarSDK.TransactionBuilder(issuerAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
  })
    .addOperation(StellarSDK.Operation.payment({
      destination: distributorKP.publicKey(),
      asset,
      amount: AMOUNT,
    }))
    .build();

  paymentTx.sign(issuerKP);
  console.log(`Submitting payment (mint) of ${AMOUNT} ${TOKEN_CODE}...`);
  await server.submitTransaction(paymentTx);
  console.log('Minting/payment complete.');

  // 3) Optionally set home domain on issuer
  if (HOME_DOMAIN) {
    const issuerAccount2 = await server.loadAccount(issuerKP.publicKey());
    const setDomainTx = new StellarSDK.TransactionBuilder(issuerAccount2, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.setOptions({ homeDomain: HOME_DOMAIN }))
      .build();

    setDomainTx.sign(issuerKP);
    console.log(`Setting home_domain=${HOME_DOMAIN} on issuer...`);
    await server.submitTransaction(setDomainTx);
    console.log('Home domain set.');
  }

  // Show distributor balances
  const updated = await server.loadAccount(distributorKP.publicKey());
  console.log('Distributor balances:');
  updated.balances.forEach(b => {
    if (b.asset_type === 'native') console.log(`  Test-Pi: ${b.balance}`);
    else console.log(`  ${b.asset_code} (${b.asset_issuer}): ${b.balance}`);
  });

  console.log('Done. Do NOT commit your secrets to the repo.');
}

run().catch((err) => { console.error('Error:', err.response && err.response.data ? err.response.data : err); process.exit(1); });
