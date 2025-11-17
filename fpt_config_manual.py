"""
FPT (Flappy Pi Token) Manual Configuration
==========================================
Edit this file with your actual secret keys to create the FPT token.
"""

# Network Configuration
HORIZON_URL = "https://api.testnet.minepi.com"
NETWORK_PASSPHRASE = "Pi Testnet"
BASE_FEE = 1_000_000  # Transaction fee in stroops
TIMEOUT = 60  # Transaction timeout in seconds

# Token Configuration
ASSET_CODE = "FPT"  # Flappy Pi Token symbol
TOTAL_SUPPLY = "1000000"  # Initial supply (1 million FPT)
TRUSTLINE_LIMIT = "1000000000"  # Max tokens distributor can hold

# Account Configuration
# IMPORTANT: Replace these with your actual secret keys
# Your public key: SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I
ISSUER_SECRET = "YOUR_SECRET_KEY_HERE"  # Replace with your secret key (starts with S)
DISTRIBUTOR_SECRET = "YOUR_SECRET_KEY_HERE"  # You can use the same key for both

# Token Economics
TOKEN_DECIMALS = 7  # Standard Stellar asset precision
INITIAL_DISTRIBUTION = {
    "distributor": "1000000",  # 1M FPT to distributor
    "reserve": "0"  # Reserve for future distribution
}

# Game Integration Settings
GAME_REWARDS = {
    "high_score_bonus": "100",  # FPT reward for high scores
    "daily_bonus": "50",  # Daily login bonus
    "achievement_reward": "25",  # Achievement completion
    "tournament_prize": "500"  # Tournament winner prize
}

# Validation Settings
MIN_ACCOUNT_BALANCE = "10"  # Minimum XLM balance required
REQUIRED_SIGNATURES = 1  # Number of signatures required for transactions

def get_config():
    """Return the complete configuration dictionary."""
    return {
        "network": {
            "horizon_url": HORIZON_URL,
            "network_passphrase": NETWORK_PASSPHRASE,
            "base_fee": BASE_FEE,
            "timeout": TIMEOUT
        },
        "token": {
            "asset_code": ASSET_CODE,
            "total_supply": TOTAL_SUPPLY,
            "trustline_limit": TRUSTLINE_LIMIT,
            "decimals": TOKEN_DECIMALS
        },
        "accounts": {
            "issuer_secret": ISSUER_SECRET,
            "distributor_secret": DISTRIBUTOR_SECRET
        },
        "distribution": INITIAL_DISTRIBUTION,
        "game_rewards": GAME_REWARDS,
        "validation": {
            "min_account_balance": MIN_ACCOUNT_BALANCE,
            "required_signatures": REQUIRED_SIGNATURES
        }
    }

def validate_config():
    """Validate the configuration and return any issues."""
    issues = []
    
    if ISSUER_SECRET == "YOUR_SECRET_KEY_HERE":
        issues.append("Issuer secret key not configured")
    
    if DISTRIBUTOR_SECRET == "YOUR_SECRET_KEY_HERE":
        issues.append("Distributor secret key not configured")
    
    if not ASSET_CODE or len(ASSET_CODE) < 1:
        issues.append("Asset code must be specified")
    
    if not TOTAL_SUPPLY or not TOTAL_SUPPLY.isdigit():
        issues.append("Total supply must be a positive number")
    
    return issues

if __name__ == "__main__":
    print("FPT Token Manual Configuration")
    print("=" * 40)
    
    config = get_config()
    for section, values in config.items():
        print(f"\n{section.upper()}:")
        for key, value in values.items():
            if "secret" in key.lower():
                print(f"  {key}: {'*' * 20} (hidden)")
            else:
                print(f"  {key}: {value}")
    
    print("\nValidation:")
    issues = validate_config()
    if issues:
        print("❌ Configuration Issues:")
        for issue in issues:
            print(f"  - {issue}")
        print("\n💡 To fix:")
        print("1. Get your secret key from Pi Browser (testnet.minepi.com)")
        print("2. Edit this file and replace 'YOUR_SECRET_KEY_HERE' with your actual secret key")
        print("3. Save the file and run: python create_fpt_token_manual.py")
    else:
        print("✅ Configuration is valid")
