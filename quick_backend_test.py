#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing API at: {API_URL}")

def test_health_check():
    """Test the health check endpoint"""
    print("\n--- Testing Health Check Endpoint (/api/) ---")
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Blog CMS API is running" and data.get("status") == "healthy":
                print("✅ Health check endpoint working correctly")
                return True
            else:
                print(f"❌ Health check returned unexpected data: {data}")
                return False
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {str(e)}")
        return False

def test_articles_endpoint():
    """Test the articles endpoint"""
    print("\n--- Testing Articles Endpoint (/api/articles) ---")
    try:
        response = requests.get(f"{API_URL}/articles", timeout=10)
        if response.status_code == 200:
            articles = response.json()
            if isinstance(articles, list) and len(articles) > 0:
                print(f"✅ Articles endpoint working correctly, returned {len(articles)} articles")
                # Check article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category", "view_count"]
                missing_fields = [field for field in required_fields if field not in article]
                if missing_fields:
                    print(f"⚠️ Articles missing fields: {missing_fields}")
                else:
                    print("✅ Article structure is correct")
                return True
            else:
                print(f"❌ Articles endpoint returned unexpected data: {articles}")
                return False
        else:
            print(f"❌ Articles endpoint failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Articles endpoint failed with error: {str(e)}")
        return False

def test_articles_by_category():
    """Test articles by category endpoints"""
    print("\n--- Testing Articles by Category Endpoints ---")
    categories_to_test = ['politics', 'movies']
    results = []
    
    for category in categories_to_test:
        try:
            print(f"\nTesting /api/articles/category/{category}")
            response = requests.get(f"{API_URL}/articles/category/{category}", timeout=10)
            if response.status_code == 200:
                articles = response.json()
                if isinstance(articles, list):
                    print(f"✅ {category} category endpoint working, returned {len(articles)} articles")
                    results.append(True)
                else:
                    print(f"❌ {category} category endpoint returned unexpected data: {articles}")
                    results.append(False)
            else:
                print(f"❌ {category} category endpoint failed with status code: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {category} category endpoint failed with error: {str(e)}")
            results.append(False)
    
    return all(results)

def test_database_connectivity():
    """Test database connectivity by seeding and retrieving data"""
    print("\n--- Testing Database Connectivity ---")
    try:
        # Test database seeding
        print("Testing database seeding...")
        response = requests.post(f"{API_URL}/seed-database", timeout=15)
        if response.status_code == 200:
            print("✅ Database seeding successful")
            
            # Test data retrieval after seeding
            print("Testing data retrieval after seeding...")
            response = requests.get(f"{API_URL}/categories", timeout=10)
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) > 0:
                    print(f"✅ Database connectivity working, retrieved {len(categories)} categories")
                    return True
                else:
                    print("❌ Database connectivity issue: no categories retrieved")
                    return False
            else:
                print(f"❌ Database connectivity issue: categories endpoint failed with status {response.status_code}")
                return False
        else:
            print(f"❌ Database seeding failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database connectivity test failed with error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("QUICK BACKEND API VERIFICATION TEST")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health check endpoint
    results.append(test_health_check())
    
    # Test 2: Articles endpoints
    results.append(test_articles_endpoint())
    results.append(test_articles_by_category())
    
    # Test 3: Database connectivity
    results.append(test_database_connectivity())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ ALL TESTS PASSED ({passed}/{total})")
        print("✅ Backend functionality is working correctly after frontend changes")
    else:
        print(f"❌ SOME TESTS FAILED ({passed}/{total})")
        print("❌ Backend functionality may have issues")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)