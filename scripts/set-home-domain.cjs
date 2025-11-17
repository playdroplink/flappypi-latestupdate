#!/usr/bin/env node
require('dotenv').config();
const StellarSDK = require('@stellar/stellar-sdk');

const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
const NETWORK_PASSPHRASE = 'Pi Testnet';

const ISSUER_SECRET = process.env.ISSUER_SECRET;
const HOME_DOMAIN = process.env.HOME_DOMAIN;

if (!ISSUER_SECRET) {
  console.error('Missing ISSUER_SECRET in environment');
  process.exit(1);
}
if (!HOME_DOMAIN) {
  console.error('Missing HOME_DOMAIN in environment');
  process.exit(1);
}

const issuerKP = StellarSDK.Keypair.fromSecret(ISSUER_SECRET);

async function run() {
  try {
    const baseFee = (await server.ledgers().order('desc').limit(1).call()).records[0].base_fee_in_stroops;
    const issuerAccount = await server.loadAccount(issuerKP.publicKey());
    const tx = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.setOptions({ homeDomain: HOME_DOMAIN }))
      .build();

    tx.sign(issuerKP);
    const res = await server.submitTransaction(tx);
    console.log('setOptions success:', res.hash);
    console.log(`home_domain set to ${HOME_DOMAIN} for issuer ${issuerKP.publicKey()}`);
  } catch (err) {
    console.error('Error setting home_domain:');
    if (err.response && err.response.data) console.error(JSON.stringify(err.response.data, null, 2));
    else console.error(err);
    process.exit(1);
  }
}

run();
