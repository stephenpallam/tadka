#!/usr/bin/env python3
import requests
import json
import sys

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

def test_categories_endpoint():
    """Test the categories endpoint without seeding"""
    print("\n--- Testing Categories Endpoint ---")
    try:
        response = requests.get(f"{API_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories endpoint working. Found {len(categories)} categories")
            return True
        else:
            print(f"❌ Categories endpoint failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Categories endpoint failed with error: {e}")
        return False

def test_articles_endpoint():
    """Test the articles endpoint without seeding"""
    print("\n--- Testing Articles Endpoint ---")
    try:
        response = requests.get(f"{API_URL}/articles")
        if response.status_code == 200:
            articles = response.json()
            print(f"✅ Articles endpoint working. Found {len(articles)} articles")
            return True
        else:
            print(f"❌ Articles endpoint failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Articles endpoint failed with error: {e}")
        return False

def test_movie_reviews_endpoint():
    """Test the movie reviews endpoint without seeding"""
    print("\n--- Testing Movie Reviews Endpoint ---")
    try:
        response = requests.get(f"{API_URL}/movie-reviews")
        if response.status_code == 200:
            reviews = response.json()
            print(f"✅ Movie Reviews endpoint working. Found {len(reviews)} reviews")
            return True
        else:
            print(f"❌ Movie Reviews endpoint failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Movie Reviews endpoint failed with error: {e}")
        return False

def test_featured_images_endpoint():
    """Test the featured images endpoint without seeding"""
    print("\n--- Testing Featured Images Endpoint ---")
    try:
        response = requests.get(f"{API_URL}/featured-images")
        if response.status_code == 200:
            images = response.json()
            print(f"✅ Featured Images endpoint working. Found {len(images)} images")
            return True
        else:
            print(f"❌ Featured Images endpoint failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Featured Images endpoint failed with error: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n--- Testing CORS Configuration ---")
    try:
        # Test OPTIONS request
        response = requests.options(f"{API_URL}/", headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET"
        })
        if response.status_code == 200:
            if "Access-Control-Allow-Origin" in response.headers:
                print("✅ CORS configuration working correctly")
                return True
            else:
                print("❌ CORS headers missing")
                return False
        else:
            print(f"❌ CORS OPTIONS request failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed with error: {e}")
        return False

def test_authentication_endpoints():
    """Test authentication endpoints"""
    print("\n--- Testing Authentication Endpoints ---")
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
                print("✅ Authentication system working correctly")
                return True
            else:
                print(f"❌ Authentication response missing required fields: {data}")
                return False
        else:
            print(f"❌ Authentication failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Authentication test failed with error: {e}")
        return False

def main():
    """Run all tests"""
    print("="*80)
    print("BACKEND API TESTING AFTER DRAG-AND-DROP HOME.JSX RESTRUCTURE")
    print("="*80)
    
    tests = [
        ("Health Check", test_health_check),
        ("Categories API", test_categories_endpoint),
        ("Articles API", test_articles_endpoint),
        ("Movie Reviews API", test_movie_reviews_endpoint),
        ("Featured Images API", test_featured_images_endpoint),
        ("CORS Configuration", test_cors_configuration),
        ("Authentication System", test_authentication_endpoints)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        if test_func():
            passed += 1
    
    print(f"\n{'='*80}")
    print(f"TEST SUMMARY")
    print(f"{'='*80}")
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✅ ALL BACKEND TESTS PASSED!")
        print("Backend functionality remains fully intact after drag-and-drop Home.jsx restructure.")
        return 0
    else:
        print("❌ SOME BACKEND TESTS FAILED!")
        print("Backend functionality may have been affected by the frontend changes.")
        return 1

if __name__ == "__main__":
    sys.exit(main())