#!/usr/bin/env python3
"""
FPT Token Setup Assistant
========================
This script helps you set up the FPT token configuration interactively.
"""

import os
import sys

def print_banner():
    print("=" * 60)
    print("🚀 FPT (Flappy Pi Token) Setup Assistant")
    print("=" * 60)
    print()

def get_user_input(prompt, default=None, required=True):
    """Get user input with optional default value."""
    if default:
        full_prompt = f"{prompt} [{default}]: "
    else:
        full_prompt = f"{prompt}: "
    
    while True:
        value = input(full_prompt).strip()
        if value:
            return value
        elif default and not required:
            return default
        elif not required:
            return ""
        else:
            print("❌ This field is required. Please enter a value.")

def validate_secret_key(key):
    """Basic validation for Stellar secret key format."""
    if not key:
        return False
    if len(key) != 56:
        return False
    if not key.startswith('S'):
        return False
    return True

def update_config_file(issuer_secret, distributor_secret, asset_code, total_supply):
    """Update the configuration file with user inputs."""
    config_content = f'''"""
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
ASSET_CODE = "{asset_code}"  # Flappy Pi Token symbol
TOTAL_SUPPLY = "{total_supply}"  # Initial supply
TRUSTLINE_LIMIT = "1000000000"  # Max tokens distributor can hold

# Account Configuration (REPLACE WITH YOUR ACTUAL KEYS)
ISSUER_SECRET = "{issuer_secret}"  # Your issuer account secret key
DISTRIBUTOR_SECRET = "{distributor_secret}"  # Your distributor account secret key

# Token Economics (Optional - for documentation)
TOKEN_DECIMALS = 7  # Standard Stellar asset precision
INITIAL_DISTRIBUTION = {{
    "distributor": "{total_supply}",  # FPT to distributor
    "reserve": "0"  # Reserve for future distribution
}}

# Game Integration Settings
GAME_REWARDS = {{
    "high_score_bonus": "100",  # FPT reward for high scores
    "daily_bonus": "50",  # Daily login bonus
    "achievement_reward": "25",  # Achievement completion
    "tournament_prize": "500"  # Tournament winner prize
}}

# Validation Settings
MIN_ACCOUNT_BALANCE = "10"  # Minimum XLM balance required
REQUIRED_SIGNATURES = 1  # Number of signatures required for transactions

def get_config():
    """Return the complete configuration dictionary."""
    return {{
        "network": {{
            "horizon_url": HORIZON_URL,
            "network_passphrase": NETWORK_PASSPHRASE,
            "base_fee": BASE_FEE,
            "timeout": TIMEOUT
        }},
        "token": {{
            "asset_code": ASSET_CODE,
            "total_supply": TOTAL_SUPPLY,
            "trustline_limit": TRUSTLINE_LIMIT,
            "decimals": TOKEN_DECIMALS
        }},
        "accounts": {{
            "issuer_secret": ISSUER_SECRET,
            "distributor_secret": DISTRIBUTOR_SECRET
        }},
        "distribution": INITIAL_DISTRIBUTION,
        "game_rewards": GAME_REWARDS,
        "validation": {{
            "min_account_balance": MIN_ACCOUNT_BALANCE,
            "required_signatures": REQUIRED_SIGNATURES
        }}
    }}

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
        print(f"\\n{{section.upper()}}:")
        for key, value in values.items():
            if "secret" in key.lower():
                print(f"  {{key}}: {'*' * 20} (hidden)")
            else:
                print(f"  {{key}}: {{value}}")
    
    print("\\nValidation:")
    issues = validate_config()
    if issues:
        print("❌ Configuration Issues:")
        for issue in issues:
            print(f"  - {{issue}}")
    else:
        print("✅ Configuration is valid")
'''
    
    with open('fpt_config.py', 'w') as f:
        f.write(config_content)
    
    print("✅ Configuration file updated successfully!")

def main():
    print_banner()
    
    print("This assistant will help you configure the FPT token setup.")
    print("You'll need two Pi Testnet accounts with secret keys.")
    print()
    
    # Get account information
    print("🔑 Account Configuration")
    print("-" * 30)
    
    issuer_secret = get_user_input("Enter your ISSUER account secret key")
    if not validate_secret_key(issuer_secret):
        print("❌ Invalid secret key format. Secret keys should be 56 characters starting with 'S'")
        sys.exit(1)
    
    distributor_secret = get_user_input("Enter your DISTRIBUTOR account secret key")
    if not validate_secret_key(distributor_secret):
        print("❌ Invalid secret key format. Secret keys should be 56 characters starting with 'S'")
        sys.exit(1)
    
    print()
    print("🎯 Token Configuration")
    print("-" * 30)
    
    asset_code = get_user_input("Enter token symbol", "FPT", required=False)
    if not asset_code:
        asset_code = "FPT"
    
    total_supply = get_user_input("Enter initial supply", "1000000", required=False)
    if not total_supply:
        total_supply = "1000000"
    
    print()
    print("📝 Summary")
    print("-" * 30)
    print(f"Token Symbol: {asset_code}")
    print(f"Initial Supply: {total_supply}")
    print(f"Issuer Account: {issuer_secret[:8]}...{issuer_secret[-8:]}")
    print(f"Distributor Account: {distributor_secret[:8]}...{distributor_secret[-8:]}")
    
    confirm = get_user_input("Proceed with this configuration? (y/n)", "y", required=False)
    if confirm.lower() not in ['y', 'yes']:
        print("❌ Setup cancelled.")
        sys.exit(0)
    
    # Update configuration file
    update_config_file(issuer_secret, distributor_secret, asset_code, total_supply)
    
    print()
    print("🎉 Setup Complete!")
    print("=" * 30)
    print("Next steps:")
    print("1. Make sure both accounts are funded on Pi Testnet")
    print("2. Run: python create_fpt_token.py")
    print("3. Check the results and verify token creation")
    print()
    print("📚 For more information, see FPT_TOKEN_SETUP_README.md")

if __name__ == "__main__":
    main()
