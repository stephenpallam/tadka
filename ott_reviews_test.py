#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://repo-loader-7.preview.emergentagent.com"

def test_ott_movie_reviews_endpoint():
    """Test the OTT Movie Reviews API endpoint"""
    print("=" * 80)
    print("TESTING OTT MOVIE REVIEWS API ENDPOINT")
    print("=" * 80)
    
    endpoint = f"{BACKEND_URL}/api/articles/sections/ott-movie-reviews"
    print(f"Testing endpoint: {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            
            # Check if response is a dictionary with expected keys
            if isinstance(data, dict):
                print(f"Response Keys: {list(data.keys())}")
                
                # Check for expected keys
                expected_keys = ["ott_movie_reviews", "web_series"]
                missing_keys = [key for key in expected_keys if key not in data]
                extra_keys = [key for key in data.keys() if key not in expected_keys]
                
                if missing_keys:
                    print(f"❌ MISSING KEYS: {missing_keys}")
                else:
                    print("✅ All expected keys present")
                
                if extra_keys:
                    print(f"ℹ️  EXTRA KEYS: {extra_keys}")
                
                # Check each array
                for key in expected_keys:
                    if key in data:
                        articles = data[key]
                        print(f"\n{key.upper()} ARRAY:")
                        print(f"  Type: {type(articles)}")
                        print(f"  Count: {len(articles) if isinstance(articles, list) else 'Not a list'}")
                        
                        if isinstance(articles, list) and len(articles) > 0:
                            print("  Sample Article Fields:")
                            sample = articles[0]
                            for field, value in sample.items():
                                print(f"    {field}: {type(value).__name__} = {str(value)[:50]}...")
                        elif isinstance(articles, list):
                            print("  ⚠️  Array is empty")
                        else:
                            print("  ❌ Not a list")
                
                print(f"\nFull Response Structure:")
                print(json.dumps(data, indent=2, default=str)[:1000] + "..." if len(str(data)) > 1000 else json.dumps(data, indent=2, default=str))
                
            else:
                print(f"❌ Response is not a dictionary: {type(data)}")
                print(f"Response: {data}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    return response.status_code == 200

def test_categories_exist():
    """Test if the required categories exist in the database"""
    print("\n" + "=" * 80)
    print("TESTING CATEGORY EXISTENCE")
    print("=" * 80)
    
    categories_endpoint = f"{BACKEND_URL}/api/categories"
    print(f"Fetching categories from: {categories_endpoint}")
    
    try:
        response = requests.get(categories_endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            categories = response.json()
            print(f"Total categories found: {len(categories)}")
            
            # Look for required categories
            required_categories = ["ott-movie-reviews", "ott-webseries-reviews"]
            found_categories = {}
            
            for category in categories:
                if category.get('slug') in required_categories:
                    found_categories[category.get('slug')] = category
            
            print(f"\nRequired Categories Check:")
            for req_cat in required_categories:
                if req_cat in found_categories:
                    cat_info = found_categories[req_cat]
                    print(f"✅ {req_cat}: Found (ID: {cat_info.get('id')}, Name: '{cat_info.get('name')}')")
                else:
                    print(f"❌ {req_cat}: NOT FOUND")
            
            # Show all categories for reference
            print(f"\nAll Categories:")
            for cat in categories:
                print(f"  - {cat.get('slug')} (ID: {cat.get('id')}, Name: '{cat.get('name')}')")
                
            return len(found_categories) == len(required_categories)
            
        else:
            print(f"❌ Failed to fetch categories: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_individual_category_articles():
    """Test individual category endpoints to see what articles exist"""
    print("\n" + "=" * 80)
    print("TESTING INDIVIDUAL CATEGORY ARTICLES")
    print("=" * 80)
    
    categories = ["ott-movie-reviews", "ott-webseries-reviews"]
    results = {}
    
    for category in categories:
        endpoint = f"{BACKEND_URL}/api/articles/category/{category}"
        print(f"\nTesting category: {category}")
        print(f"Endpoint: {endpoint}")
        
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                articles = response.json()
                print(f"Articles found: {len(articles)}")
                results[category] = articles
                
                if len(articles) > 0:
                    print("Sample articles:")
                    for i, article in enumerate(articles[:3]):  # Show first 3
                        print(f"  {i+1}. {article.get('title', 'No title')} (ID: {article.get('id')})")
                        print(f"     Author: {article.get('author', 'No author')}")
                        print(f"     Published: {article.get('published_at', 'No date')}")
                else:
                    print("  ⚠️  No articles found in this category")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                results[category] = []
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            results[category] = []
    
    return results

def main():
    """Main test function"""
    print(f"OTT MOVIE REVIEWS API TESTING")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    print()
    
    # Test 1: Check if categories exist
    categories_exist = test_categories_exist()
    
    # Test 2: Check individual category articles
    category_articles = test_individual_category_articles()
    
    # Test 3: Test the main endpoint
    endpoint_works = test_ott_movie_reviews_endpoint()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    print(f"✅ Categories exist: {'YES' if categories_exist else 'NO'}")
    print(f"✅ Endpoint responds: {'YES' if endpoint_works else 'NO'}")
    
    total_articles = sum(len(articles) for articles in category_articles.values())
    print(f"✅ Total articles found: {total_articles}")
    
    for category, articles in category_articles.items():
        print(f"   - {category}: {len(articles)} articles")
    
    if categories_exist and endpoint_works:
        print("\n🎉 OTT MOVIE REVIEWS API ENDPOINT IS WORKING!")
    else:
        print("\n⚠️  ISSUES FOUND - See details above")
    
    return categories_exist and endpoint_works

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)