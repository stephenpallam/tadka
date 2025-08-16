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
    print("\n--- Testing Health Check Endpoint ---")
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Blog CMS API is running" and data.get("status") == "healthy":
                print("✅ Health check endpoint working correctly")
                return True
            else:
                print(f"❌ Health check returned unexpected data: {data}")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def test_database_seeding():
    """Test database seeding functionality"""
    print("\n--- Testing Database Seeding ---")
    try:
        response = requests.post(f"{API_URL}/seed-database")
        if response.status_code == 200:
            data = response.json()
            if "Database seeded successfully" in data.get("message", ""):
                print("✅ Database seeding working correctly")
                return True
            else:
                print(f"❌ Database seeding returned unexpected message: {data}")
                return False
        else:
            print(f"❌ Database seeding failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Database seeding failed with error: {e}")
        return False

def test_categories_api():
    """Test categories API"""
    print("\n--- Testing Categories API ---")
    try:
        # Test GET /categories
        response = requests.get(f"{API_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            if isinstance(categories, list) and len(categories) >= 10:
                print(f"✅ Categories API working correctly - Found {len(categories)} categories")
                return True
            else:
                print(f"❌ Categories API returned unexpected data: {len(categories) if isinstance(categories, list) else 'not a list'}")
                return False
        else:
            print(f"❌ Categories API failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Categories API failed with error: {e}")
        return False

def test_articles_api():
    """Test articles API"""
    print("\n--- Testing Articles API ---")
    try:
        # Test GET /articles
        response = requests.get(f"{API_URL}/articles")
        if response.status_code == 200:
            articles = response.json()
            if isinstance(articles, list) and len(articles) >= 20:
                print(f"✅ Articles API working correctly - Found {len(articles)} articles")
                
                # Test individual article endpoint
                if articles:
                    article_id = articles[0]["id"]
                    response = requests.get(f"{API_URL}/articles/{article_id}")
                    if response.status_code == 200:
                        article = response.json()
                        if "content" in article:
                            print("✅ Individual article endpoint working correctly")
                            return True
                        else:
                            print("❌ Individual article missing content field")
                            return False
                    else:
                        print(f"❌ Individual article endpoint failed with status {response.status_code}")
                        return False
                return True
            else:
                print(f"❌ Articles API returned unexpected data: {len(articles) if isinstance(articles, list) else 'not a list'}")
                return False
        else:
            print(f"❌ Articles API failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Articles API failed with error: {e}")
        return False

def test_movie_reviews_api():
    """Test movie reviews API"""
    print("\n--- Testing Movie Reviews API ---")
    try:
        response = requests.get(f"{API_URL}/movie-reviews")
        if response.status_code == 200:
            reviews = response.json()
            if isinstance(reviews, list) and len(reviews) >= 3:
                print(f"✅ Movie Reviews API working correctly - Found {len(reviews)} reviews")
                return True
            else:
                print(f"❌ Movie Reviews API returned unexpected data: {len(reviews) if isinstance(reviews, list) else 'not a list'}")
                return False
        else:
            print(f"❌ Movie Reviews API failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Movie Reviews API failed with error: {e}")
        return False

def test_featured_images_api():
    """Test featured images API"""
    print("\n--- Testing Featured Images API ---")
    try:
        response = requests.get(f"{API_URL}/featured-images")
        if response.status_code == 200:
            images = response.json()
            if isinstance(images, list) and len(images) >= 5:
                print(f"✅ Featured Images API working correctly - Found {len(images)} images")
                return True
            else:
                print(f"❌ Featured Images API returned unexpected data: {len(images) if isinstance(images, list) else 'not a list'}")
                return False
        else:
            print(f"❌ Featured Images API failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Featured Images API failed with error: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n--- Testing CORS Configuration ---")
    try:
        response = requests.get(f"{API_URL}/", headers={
            "Origin": "http://example.com"
        })
        if response.status_code == 200:
            if "Access-Control-Allow-Origin" in response.headers:
                print("✅ CORS configuration working correctly")
                return True
            else:
                print("❌ CORS headers missing")
                return False
        else:
            print(f"❌ CORS test failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed with error: {e}")
        return False

def test_authentication_basic():
    """Test basic authentication functionality"""
    print("\n--- Testing Basic Authentication ---")
    try:
        # Test admin login
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                print("✅ Admin login working correctly")
                return True
            else:
                print(f"❌ Admin login returned unexpected data: {data}")
                return False
        else:
            print(f"❌ Admin login failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin login failed with error: {e}")
        return False

def main():
    """Run all backend verification tests"""
    print("="*60)
    print("BACKEND VERIFICATION TEST SUITE")
    print("="*60)
    
    tests = [
        ("Health Check", test_health_check),
        ("Database Seeding", test_database_seeding),
        ("Categories API", test_categories_api),
        ("Articles API", test_articles_api),
        ("Movie Reviews API", test_movie_reviews_api),
        ("Featured Images API", test_featured_images_api),
        ("CORS Configuration", test_cors_configuration),
        ("Basic Authentication", test_authentication_basic),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed += 1
    
    print("\n" + "="*60)
    print("BACKEND VERIFICATION TEST SUMMARY")
    print("="*60)
    print(f"Total tests: {len(tests)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL BACKEND TESTS PASSED!")
        print("Backend functionality is working correctly after frontend section swap fix.")
        return True
    else:
        print(f"\n❌ {failed} BACKEND TESTS FAILED!")
        print("Some backend functionality may have issues.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)