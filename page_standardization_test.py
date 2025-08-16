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
print(f"Testing Page Standardization API at: {API_URL}")

class PageStandardizationTest(unittest.TestCase):
    """Test suite for Page Standardization Backend Functionality"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_1_core_backend_health(self):
        """Test basic health check endpoint"""
        print("\n=== 1. CORE BACKEND HEALTH CHECK ===")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ Core backend health check working correctly")

    def test_2_movie_reviews_category(self):
        """Test /api/articles/category/movie-reviews endpoint"""
        print("\n=== 2. MOVIE REVIEWS CATEGORY ENDPOINT ===")
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Movie reviews category endpoint failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Movie reviews response should be a list")
        
        # Check if category exists in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "movie-reviews" in category_slugs:
            print(f"✅ Movie reviews category exists - returned {len(articles)} articles")
            if articles:
                # Verify article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
                for field in required_fields:
                    self.assertIn(field, article, f"Missing field '{field}' in movie reviews article")
                print(f"   Sample article: '{article['title'][:50]}...'")
        else:
            print("⚠️ Movie reviews category does not exist - returns empty list (expected behavior)")
            self.assertEqual(len(articles), 0, "Non-existent category should return empty list")

    def test_3_bollywood_category(self):
        """Test /api/articles/category/bollywood endpoint for MovieReviews page"""
        print("\n=== 3. BOLLYWOOD CATEGORY ENDPOINT ===")
        response = requests.get(f"{API_URL}/articles/category/bollywood")
        self.assertEqual(response.status_code, 200, "Bollywood category endpoint failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Bollywood response should be a list")
        
        # Check if category exists in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "bollywood" in category_slugs:
            print(f"✅ Bollywood category exists - returned {len(articles)} articles")
            if articles:
                # Verify article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
                for field in required_fields:
                    self.assertIn(field, article, f"Missing field '{field}' in bollywood article")
                print(f"   Sample article: '{article['title'][:50]}...'")
        else:
            print("⚠️ Bollywood category does not exist - returns empty list")
            self.assertEqual(len(articles), 0, "Non-existent category should return empty list")

    def test_4_box_office_category(self):
        """Test /api/articles/category/box-office endpoint for BoxOffice page"""
        print("\n=== 4. BOX OFFICE CATEGORY ENDPOINT ===")
        response = requests.get(f"{API_URL}/articles/category/box-office")
        self.assertEqual(response.status_code, 200, "Box office category endpoint failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Box office response should be a list")
        
        # Check if category exists in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "box-office" in category_slugs:
            print(f"✅ Box office category exists - returned {len(articles)} articles")
            if articles:
                # Verify article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
                for field in required_fields:
                    self.assertIn(field, article, f"Missing field '{field}' in box office article")
                print(f"   Sample article: '{article['title'][:50]}...'")
        else:
            print("⚠️ Box office category does not exist - returns empty list")
            self.assertEqual(len(articles), 0, "Non-existent category should return empty list")

    def test_5_events_category(self):
        """Test /api/articles/category/events endpoint for EventsInterviews page"""
        print("\n=== 5. EVENTS CATEGORY ENDPOINT ===")
        response = requests.get(f"{API_URL}/articles/category/events")
        self.assertEqual(response.status_code, 200, "Events category endpoint failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Events response should be a list")
        
        # Check if category exists in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "events" in category_slugs:
            print(f"✅ Events category exists - returned {len(articles)} articles")
            if articles:
                # Verify article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
                for field in required_fields:
                    self.assertIn(field, article, f"Missing field '{field}' in events article")
                print(f"   Sample article: '{article['title'][:50]}...'")
        else:
            print("⚠️ Events category does not exist - returns empty list")
            self.assertEqual(len(articles), 0, "Non-existent category should return empty list")

    def test_6_interviews_category(self):
        """Test /api/articles/category/interviews endpoint for EventsInterviews page"""
        print("\n=== 6. INTERVIEWS CATEGORY ENDPOINT ===")
        response = requests.get(f"{API_URL}/articles/category/interviews")
        self.assertEqual(response.status_code, 200, "Interviews category endpoint failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Interviews response should be a list")
        
        # Check if category exists in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "interviews" in category_slugs:
            print(f"✅ Interviews category exists - returned {len(articles)} articles")
            if articles:
                # Verify article structure
                article = articles[0]
                required_fields = ["id", "title", "summary", "image_url", "author", "published_at"]
                for field in required_fields:
                    self.assertIn(field, article, f"Missing field '{field}' in interviews article")
                print(f"   Sample article: '{article['title'][:50]}...'")
        else:
            print("⚠️ Interviews category does not exist - returns empty list")
            self.assertEqual(len(articles), 0, "Non-existent category should return empty list")

    def test_7_related_articles_endpoints(self):
        """Test related articles endpoints for standardized pages"""
        print("\n=== 7. RELATED ARTICLES ENDPOINTS ===")
        
        # Test related articles for movie-reviews
        print("\n7a. Testing related articles for movie-reviews")
        response = requests.get(f"{API_URL}/related-articles/movie-reviews")
        self.assertEqual(response.status_code, 200, "Related articles for movie-reviews failed")
        movie_related = response.json()
        self.assertIsInstance(movie_related, list, "Related articles should be a list")
        print(f"✅ Related articles for movie-reviews: {len(movie_related)} articles")
        
        # Test related articles for box-office
        print("\n7b. Testing related articles for box-office")
        response = requests.get(f"{API_URL}/related-articles/box-office")
        self.assertEqual(response.status_code, 200, "Related articles for box-office failed")
        box_office_related = response.json()
        self.assertIsInstance(box_office_related, list, "Related articles should be a list")
        print(f"✅ Related articles for box-office: {len(box_office_related)} articles")
        
        # Test related articles for events-interviews
        print("\n7c. Testing related articles for events-interviews")
        response = requests.get(f"{API_URL}/related-articles/events-interviews")
        self.assertEqual(response.status_code, 200, "Related articles for events-interviews failed")
        events_related = response.json()
        self.assertIsInstance(events_related, list, "Related articles should be a list")
        print(f"✅ Related articles for events-interviews: {len(events_related)} articles")
        
        # Verify article structure if articles exist
        if movie_related:
            article = movie_related[0]
            required_fields = ["id", "title", "summary", "image", "author", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing field '{field}' in related article")
            print(f"   Sample related article: '{article['title'][:50]}...'")

    def test_8_general_article_endpoints(self):
        """Test general article endpoints (GET /api/articles/{id} and basic listing)"""
        print("\n=== 8. GENERAL ARTICLE ENDPOINTS ===")
        
        # Test basic article listing
        print("\n8a. Testing basic article listing")
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Basic article listing failed")
        articles = response.json()
        self.assertIsInstance(articles, list, "Articles response should be a list")
        self.assertGreater(len(articles), 0, "Should have articles in database")
        print(f"✅ Basic article listing working - returned {len(articles)} articles")
        
        # Test individual article retrieval
        print("\n8b. Testing individual article retrieval")
        if articles:
            article_id = articles[0]["id"]
            response = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get article {article_id}")
            article = response.json()
            
            # Verify full article structure
            required_fields = ["id", "title", "content", "summary", "image", "author", "published_at", "category"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing field '{field}' in individual article")
            
            self.assertEqual(article["id"], article_id, "Article ID mismatch")
            self.assertIsInstance(article["content"], str, "Article content should be string")
            self.assertGreater(len(article["content"]), 0, "Article should have content")
            
            print(f"✅ Individual article retrieval working for article {article_id}")
            print(f"   Title: '{article['title'][:50]}...'")
            print(f"   Content length: {len(article['content'])} characters")
        
        # Test invalid article ID
        print("\n8c. Testing invalid article ID handling")
        response = requests.get(f"{API_URL}/articles/99999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        print("✅ Invalid article ID properly returns 404")

    def test_9_fallback_mechanisms(self):
        """Test fallback mechanisms for non-existent categories"""
        print("\n=== 9. FALLBACK MECHANISMS ===")
        
        # Test various non-existent categories
        non_existent_categories = [
            "non-existent-category",
            "fake-category",
            "missing-category"
        ]
        
        for category in non_existent_categories:
            response = requests.get(f"{API_URL}/articles/category/{category}")
            self.assertEqual(response.status_code, 200, f"Non-existent category {category} should return 200")
            articles = response.json()
            self.assertIsInstance(articles, list, f"Response for {category} should be a list")
            self.assertEqual(len(articles), 0, f"Non-existent category {category} should return empty list")
        
        print("✅ Fallback mechanisms working - non-existent categories return empty lists")

    def test_10_error_handling(self):
        """Test error handling for various scenarios"""
        print("\n=== 10. ERROR HANDLING ===")
        
        # Test malformed requests
        print("\n10a. Testing malformed category requests")
        response = requests.get(f"{API_URL}/articles/category/")
        # This might return 404 or 422 depending on FastAPI routing
        self.assertIn(response.status_code, [404, 422], "Empty category slug should return error")
        print(f"✅ Empty category slug returns {response.status_code}")
        
        # Test invalid article ID formats
        print("\n10b. Testing invalid article ID formats")
        response = requests.get(f"{API_URL}/articles/invalid-id")
        self.assertIn(response.status_code, [404, 422], "Invalid article ID format should return error")
        print(f"✅ Invalid article ID format returns {response.status_code}")
        
        # Test pagination parameters
        print("\n10c. Testing pagination parameters")
        response = requests.get(f"{API_URL}/articles?skip=0&limit=5")
        self.assertEqual(response.status_code, 200, "Valid pagination should work")
        articles = response.json()
        self.assertLessEqual(len(articles), 5, "Pagination limit should be respected")
        print(f"✅ Pagination working - returned {len(articles)} articles with limit=5")

    def test_11_top_stories_national_tab(self):
        """Test Top Stories National Tab implementation (from test_result.md focus)"""
        print("\n=== 11. TOP STORIES NATIONAL TAB IMPLEMENTATION ===")
        
        # Test top-stories category
        print("\n11a. Testing top-stories category")
        response = requests.get(f"{API_URL}/articles/category/top-stories")
        self.assertEqual(response.status_code, 200, "Top stories category endpoint failed")
        top_stories = response.json()
        self.assertIsInstance(top_stories, list, "Top stories response should be a list")
        
        # Test national-top-stories category
        print("\n11b. Testing national-top-stories category")
        response = requests.get(f"{API_URL}/articles/category/national-top-stories")
        self.assertEqual(response.status_code, 200, "National top stories category endpoint failed")
        national_stories = response.json()
        self.assertIsInstance(national_stories, list, "National top stories response should be a list")
        
        # Test the combined endpoint
        print("\n11c. Testing combined top-stories API endpoint")
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        self.assertEqual(response.status_code, 200, "Top stories section endpoint failed")
        section_data = response.json()
        self.assertIsInstance(section_data, dict, "Section data should be a dictionary")
        self.assertIn("top_stories", section_data, "Missing top_stories array")
        self.assertIn("national", section_data, "Missing national array")
        
        print(f"✅ Top Stories National Tab implementation working")
        print(f"   - Top stories articles: {len(section_data['top_stories'])}")
        print(f"   - National articles: {len(section_data['national'])}")
        
        # Verify categories exist in database
        categories_response = requests.get(f"{API_URL}/categories")
        categories = categories_response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        if "top-stories" in category_slugs and "national-top-stories" in category_slugs:
            print("✅ Both top-stories and national-top-stories categories exist in database")
        else:
            print("⚠️ One or both top stories categories missing from database")

    def test_12_response_structure_validation(self):
        """Test response structure validation for all endpoints"""
        print("\n=== 12. RESPONSE STRUCTURE VALIDATION ===")
        
        # Test article list response structure
        print("\n12a. Testing article list response structure")
        response = requests.get(f"{API_URL}/articles")
        articles = response.json()
        
        if articles:
            article = articles[0]
            expected_list_fields = [
                "id", "title", "short_title", "summary", "image_url", 
                "author", "language", "category", "is_published", 
                "is_scheduled", "scheduled_publish_at", "published_at", "view_count"
            ]
            
            for field in expected_list_fields:
                self.assertIn(field, article, f"Missing field '{field}' in article list response")
            
            print("✅ Article list response structure validated")
        
        # Test individual article response structure
        print("\n12b. Testing individual article response structure")
        if articles:
            article_id = articles[0]["id"]
            response = requests.get(f"{API_URL}/articles/{article_id}")
            individual_article = response.json()
            
            expected_individual_fields = [
                "id", "title", "content", "summary", "image", 
                "author", "category", "published_at", "view_count"
            ]
            
            for field in expected_individual_fields:
                self.assertIn(field, individual_article, f"Missing field '{field}' in individual article response")
            
            print("✅ Individual article response structure validated")
        
        # Test category response structure
        print("\n12c. Testing category response structure")
        response = requests.get(f"{API_URL}/categories")
        categories = response.json()
        
        if categories:
            category = categories[0]
            expected_category_fields = ["id", "name", "slug", "description", "created_at"]
            
            for field in expected_category_fields:
                self.assertIn(field, category, f"Missing field '{field}' in category response")
            
            print("✅ Category response structure validated")

def run_page_standardization_tests():
    """Run all page standardization tests"""
    print("🎯 STARTING PAGE STANDARDIZATION BACKEND TESTING")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(PageStandardizationTest("test_1_core_backend_health"))
    suite.addTest(PageStandardizationTest("test_2_movie_reviews_category"))
    suite.addTest(PageStandardizationTest("test_3_bollywood_category"))
    suite.addTest(PageStandardizationTest("test_4_box_office_category"))
    suite.addTest(PageStandardizationTest("test_5_events_category"))
    suite.addTest(PageStandardizationTest("test_6_interviews_category"))
    suite.addTest(PageStandardizationTest("test_7_related_articles_endpoints"))
    suite.addTest(PageStandardizationTest("test_8_general_article_endpoints"))
    suite.addTest(PageStandardizationTest("test_9_fallback_mechanisms"))
    suite.addTest(PageStandardizationTest("test_10_error_handling"))
    suite.addTest(PageStandardizationTest("test_11_top_stories_national_tab"))
    suite.addTest(PageStandardizationTest("test_12_response_structure_validation"))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    print("🎉 PAGE STANDARDIZATION BACKEND TESTING COMPLETED")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n❌ FAILURES:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    if not result.failures and not result.errors:
        print("\n✅ ALL TESTS PASSED SUCCESSFULLY!")
        print("✅ Backend functionality for page standardization is working correctly")
        print("✅ All required endpoints are functional")
        print("✅ Error handling and fallback mechanisms are working")
        print("✅ Response structures are properly validated")
    
    return result

if __name__ == "__main__":
    run_page_standardization_tests()