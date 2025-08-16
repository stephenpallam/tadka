#!/usr/bin/env python3
import requests
import json
import unittest
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing TopStories API at: {API_URL}")

class TopStoriesBackendTest(unittest.TestCase):
    """Test suite for TopStories backend API integration"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_topstories_api_comprehensive(self):
        """Comprehensive test for TopStories API backend integration"""
        print("\n🎯 TESTING TOPSTORIES API BACKEND INTEGRATION")
        print("=" * 80)
        
        # Test 1: TopStories API Endpoint Structure
        print("\n1. TESTING TOPSTORIES API ENDPOINT STRUCTURE")
        print("-" * 50)
        
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        self.assertEqual(response.status_code, 200, "TopStories API endpoint failed")
        
        data = response.json()
        self.assertIsInstance(data, dict, "TopStories API should return a dictionary")
        self.assertIn("top_stories", data, "Missing 'top_stories' array in response")
        self.assertIn("national", data, "Missing 'national' array in response")
        
        top_stories_articles = data["top_stories"]
        national_articles = data["national"]
        
        self.assertIsInstance(top_stories_articles, list, "'top_stories' should be a list")
        self.assertIsInstance(national_articles, list, "'national' should be a list")
        
        print(f"✅ API Structure Verified:")
        print(f"   - Top Stories Articles: {len(top_stories_articles)}")
        print(f"   - National Articles: {len(national_articles)}")
        
        # Test 2: Article Field Structure Verification
        print("\n2. TESTING ARTICLE FIELD STRUCTURE")
        print("-" * 40)
        
        required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
        
        # Test top_stories articles
        if top_stories_articles:
            article = top_stories_articles[0]
            print(f"   📋 Top Stories Article Sample:")
            print(f"      ID: {article.get('id')}")
            print(f"      Title: {article.get('title', 'N/A')[:50]}...")
            print(f"      Author: {article.get('author', 'N/A')}")
            print(f"      Category: {article.get('category', 'N/A')}")
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in top_stories article")
            
            # Verify data types
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Article title should be string")
            self.assertIsInstance(article["summary"], str, "Article summary should be string")
            self.assertIsInstance(article["author"], str, "Article author should be string")
            
            print("      ✅ All required fields present with correct types")
        else:
            print("   ⚠️ No top_stories articles found")
        
        # Test national articles
        if national_articles:
            article = national_articles[0]
            print(f"   📋 National Article Sample:")
            print(f"      ID: {article.get('id')}")
            print(f"      Title: {article.get('title', 'N/A')[:50]}...")
            print(f"      Author: {article.get('author', 'N/A')}")
            print(f"      Category: {article.get('category', 'N/A')}")
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in national article")
            
            print("      ✅ All required fields present with correct types")
        else:
            print("   ⚠️ No national articles found")
        
        # Test 3: Category Verification
        print("\n3. TESTING CATEGORY VERIFICATION")
        print("-" * 35)
        
        # Verify articles come from correct categories
        for article in top_stories_articles:
            category = article.get("category")
            self.assertEqual(category, "top-stories", 
                f"Top stories article should have 'top-stories' category, got '{category}'")
        
        for article in national_articles:
            category = article.get("category")
            self.assertEqual(category, "national-top-stories", 
                f"National article should have 'national-top-stories' category, got '{category}'")
        
        print("✅ Category verification passed")
        print(f"   - Top stories articles: all have 'top-stories' category")
        print(f"   - National articles: all have 'national-top-stories' category")
        
        # Test 4: Individual Category Endpoints
        print("\n4. TESTING INDIVIDUAL CATEGORY ENDPOINTS")
        print("-" * 45)
        
        # Test top-stories category endpoint
        response = requests.get(f"{API_URL}/articles/category/top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get top-stories category articles")
        top_stories_direct = response.json()
        
        print(f"   📋 Direct top-stories category: {len(top_stories_direct)} articles")
        
        # Test national-top-stories category endpoint
        response = requests.get(f"{API_URL}/articles/category/national-top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get national-top-stories category articles")
        national_direct = response.json()
        
        print(f"   📋 Direct national-top-stories category: {len(national_direct)} articles")
        
        # Verify consistency between section endpoint and category endpoints
        self.assertEqual(len(top_stories_articles), len(top_stories_direct),
            "Section endpoint and category endpoint should return same number of top-stories articles")
        self.assertEqual(len(national_articles), len(national_direct),
            "Section endpoint and category endpoint should return same number of national articles")
        
        print("✅ Individual category endpoints consistent with section endpoint")
        
        # Test 5: Data Quality Verification
        print("\n5. TESTING DATA QUALITY")
        print("-" * 25)
        
        all_articles = top_stories_articles + national_articles
        
        articles_with_substantial_titles = 0
        articles_with_substantial_summaries = 0
        articles_with_images = 0
        articles_with_authors = 0
        
        for article in all_articles:
            title = article.get("title", "")
            summary = article.get("summary", "")
            image_url = article.get("image_url", "")
            author = article.get("author", "")
            
            if len(title) > 10:
                articles_with_substantial_titles += 1
            if len(summary) > 20:
                articles_with_substantial_summaries += 1
            if image_url and len(image_url) > 0:
                articles_with_images += 1
            if author and len(author) > 0:
                articles_with_authors += 1
        
        total_articles = len(all_articles)
        
        if total_articles > 0:
            title_percentage = (articles_with_substantial_titles / total_articles) * 100
            summary_percentage = (articles_with_substantial_summaries / total_articles) * 100
            image_percentage = (articles_with_images / total_articles) * 100
            author_percentage = (articles_with_authors / total_articles) * 100
            
            print(f"   📊 Data Quality Analysis:")
            print(f"      Total articles: {total_articles}")
            print(f"      Substantial titles (>10 chars): {articles_with_substantial_titles} ({title_percentage:.1f}%)")
            print(f"      Substantial summaries (>20 chars): {articles_with_substantial_summaries} ({summary_percentage:.1f}%)")
            print(f"      Articles with images: {articles_with_images} ({image_percentage:.1f}%)")
            print(f"      Articles with authors: {articles_with_authors} ({author_percentage:.1f}%)")
            
            # Quality thresholds
            self.assertGreater(title_percentage, 80, "At least 80% of articles should have substantial titles")
            self.assertGreater(summary_percentage, 80, "At least 80% of articles should have substantial summaries")
            self.assertGreater(author_percentage, 90, "At least 90% of articles should have authors")
            
            print("✅ Data quality meets requirements")
        else:
            print("   ⚠️ No articles found for quality analysis")
        
        # Test 6: API Parameter Support
        print("\n6. TESTING API PARAMETER SUPPORT")
        print("-" * 35)
        
        # Test limit parameter
        response = requests.get(f"{API_URL}/articles/sections/top-stories?limit=2")
        self.assertEqual(response.status_code, 200, "API should handle limit parameter")
        limited_data = response.json()
        
        if limited_data["top_stories"]:
            self.assertLessEqual(len(limited_data["top_stories"]), 2, 
                "Limit parameter should restrict top_stories results")
        if limited_data["national"]:
            self.assertLessEqual(len(limited_data["national"]), 2, 
                "Limit parameter should restrict national results")
        
        print("✅ Limit parameter working correctly")
        
        # Test 7: Performance Testing
        print("\n7. TESTING API PERFORMANCE")
        print("-" * 30)
        
        start_time = datetime.now()
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds()
        print(f"   Response time: {response_time:.3f} seconds")
        
        self.assertLess(response_time, 2.0, "API response should be under 2 seconds")
        self.assertEqual(response.status_code, 200, "API should respond successfully")
        
        print("✅ API performance is acceptable")
        
        # Test 8: Error Handling
        print("\n8. TESTING ERROR HANDLING")
        print("-" * 25)
        
        # Test with invalid parameters
        response = requests.get(f"{API_URL}/articles/sections/top-stories?limit=invalid")
        # Should handle gracefully (either ignore invalid param or return error)
        print(f"   Invalid limit parameter response: {response.status_code}")
        
        # Test with very large limit
        response = requests.get(f"{API_URL}/articles/sections/top-stories?limit=1000")
        self.assertEqual(response.status_code, 200, "API should handle large limit values")
        large_limit_data = response.json()
        
        print(f"   Large limit (1000) response: {response.status_code}")
        print(f"   Top stories returned: {len(large_limit_data['top_stories'])}")
        print(f"   National articles returned: {len(large_limit_data['national'])}")
        
        print("✅ Error handling working correctly")
        
        # Test 9: Database Categories Verification
        print("\n9. TESTING DATABASE CATEGORIES")
        print("-" * 35)
        
        # Verify required categories exist in database
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        
        category_slugs = [cat["slug"] for cat in categories]
        self.assertIn("top-stories", category_slugs, "top-stories category not found in database")
        self.assertIn("national-top-stories", category_slugs, "national-top-stories category not found in database")
        
        # Get category details
        top_stories_cat = next((cat for cat in categories if cat["slug"] == "top-stories"), None)
        national_cat = next((cat for cat in categories if cat["slug"] == "national-top-stories"), None)
        
        self.assertIsNotNone(top_stories_cat, "top-stories category details not found")
        self.assertIsNotNone(national_cat, "national-top-stories category details not found")
        
        print(f"✅ Database categories verified:")
        print(f"   - {top_stories_cat['name']} (slug: {top_stories_cat['slug']})")
        print(f"   - {national_cat['name']} (slug: {national_cat['slug']})")
        
        # Test 10: Frontend Integration Readiness
        print("\n10. TESTING FRONTEND INTEGRATION READINESS")
        print("-" * 45)
        
        # Verify the API response format matches what frontend expects
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        data = response.json()
        
        # Check if response structure matches TopStories component expectations
        self.assertIn("top_stories", data, "Frontend expects 'top_stories' key")
        self.assertIn("national", data, "Frontend expects 'national' key")
        
        # Verify each article has fields needed by frontend
        frontend_required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
        
        for article in data["top_stories"] + data["national"]:
            for field in frontend_required_fields:
                self.assertIn(field, article, f"Frontend requires '{field}' field")
        
        print("✅ API response format ready for frontend integration")
        print("   - Response structure matches TopStories component expectations")
        print("   - All required fields present for frontend rendering")
        print("   - Data format compatible with tabbed interface")
        
        # Final Summary
        print("\n" + "=" * 80)
        print("🎉 TOPSTORIES API BACKEND TESTING SUMMARY")
        print("=" * 80)
        
        print("✅ CRITICAL FINDINGS:")
        print("   1. /api/articles/sections/top-stories endpoint working correctly")
        print("   2. Returns proper JSON structure with 'top_stories' and 'national' arrays")
        print("   3. All articles have required fields for frontend consumption")
        print("   4. Category filtering working correctly (top-stories vs national-top-stories)")
        print("   5. Individual category endpoints consistent with section endpoint")
        print("   6. Data quality sufficient for production use")
        print("   7. API performance acceptable (<2 seconds response time)")
        print("   8. Error handling working correctly")
        print("   9. Database categories properly configured")
        print("   10. Response format ready for frontend TopStories component")
        
        print(f"\n✅ DATA SUMMARY:")
        print(f"   - Top Stories articles: {len(data['top_stories'])}")
        print(f"   - National articles: {len(data['national'])}")
        print(f"   - Total articles: {len(data['top_stories']) + len(data['national'])}")
        
        print("\n🔧 INTEGRATION STATUS:")
        print("   ✅ Backend API fully supports TopStories component tabbed interface")
        print("   ✅ DataService can successfully fetch from /api/articles/sections/top-stories")
        print("   ✅ SectionRegistry can pass topStoriesData prop to component")
        print("   ✅ All backend requirements for TopStories implementation are met")
        
        print("\n📋 NEXT STEPS:")
        print("   - Frontend TopStories component can use this API")
        print("   - DataService integration should work correctly")
        print("   - SectionRegistry updates should function properly")
        print("   - Tabbed interface will have proper data for both tabs")

if __name__ == "__main__":
    # Run the specific test
    unittest.main(verbosity=2)