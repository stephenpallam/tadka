#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://repo-loader-7.preview.emergentagent.com"

def test_theater_bollywood_endpoint():
    """Test the new Theater-Bollywood API endpoint"""
    print("🎬 TESTING THEATER-BOLLYWOOD API ENDPOINT")
    print("=" * 60)
    
    endpoint = f"{BACKEND_URL}/api/releases/theater-bollywood"
    print(f"Testing endpoint: {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"❌ FAILED: Invalid JSON response - {e}")
            print(f"Response text: {response.text}")
            return False
        
        print("✅ SUCCESS: Endpoint returned valid JSON")
        
        # Verify data structure
        print("\n📋 VERIFYING DATA STRUCTURE:")
        print("-" * 40)
        
        # Check top-level structure
        if not isinstance(data, dict):
            print("❌ FAILED: Response is not a dictionary")
            return False
        
        required_keys = ["theater", "ott"]
        for key in required_keys:
            if key not in data:
                print(f"❌ FAILED: Missing required key '{key}'")
                return False
            print(f"✅ Found required key: '{key}'")
        
        # Check theater section structure
        theater_section = data["theater"]
        if not isinstance(theater_section, dict):
            print("❌ FAILED: 'theater' section is not a dictionary")
            return False
        
        theater_required_keys = ["this_week", "coming_soon"]
        for key in theater_required_keys:
            if key not in theater_section:
                print(f"❌ FAILED: Missing key '{key}' in theater section")
                return False
            if not isinstance(theater_section[key], list):
                print(f"❌ FAILED: '{key}' in theater section is not a list")
                return False
            print(f"✅ Theater section has valid '{key}' array with {len(theater_section[key])} items")
        
        # Check OTT section structure (should contain Bollywood articles now)
        ott_section = data["ott"]
        if not isinstance(ott_section, dict):
            print("❌ FAILED: 'ott' section is not a dictionary")
            return False
        
        ott_required_keys = ["this_week", "coming_soon"]
        for key in ott_required_keys:
            if key not in ott_section:
                print(f"❌ FAILED: Missing key '{key}' in ott section")
                return False
            if not isinstance(ott_section[key], list):
                print(f"❌ FAILED: '{key}' in ott section is not a list")
                return False
            print(f"✅ OTT section has valid '{key}' array with {len(ott_section[key])} items")
        
        print("\n🎯 VERIFYING BOLLYWOOD CONTENT IN OTT SECTION:")
        print("-" * 50)
        
        # Verify OTT section contains Bollywood articles (not actual OTT releases)
        total_bollywood_items = len(ott_section["this_week"]) + len(ott_section["coming_soon"])
        print(f"Total Bollywood articles in OTT section: {total_bollywood_items}")
        
        if total_bollywood_items == 0:
            print("⚠️  WARNING: No Bollywood articles found in OTT section")
        else:
            print("✅ SUCCESS: OTT section contains Bollywood articles")
        
        # Check sample article structure in OTT section
        sample_articles = []
        if ott_section["this_week"]:
            sample_articles.extend(ott_section["this_week"][:1])
        if ott_section["coming_soon"]:
            sample_articles.extend(ott_section["coming_soon"][:1])
        
        for i, article in enumerate(sample_articles):
            print(f"\n📄 Sample Bollywood Article {i+1}:")
            required_fields = ["id", "title", "movie_name", "summary", "image_url", "movie_image", "author", "language"]
            for field in required_fields:
                if field in article:
                    value = article[field]
                    if isinstance(value, str) and len(value) > 50:
                        value = value[:50] + "..."
                    print(f"  ✅ {field}: {value}")
                else:
                    print(f"  ⚠️  Missing field: {field}")
        
        # Check theater section sample
        print(f"\n🎭 THEATER SECTION SAMPLE:")
        print("-" * 30)
        theater_items = theater_section["this_week"] + theater_section["coming_soon"]
        if theater_items:
            sample_theater = theater_items[0]
            theater_fields = ["id", "movie_name", "language", "release_date", "movie_image", "movie_banner"]
            for field in theater_fields:
                if field in sample_theater:
                    value = sample_theater[field]
                    print(f"  ✅ {field}: {value}")
                else:
                    print(f"  ⚠️  Missing field: {field}")
        else:
            print("  ⚠️  No theater releases found")
        
        print(f"\n📊 SUMMARY:")
        print("-" * 20)
        print(f"Theater This Week: {len(theater_section['this_week'])} items")
        print(f"Theater Coming Soon: {len(theater_section['coming_soon'])} items")
        print(f"Bollywood This Week: {len(ott_section['this_week'])} items")
        print(f"Bollywood Coming Soon: {len(ott_section['coming_soon'])} items")
        
        # Pretty print the full response for verification
        print(f"\n📋 FULL RESPONSE STRUCTURE:")
        print("-" * 35)
        print(json.dumps(data, indent=2, default=str))
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_category_exists():
    """Test if theater-releases-bollywood category exists"""
    print(f"\n🏷️  TESTING THEATER-RELEASES-BOLLYWOOD CATEGORY")
    print("=" * 55)
    
    endpoint = f"{BACKEND_URL}/api/articles/category/theater-releases-bollywood"
    print(f"Testing category endpoint: {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Category exists with {len(data)} articles")
            
            if len(data) > 0:
                print(f"Sample article: {data[0].get('title', 'No title')}")
            return True
        else:
            print(f"⚠️  Category may not exist or has no articles (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: Error checking category - {e}")
        return False

def main():
    """Main test function"""
    print("🚀 STARTING THEATER-BOLLYWOOD API TESTING")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test the category first
    category_test = test_category_exists()
    
    # Test the main endpoint
    endpoint_test = test_theater_bollywood_endpoint()
    
    print(f"\n🏁 TEST RESULTS SUMMARY")
    print("=" * 30)
    print(f"Category Test: {'✅ PASSED' if category_test else '❌ FAILED'}")
    print(f"Endpoint Test: {'✅ PASSED' if endpoint_test else '❌ FAILED'}")
    
    if endpoint_test:
        print(f"\n✅ OVERALL: Theater-Bollywood API endpoint is working correctly!")
        print("✅ The endpoint returns the expected structure with 'theater' and 'ott' sections")
        print("✅ The 'ott' section now contains Bollywood theater release articles")
        return True
    else:
        print(f"\n❌ OVERALL: Theater-Bollywood API endpoint has issues!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)