#!/usr/bin/env python3
"""
Politics Section Backend API Testing
Testing the Politics section dynamic data integration backend implementation
"""

import requests
import json
from datetime import datetime, timezone
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://repo-loader-7.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def test_politics_section_api():
    """Test the main Politics section API endpoint"""
    print("🎯 TESTING POLITICS SECTION API ENDPOINT")
    print("=" * 60)
    
    try:
        # Test GET /api/articles/sections/politics
        url = f"{API_BASE}/articles/sections/politics"
        print(f"Testing: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Parse JSON response
        try:
            data = response.json()
            print(f"✅ SUCCESS: Valid JSON response received")
        except json.JSONDecodeError as e:
            print(f"❌ FAILED: Invalid JSON response - {e}")
            return False
        
        # Check response structure
        if not isinstance(data, dict):
            print(f"❌ FAILED: Response should be a dictionary, got {type(data)}")
            return False
        
        # Check for required keys
        required_keys = ["state_politics", "national_politics"]
        for key in required_keys:
            if key not in data:
                print(f"❌ FAILED: Missing required key '{key}' in response")
                return False
            
            if not isinstance(data[key], list):
                print(f"❌ FAILED: '{key}' should be a list, got {type(data[key])}")
                return False
        
        print(f"✅ SUCCESS: Response has correct structure with keys: {list(data.keys())}")
        
        # Test each category
        state_count = len(data["state_politics"])
        national_count = len(data["national_politics"])
        
        print(f"📊 DATA SUMMARY:")
        print(f"   State Politics Articles: {state_count}")
        print(f"   National Politics Articles: {national_count}")
        
        # Test article structure for both categories
        categories_tested = 0
        total_articles_tested = 0
        
        for category_name, articles in data.items():
            print(f"\n🔍 TESTING {category_name.upper()} ARTICLES:")
            
            if not articles:
                print(f"⚠️  WARNING: No articles found in {category_name}")
                continue
            
            categories_tested += 1
            
            for i, article in enumerate(articles[:2]):  # Test first 2 articles from each category
                total_articles_tested += 1
                print(f"   Article {i+1}: Testing structure...")
                
                # Check required fields
                required_fields = [
                    "id", "title", "summary", "image_url", "author", 
                    "category", "published_at", "is_published"
                ]
                
                missing_fields = []
                for field in required_fields:
                    if field not in article:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ FAILED: Missing fields: {missing_fields}")
                    return False
                
                # Validate field types and values
                if not isinstance(article["id"], int):
                    print(f"   ❌ FAILED: 'id' should be integer, got {type(article['id'])}")
                    return False
                
                if not isinstance(article["title"], str) or len(article["title"]) < 5:
                    print(f"   ❌ FAILED: 'title' should be non-empty string, got '{article['title']}'")
                    return False
                
                if not isinstance(article["summary"], str) or len(article["summary"]) < 10:
                    print(f"   ❌ FAILED: 'summary' should be substantial string, got '{article['summary'][:50]}...'")
                    return False
                
                if not isinstance(article["author"], str) or len(article["author"]) < 2:
                    print(f"   ❌ FAILED: 'author' should be non-empty string, got '{article['author']}'")
                    return False
                
                # Check if article is published
                if not article.get("is_published", False):
                    print(f"   ❌ FAILED: Article should be published, got is_published={article.get('is_published')}")
                    return False
                
                # Check published date is not in future
                if article.get("published_at"):
                    try:
                        pub_date = datetime.fromisoformat(article["published_at"].replace('Z', '+00:00'))
                        current_date = datetime.now(timezone.utc)
                        
                        if pub_date > current_date:
                            print(f"   ❌ FAILED: Article published in future: {article['published_at']}")
                            return False
                    except Exception as e:
                        print(f"   ⚠️  WARNING: Could not parse published_at date: {e}")
                
                # Check category matches expected politics categories
                category = article.get("category", "")
                expected_categories = ["state-politics", "national-politics", "politics"]
                if category not in expected_categories:
                    print(f"   ⚠️  WARNING: Unexpected category '{category}', expected one of {expected_categories}")
                
                print(f"   ✅ Article {i+1}: ID={article['id']}, Title='{article['title'][:30]}...', Category='{category}'")
        
        print(f"\n📈 TESTING SUMMARY:")
        print(f"   Categories with articles: {categories_tested}/2")
        print(f"   Total articles tested: {total_articles_tested}")
        
        if categories_tested == 0:
            print(f"❌ FAILED: No articles found in any politics category")
            return False
        
        print(f"✅ SUCCESS: Politics section API endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Network error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_individual_category_endpoints():
    """Test individual category endpoints for politics"""
    print("\n🎯 TESTING INDIVIDUAL POLITICS CATEGORY ENDPOINTS")
    print("=" * 60)
    
    categories = [
        ("state-politics", "State Politics"),
        ("national-politics", "National Politics"),
        ("politics", "General Politics")
    ]
    
    working_categories = []
    
    for category_slug, category_name in categories:
        print(f"\n🔍 Testing {category_name} category:")
        
        try:
            url = f"{API_BASE}/articles/category/{category_slug}"
            print(f"   URL: {url}")
            
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        article_count = len(data)
                        print(f"   ✅ SUCCESS: Found {article_count} articles in {category_name}")
                        
                        if article_count > 0:
                            # Test first article structure
                            article = data[0]
                            print(f"   📄 Sample Article: '{article.get('title', 'No title')[:40]}...'")
                            working_categories.append(category_slug)
                        else:
                            print(f"   ⚠️  WARNING: No articles in {category_name}")
                    else:
                        print(f"   ❌ FAILED: Expected list, got {type(data)}")
                except json.JSONDecodeError:
                    print(f"   ❌ FAILED: Invalid JSON response")
            else:
                print(f"   ❌ FAILED: HTTP {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAILED: Network error - {e}")
        except Exception as e:
            print(f"   ❌ FAILED: Error - {e}")
    
    print(f"\n📊 CATEGORY ENDPOINT SUMMARY:")
    print(f"   Working categories: {len(working_categories)}/3")
    print(f"   Categories with data: {working_categories}")
    
    return len(working_categories) > 0

def test_data_quality_and_completeness():
    """Test data quality and completeness for politics articles"""
    print("\n🎯 TESTING DATA QUALITY AND COMPLETENESS")
    print("=" * 60)
    
    try:
        # Get politics data
        url = f"{API_BASE}/articles/sections/politics"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Could not fetch politics data")
            return False
        
        data = response.json()
        
        # Analyze data quality
        total_articles = 0
        quality_issues = []
        
        for category_name, articles in data.items():
            total_articles += len(articles)
            
            for article in articles:
                # Check for quality issues
                if len(article.get("title", "")) < 10:
                    quality_issues.append(f"Short title in {category_name}: '{article.get('title')}'")
                
                if len(article.get("summary", "")) < 20:
                    quality_issues.append(f"Short summary in {category_name}: Article ID {article.get('id')}")
                
                if not article.get("image_url"):
                    quality_issues.append(f"Missing image in {category_name}: Article ID {article.get('id')}")
                
                if not article.get("author"):
                    quality_issues.append(f"Missing author in {category_name}: Article ID {article.get('id')}")
        
        print(f"📊 DATA QUALITY ANALYSIS:")
        print(f"   Total articles analyzed: {total_articles}")
        print(f"   Quality issues found: {len(quality_issues)}")
        
        if quality_issues:
            print(f"   ⚠️  Quality Issues:")
            for issue in quality_issues[:5]:  # Show first 5 issues
                print(f"      - {issue}")
            if len(quality_issues) > 5:
                print(f"      ... and {len(quality_issues) - 5} more issues")
        
        # Check if we have sufficient content
        if total_articles == 0:
            print(f"❌ FAILED: No politics articles found")
            return False
        elif total_articles < 4:
            print(f"⚠️  WARNING: Only {total_articles} politics articles found, may need more content")
        else:
            print(f"✅ SUCCESS: Sufficient politics content available ({total_articles} articles)")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error analyzing data quality - {e}")
        return False

def test_frontend_compatibility():
    """Test if the API response structure matches frontend expectations"""
    print("\n🎯 TESTING FRONTEND COMPATIBILITY")
    print("=" * 60)
    
    try:
        url = f"{API_BASE}/articles/sections/politics"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Could not fetch politics data")
            return False
        
        data = response.json()
        
        # Check if structure matches what Politics component expects
        print("🔍 Checking frontend compatibility:")
        
        # Should have state_politics and national_politics arrays
        if "state_politics" not in data or "national_politics" not in data:
            print("❌ FAILED: Missing required arrays for tabbed interface")
            return False
        
        # Check if articles have fields needed for frontend display
        required_frontend_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
        
        compatibility_issues = []
        
        for category_name, articles in data.items():
            for article in articles[:1]:  # Check first article from each category
                for field in required_frontend_fields:
                    if field not in article:
                        compatibility_issues.append(f"Missing {field} in {category_name}")
                    elif not article[field]:
                        compatibility_issues.append(f"Empty {field} in {category_name}")
        
        if compatibility_issues:
            print(f"❌ FAILED: Frontend compatibility issues:")
            for issue in compatibility_issues:
                print(f"   - {issue}")
            return False
        
        print("✅ SUCCESS: API response structure is compatible with frontend Politics component")
        
        # Test state vs national categorization
        state_articles = data.get("state_politics", [])
        national_articles = data.get("national_politics", [])
        
        print(f"📊 CATEGORIZATION CHECK:")
        print(f"   State Politics: {len(state_articles)} articles")
        print(f"   National Politics: {len(national_articles)} articles")
        
        if len(state_articles) == 0 and len(national_articles) == 0:
            print("⚠️  WARNING: No articles in either category")
        else:
            print("✅ SUCCESS: Articles properly categorized for state vs national tabs")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing frontend compatibility - {e}")
        return False

def main():
    """Run all Politics section backend API tests"""
    print("🚀 POLITICS SECTION BACKEND API TESTING")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 80)
    
    tests = [
        ("Politics Section API Endpoint", test_politics_section_api),
        ("Individual Category Endpoints", test_individual_category_endpoints),
        ("Data Quality and Completeness", test_data_quality_and_completeness),
        ("Frontend Compatibility", test_frontend_compatibility)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
            
            if result:
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
                
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
            results.append((test_name, False))
    
    # Final summary
    print(f"\n{'='*80}")
    print("🎯 POLITICS SECTION BACKEND API TESTING SUMMARY")
    print(f"{'='*80}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    print(f"\nDetailed Results:")
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {status}: {test_name}")
    
    if passed == total:
        print(f"\n🎉 ALL TESTS PASSED! Politics section backend API is working correctly.")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Politics section backend needs attention.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)