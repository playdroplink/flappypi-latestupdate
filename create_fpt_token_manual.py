"""
FPT (Flappy Pi Token) Manual Creation Script
===========================================
This script creates and distributes the FPT token using manual configuration.
"""

from stellar_sdk import (
    Keypair,
    Server,
    TransactionBuilder,
    Asset,
    exceptions,
)
import sys
import time
from fpt_config_manual import get_config, validate_config

# Load configuration
config = get_config()
HORIZON_URL = config["network"]["horizon_url"]
NETWORK_PASSPHRASE = config["network"]["network_passphrase"]
BASE_FEE = config["network"]["base_fee"]
ASSET_CODE = config["token"]["asset_code"]
TOTAL_SUPPLY = config["token"]["total_supply"]
TRUSTLINE_LIMIT = config["token"]["trustline_limit"]
TIMEOUT = config["network"]["timeout"]

server = Server(HORIZON_URL)

def load_account_or_exit(pub):
    """Load account from Pi Testnet or exit if not found."""
    try:
        return server.load_account(pub)
    except exceptions.NotFoundError:
        print(f"Account {pub} not found on Pi Testnet. Make sure it's created/funded.")
        sys.exit(1)

def print_balances(label, pubkey):
    """Print account balances in a formatted way."""
    acct = server.accounts().account_id(pubkey).call()
    bals = {b["asset_type"] + (":" + b.get("asset_code","") + ":" + b.get("asset_issuer","") if b["asset_type"]!="native" else ""): b["balance"] for b in acct["balances"]}
    print(f"\n[{label}] Balances for {pubkey[:6]}...{pubkey[-6:]}:")
    for k,v in bals.items():
        print(f"  {k:<35} {v}")

def submit_tx(builder, signers):
    """Submit transaction with error handling."""
    tx = builder.set_timeout(TIMEOUT).build()
    for s in signers:
        tx.sign(s)
    try:
        resp = server.submit_transaction(tx)
        return resp
    except exceptions.BadRequestError as e:
        print("BadRequestError:", e)
        if hasattr(e, "extras") and e.extras:
            print("Result codes:", e.extras.get("result_codes"))
        sys.exit(1)
    except exceptions.ConnectionError as e:
        print("Connection error:", e)
        sys.exit(1)
    except exceptions.TimeoutError as e:
        print("Timeout:", e)
        sys.exit(1)
    except exceptions.UnknownRequestError as e:
        print("Unknown request error:", e)
        sys.exit(1)

def main():
    print("=== Pi Testnet: Create & Distribute FPT (Flappy Pi Token) ===")
    print(f"Asset Code: {ASSET_CODE}")
    print(f"Total Supply: {TOTAL_SUPPLY} FPT")
    print(f"Trustline Limit: {TRUSTLINE_LIMIT} FPT")
    
    # Validate configuration
    issues = validate_config()
    if issues:
        print("\n❌ Configuration Issues:")
        for issue in issues:
            print(f"  - {issue}")
        print("\n💡 To fix:")
        print("1. Get your secret key from Pi Browser (testnet.minepi.com)")
        print("2. Edit fpt_config_manual.py and replace 'YOUR_SECRET_KEY_HERE' with your actual secret key")
        print("3. Save the file and run this script again")
        sys.exit(1)
    
    # Get secret keys from configuration
    issuer_secret = config["accounts"]["issuer_secret"]
    dist_secret = config["accounts"]["distributor_secret"]

    issuer_kp = Keypair.from_secret(issuer_secret)
    dist_kp   = Keypair.from_secret(dist_secret)

    issuer_pub = issuer_kp.public_key
    dist_pub   = dist_kp.public_key

    print(f"\nIssuer Account: {issuer_pub}")
    print(f"Distributor Account: {dist_pub}")

    # Ensure accounts exist
    print("\n🔍 Checking accounts on Pi Testnet...")
    issuer_acct = load_account_or_exit(issuer_pub)
    dist_acct   = load_account_or_exit(dist_pub)
    print("✅ Both accounts found and funded!")

    # Define the FPT asset
    asset = Asset(ASSET_CODE, issuer_pub)

    print(f"\nStep 1/3: Create/ensure trustline on DISTRIBUTOR for {ASSET_CODE}...")
    # Build change_trust from distributor
    builder = TransactionBuilder(
        source_account=dist_acct,
        network_passphrase=NETWORK_PASSPHRASE,
        base_fee=BASE_FEE,
    ).append_change_trust_op(
        asset=asset,
        limit=TRUSTLINE_LIMIT
    )

    submit_tx(builder, [dist_kp])

    # Re-load accounts after tx
    issuer_acct = server.load_account(issuer_pub)
    dist_acct   = server.load_account(dist_pub)
    print("✅ Trustline set (or already existed).")

    print(f"\nStep 2/3: Send {TOTAL_SUPPLY} {ASSET_CODE} from ISSUER → DISTRIBUTOR...")
    builder = TransactionBuilder(
        source_account=issuer_acct,
        network_passphrase=NETWORK_PASSPHRASE,
        base_fee=BASE_FEE,
    ).append_payment_op(
        destination=dist_pub,
        amount=TOTAL_SUPPLY,
        asset=asset
    )

    submit_tx(builder, [issuer_kp])
    print("✅ FPT distribution payment submitted.")

    print("\nStep 3/3: Verify balances...")
    print_balances("Issuer (A)", issuer_pub)
    print_balances("Distributor (B)", dist_pub)

    print(f"\n🎉 Done! FPT (Flappy Pi Token) has been created and distributed.")
    print(f"📊 Initial Supply: {TOTAL_SUPPLY} FPT")
    print(f"🔄 Supply is NOT fixed: the issuer can mint more by sending additional FPT from A to B (or others).")
    print(f"🌐 View on Pi Testnet Explorer: https://testnet.minepi.com/account/{issuer_pub}")

if __name__ == "__main__":
    main()
