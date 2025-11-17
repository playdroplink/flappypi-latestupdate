// Get public keys from secret keys
const StellarSDK = require("@stellar/stellar-sdk");

const ISSUER_SECRET = "SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I";
const DISTRIBUTOR_SECRET = "SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM";

const issuerKeypair = StellarSDK.Keypair.fromSecret(ISSUER_SECRET);
const distributorKeypair = StellarSDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);

console.log("\n🔐 Wallet Public Keys:\n");
console.log("Issuer Public Key:");
console.log(issuerKeypair.publicKey());
console.log("\nDistributor Public Key:");
console.log(distributorKeypair.publicKey());
console.log("\n");
