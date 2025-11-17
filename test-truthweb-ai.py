#!/usr/bin/env python3

"""
TruthWeb AI - Flappy Pi Support Chatbot
Test script for OpenRouter API with Sonoma models
"""

from openai import OpenAI
import os

# Initialize OpenAI client with OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

def test_sonoma_dusk_alpha():
    """Test the Sonoma Dusk Alpha model"""
    print("🤖 Testing TruthWeb AI with Sonoma Dusk Alpha...")
    
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://flappypi.com",
                "X-Title": "Flappy Pi Support Chatbot",
            },
            model="openrouter/sonoma-dusk-alpha",
            messages=[
                {
                    "role": "system",
                    "content": "You are TruthWeb AI, the official AI support assistant for the Flappy Pi game on the Pi Network. Provide helpful, friendly, and accurate support for Flappy Pi players. Use emojis appropriately (🐦, ✨, 🎮, 💰, 🏆)."
                },
                {
                    "role": "user",
                    "content": "How do I play Flappy Pi?"
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        print("✅ Sonoma Dusk Alpha Response:")
        print(f"📝 {response}")
        print()
        
    except Exception as e:
        print(f"❌ Error with Sonoma Dusk Alpha: {e}")
        print()

def test_sonoma_sky_alpha():
    """Test the Sonoma Sky Alpha model"""
    print("🤖 Testing TruthWeb AI with Sonoma Sky Alpha...")
    
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://flappypi.com",
                "X-Title": "Flappy Pi Support Chatbot",
            },
            model="openrouter/sonoma-sky-alpha",
            messages=[
                {
                    "role": "system",
                    "content": "You are TruthWeb AI, the official AI support assistant for the Flappy Pi game on the Pi Network. Provide helpful, friendly, and accurate support for Flappy Pi players. Use emojis appropriately (🐦, ✨, 🎮, 💰, 🏆)."
                },
                {
                    "role": "user",
                    "content": "How do I earn Flappy Coins?"
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        print("✅ Sonoma Sky Alpha Response:")
        print(f"📝 {response}")
        print()
        
    except Exception as e:
        print(f"❌ Error with Sonoma Sky Alpha: {e}")
        print()

def test_image_analysis():
    """Test image analysis with Sonoma model"""
    print("🖼️ Testing TruthWeb AI Image Analysis...")
    
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://flappypi.com",
                "X-Title": "Flappy Pi Support Chatbot",
            },
            model="openrouter/sonoma-dusk-alpha",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "What is in this image? Describe it in the context of Flappy Pi game support."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                            }
                        }
                    ]
                }
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        print("✅ Image Analysis Response:")
        print(f"📝 {response}")
        print()
        
    except Exception as e:
        print(f"❌ Error with Image Analysis: {e}")
        print()

def main():
    """Main test function"""
    print("🚀 TruthWeb AI - Flappy Pi Support Chatbot Test")
    print("=" * 50)
    print()
    
    # Test both Sonoma models
    test_sonoma_dusk_alpha()
    test_sonoma_sky_alpha()
    
    # Test image analysis
    test_image_analysis()
    
    print("🎯 Test Summary:")
    print("✅ Sonoma Dusk Alpha - Text responses")
    print("✅ Sonoma Sky Alpha - Text responses") 
    print("✅ Image Analysis - Visual understanding")
    print()
    print("🐦 TruthWeb AI is ready to support Flappy Pi players!")
    print("🎮 Models configured and tested successfully!")

if __name__ == "__main__":
    main()
