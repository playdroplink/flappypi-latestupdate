"""
FPT (Flappy Pi Token) Configuration
==================================
This file contains all configurable parameters for the FPT token.
Modify these values to customize your token setup.
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

# Account Configuration (REPLACE WITH YOUR ACTUAL KEYS)
ISSUER_SECRET = "<issuer key>"  # Your issuer account secret key
DISTRIBUTOR_SECRET = "<distributor key>"  # Your distributor account secret key

# Token Economics (Optional - for documentation)
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
    
    if ISSUER_SECRET == "<issuer key>":
        issues.append("Issuer secret key not configured")
    
    if DISTRIBUTOR_SECRET == "<distributor key>":
        issues.append("Distributor secret key not configured")
    
    if not ASSET_CODE or len(ASSET_CODE) < 1:
        issues.append("Asset code must be specified")
    
    if not TOTAL_SUPPLY or not TOTAL_SUPPLY.isdigit():
        issues.append("Total supply must be a positive number")
    
    return issues

if __name__ == "__main__":
    print("FPT Token Configuration")
    print("=" * 30)
    
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
    else:
        print("✅ Configuration is valid")
