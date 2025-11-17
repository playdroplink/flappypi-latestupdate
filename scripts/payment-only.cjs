#!/usr/bin/env node
require('dotenv').config();
const StellarSDK = require('@stellar/stellar-sdk');

const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
const NETWORK_PASSPHRASE = 'Pi Testnet';

const ISSUER_SECRET = process.env.ISSUER_SECRET;
const DISTRIBUTOR_PUBLIC = process.env.DISTRIBUTOR_PUBLIC;
const TOKEN_CODE = process.env.TOKEN_CODE || 'FLAPPY';
const AMOUNT = process.env.AMOUNT || '1000';

if (!ISSUER_SECRET || !DISTRIBUTOR_PUBLIC) {
  console.error('Set ISSUER_SECRET and DISTRIBUTOR_PUBLIC in env');
  process.exit(1);
}

const issuerKP = StellarSDK.Keypair.fromSecret(ISSUER_SECRET);
const asset = new StellarSDK.Asset(TOKEN_CODE, issuerKP.publicKey());

async function run() {
  try {
    const baseFee = (await server.ledgers().order('desc').limit(1).call()).records[0].base_fee_in_stroops;
    const issuerAccount = await server.loadAccount(issuerKP.publicKey());
    const tx = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.payment({ destination: DISTRIBUTOR_PUBLIC, asset, amount: AMOUNT }))
      .build();

    tx.sign(issuerKP);
    const res = await server.submitTransaction(tx);
    console.log('Payment success:', res);
  } catch (err) {
    console.error('Payment error:');
    if (err.response && err.response.data) console.error(JSON.stringify(err.response.data, null, 2));
    else console.error(err);
    process.exit(1);
  }
}

run();
