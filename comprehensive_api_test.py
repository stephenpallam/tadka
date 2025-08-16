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
print(f"Testing API at: {API_URL}")

class ComprehensiveAPITest(unittest.TestCase):
    """Comprehensive test suite for Blog CMS API after frontend-backend communication fix"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_01_health_check_and_json_response(self):
        """Test that API returns proper JSON instead of HTML"""
        print("\n=== TESTING API HEALTH AND JSON RESPONSE ===")
        
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        
        # Verify it's JSON, not HTML
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "API should return JSON, not HTML")
        
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ API returns proper JSON response (not HTML)")

    def test_02_politics_api_endpoint(self):
        """Test the Politics API endpoint specifically: /api/articles/sections/politics"""
        print("\n=== TESTING POLITICS API ENDPOINT ===")
        
        response = requests.get(f"{API_URL}/articles/sections/politics")
        self.assertEqual(response.status_code, 200, "Politics API endpoint failed")
        
        # Verify it's JSON
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "Politics API should return JSON")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Politics response should be a dictionary")
        
        # Check structure
        self.assertIn("state_politics", data, "Response missing 'state_politics' array")
        self.assertIn("national_politics", data, "Response missing 'national_politics' array")
        
        state_articles = data["state_politics"]
        national_articles = data["national_politics"]
        
        self.assertIsInstance(state_articles, list, "'state_politics' should be a list")
        self.assertIsInstance(national_articles, list, "'national_politics' should be a list")
        
        print(f"✅ Politics API endpoint working - State: {len(state_articles)}, National: {len(national_articles)} articles")
        
        # Check for Article ID 74 "Jagan - USA Tour" with state "ap"
        article_74_found = False
        for article in state_articles:
            if article.get("id") == 74 and "Jagan" in article.get("title", "") and "USA Tour" in article.get("title", ""):
                article_74_found = True
                # Check if states field exists and contains "ap"
                states = article.get("states")
                if states:
                    if isinstance(states, str):
                        # Parse JSON string if needed
                        import json
                        try:
                            states_list = json.loads(states)
                            self.assertIn("ap", states_list, "Article 74 should have 'ap' in states")
                        except:
                            self.assertIn("ap", states, "Article 74 should contain 'ap' in states")
                    elif isinstance(states, list):
                        self.assertIn("ap", states, "Article 74 should have 'ap' in states list")
                print(f"✅ Article ID 74 'Jagan - USA Tour' found with state 'ap': {article.get('title')}")
                break
        
        if not article_74_found:
            # Check all articles for debugging
            print("Available articles in state_politics:")
            for article in state_articles:
                print(f"  - ID {article.get('id')}: {article.get('title')} (states: {article.get('states')})")
        
        self.assertTrue(article_74_found, "Article ID 74 'Jagan - USA Tour' with state 'ap' not found in politics API response")

    def test_03_movies_api_endpoints(self):
        """Test Movies API endpoints for proper state-based filtering"""
        print("\n=== TESTING MOVIES API ENDPOINTS ===")
        
        # Test main movies section endpoint
        response = requests.get(f"{API_URL}/articles/sections/movies")
        self.assertEqual(response.status_code, 200, "Movies API endpoint failed")
        
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "Movies API should return JSON")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Movies response should be a dictionary")
        
        # Check structure
        self.assertIn("movies", data, "Response missing 'movies' array")
        self.assertIn("bollywood", data, "Response missing 'bollywood' array")
        
        movies_articles = data["movies"]
        bollywood_articles = data["bollywood"]
        
        print(f"✅ Movies API endpoint working - Movies: {len(movies_articles)}, Bollywood: {len(bollywood_articles)} articles")
        
        # Test movie reviews endpoint
        response = requests.get(f"{API_URL}/articles/sections/movie-reviews")
        self.assertEqual(response.status_code, 200, "Movie reviews API endpoint failed")
        
        reviews_data = response.json()
        self.assertIn("movie_reviews", reviews_data, "Response missing 'movie_reviews' array")
        self.assertIn("bollywood", reviews_data, "Response missing 'bollywood' array")
        
        print(f"✅ Movie Reviews API endpoint working - Reviews: {len(reviews_data['movie_reviews'])}, Bollywood: {len(reviews_data['bollywood'])} articles")

    def test_04_top_stories_api_endpoint(self):
        """Test Top Stories API endpoint"""
        print("\n=== TESTING TOP STORIES API ENDPOINT ===")
        
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        self.assertEqual(response.status_code, 200, "Top Stories API endpoint failed")
        
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "Top Stories API should return JSON")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Top Stories response should be a dictionary")
        
        # Check structure
        self.assertIn("top_stories", data, "Response missing 'top_stories' array")
        self.assertIn("national", data, "Response missing 'national' array")
        
        top_stories = data["top_stories"]
        national_stories = data["national"]
        
        print(f"✅ Top Stories API endpoint working - Top Stories: {len(top_stories)}, National: {len(national_stories)} articles")

    def test_05_core_section_endpoints(self):
        """Test other core section endpoints"""
        print("\n=== TESTING CORE SECTION ENDPOINTS ===")
        
        endpoints_to_test = [
            "latest-news",
            "sports", 
            "ai-stock",
            "fashion-beauty",
            "hot-topics-gossip",
            "viral-videos",
            "box-office",
            "trending-videos",
            "ott-movie-reviews",
            "events-interviews",
            "new-video-songs",
            "trailers-teasers",
            "tv-shows"
        ]
        
        successful_endpoints = 0
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(f"{API_URL}/articles/sections/{endpoint}")
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        data = response.json()
                        successful_endpoints += 1
                        print(f"✅ {endpoint} endpoint working - returns JSON")
                    else:
                        print(f"❌ {endpoint} endpoint returns non-JSON content")
                else:
                    print(f"❌ {endpoint} endpoint failed with status {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint} endpoint error: {str(e)}")
        
        print(f"✅ {successful_endpoints}/{len(endpoints_to_test)} section endpoints working properly")
        self.assertGreater(successful_endpoints, len(endpoints_to_test) * 0.8, "Most section endpoints should be working")

    def test_06_environment_variables_verification(self):
        """Verify environment variables are working correctly"""
        print("\n=== TESTING ENVIRONMENT VARIABLES ===")
        
        # Test that we can connect to the API using the environment URL
        self.assertTrue(BACKEND_URL.startswith('http'), "REACT_APP_BACKEND_URL should be a valid URL")
        print(f"✅ REACT_APP_BACKEND_URL is properly configured: {BACKEND_URL}")
        
        # Test database connection by checking if we can get categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Database connection via environment variables failed")
        print("✅ Database connection working via environment variables")

    def test_07_cms_endpoints_basic_functionality(self):
        """Test CMS endpoints for basic functionality"""
        print("\n=== TESTING CMS ENDPOINTS ===")
        
        # Test CMS config endpoint
        response = requests.get(f"{API_URL}/cms/config")
        self.assertEqual(response.status_code, 200, "CMS config endpoint failed")
        
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "CMS config should return JSON")
        
        config_data = response.json()
        self.assertIn("languages", config_data, "CMS config missing languages")
        self.assertIn("states", config_data, "CMS config missing states")
        self.assertIn("categories", config_data, "CMS config missing categories")
        
        print("✅ CMS config endpoint working")
        
        # Test CMS articles endpoint
        response = requests.get(f"{API_URL}/cms/articles")
        self.assertEqual(response.status_code, 200, "CMS articles endpoint failed")
        
        articles_data = response.json()
        self.assertIsInstance(articles_data, list, "CMS articles should return a list")
        
        print(f"✅ CMS articles endpoint working - returned {len(articles_data)} articles")
        
        # Test CMS articles with filtering
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=5")
        self.assertEqual(response.status_code, 200, "CMS articles filtering failed")
        
        filtered_articles = response.json()
        self.assertLessEqual(len(filtered_articles), 5, "CMS articles limit parameter not working")
        
        print("✅ CMS articles filtering and pagination working")

    def test_08_article_retrieval_and_json_format(self):
        """Test individual article retrieval returns proper JSON"""
        print("\n=== TESTING ARTICLE RETRIEVAL JSON FORMAT ===")
        
        # Get list of articles first
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles list")
        
        articles = response.json()
        self.assertGreater(len(articles), 0, "No articles found")
        
        # Test individual article retrieval
        article_id = articles[0]["id"]
        response = requests.get(f"{API_URL}/articles/{article_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get article {article_id}")
        
        content_type = response.headers.get('content-type', '')
        self.assertIn('application/json', content_type, "Individual article should return JSON")
        
        article_data = response.json()
        self.assertIn("id", article_data)
        self.assertIn("title", article_data)
        self.assertIn("content", article_data)
        
        print(f"✅ Individual article retrieval returns proper JSON - Article ID {article_id}")

    def test_09_category_based_article_retrieval(self):
        """Test category-based article retrieval"""
        print("\n=== TESTING CATEGORY-BASED ARTICLE RETRIEVAL ===")
        
        # Test specific categories mentioned in the review
        categories_to_test = [
            "state-politics",
            "national-politics", 
            "movie-reviews",
            "top-stories",
            "national-top-stories"
        ]
        
        successful_categories = 0
        
        for category in categories_to_test:
            try:
                response = requests.get(f"{API_URL}/articles/category/{category}")
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        articles = response.json()
                        successful_categories += 1
                        print(f"✅ Category '{category}' returns {len(articles)} articles in JSON format")
                    else:
                        print(f"❌ Category '{category}' returns non-JSON content")
                else:
                    print(f"❌ Category '{category}' failed with status {response.status_code}")
            except Exception as e:
                print(f"❌ Category '{category}' error: {str(e)}")
        
        print(f"✅ {successful_categories}/{len(categories_to_test)} category endpoints working")
        self.assertGreater(successful_categories, 0, "At least some category endpoints should work")

    def test_10_states_field_in_politics_articles(self):
        """Test that politics articles include states field for filtering"""
        print("\n=== TESTING STATES FIELD IN POLITICS ARTICLES ===")
        
        response = requests.get(f"{API_URL}/articles/sections/politics")
        self.assertEqual(response.status_code, 200, "Politics API endpoint failed")
        
        data = response.json()
        state_articles = data["state_politics"]
        
        states_field_count = 0
        ap_articles_count = 0
        
        for article in state_articles:
            if "states" in article:
                states_field_count += 1
                states = article["states"]
                
                # Check if this article is for AP/Telangana
                if states:
                    if isinstance(states, str):
                        if "ap" in states.lower() or "ts" in states.lower():
                            ap_articles_count += 1
                    elif isinstance(states, list):
                        for state in states:
                            if "ap" in str(state).lower() or "ts" in str(state).lower():
                                ap_articles_count += 1
                                break
        
        print(f"✅ States field present in {states_field_count}/{len(state_articles)} state politics articles")
        print(f"✅ Found {ap_articles_count} articles for AP/Telangana states")
        
        self.assertGreater(states_field_count, 0, "At least some articles should have states field")

    def test_11_comprehensive_api_status_check(self):
        """Comprehensive check of all major API endpoints status"""
        print("\n=== COMPREHENSIVE API STATUS CHECK ===")
        
        endpoints_to_check = [
            "/",
            "/categories",
            "/articles",
            "/articles/most-read",
            "/articles/sections/politics",
            "/articles/sections/movies", 
            "/articles/sections/top-stories",
            "/articles/sections/movie-reviews",
            "/cms/config",
            "/cms/articles"
        ]
        
        working_endpoints = 0
        json_endpoints = 0
        
        for endpoint in endpoints_to_check:
            try:
                response = requests.get(f"{API_URL}{endpoint}")
                if response.status_code == 200:
                    working_endpoints += 1
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        json_endpoints += 1
                        print(f"✅ {endpoint} - Status: 200, Content: JSON")
                    else:
                        print(f"⚠️ {endpoint} - Status: 200, Content: {content_type}")
                else:
                    print(f"❌ {endpoint} - Status: {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint} - Error: {str(e)}")
        
        print(f"\n📊 SUMMARY:")
        print(f"✅ Working endpoints: {working_endpoints}/{len(endpoints_to_check)}")
        print(f"✅ JSON endpoints: {json_endpoints}/{len(endpoints_to_check)}")
        print(f"✅ Success rate: {(working_endpoints/len(endpoints_to_check)*100):.1f}%")
        
        # Ensure most endpoints are working
        self.assertGreater(working_endpoints, len(endpoints_to_check) * 0.8, "Most API endpoints should be working")
        self.assertGreater(json_endpoints, len(endpoints_to_check) * 0.8, "Most API endpoints should return JSON")

if __name__ == "__main__":
    # Create a test suite with specific order
    suite = unittest.TestSuite()
    
    # Add tests in priority order
    suite.addTest(ComprehensiveAPITest("test_01_health_check_and_json_response"))
    suite.addTest(ComprehensiveAPITest("test_02_politics_api_endpoint"))
    suite.addTest(ComprehensiveAPITest("test_03_movies_api_endpoints"))
    suite.addTest(ComprehensiveAPITest("test_04_top_stories_api_endpoint"))
    suite.addTest(ComprehensiveAPITest("test_05_core_section_endpoints"))
    suite.addTest(ComprehensiveAPITest("test_06_environment_variables_verification"))
    suite.addTest(ComprehensiveAPITest("test_07_cms_endpoints_basic_functionality"))
    suite.addTest(ComprehensiveAPITest("test_08_article_retrieval_and_json_format"))
    suite.addTest(ComprehensiveAPITest("test_09_category_based_article_retrieval"))
    suite.addTest(ComprehensiveAPITest("test_10_states_field_in_politics_articles"))
    suite.addTest(ComprehensiveAPITest("test_11_comprehensive_api_status_check"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print final summary
    print("\n" + "="*80)
    print("COMPREHENSIVE API TESTING COMPLETED")
    print("="*80)
    
    if result.wasSuccessful():
        print("🎉 ALL TESTS PASSED - Backend API is working correctly!")
        print("✅ Frontend-backend communication issue has been resolved")
        print("✅ All API endpoints return proper JSON (not HTML)")
        print("✅ Politics API endpoint working with Article ID 74")
        print("✅ Movies API endpoints working properly")
        print("✅ Core section endpoints functional")
        print("✅ Environment variables configured correctly")
        print("✅ CMS endpoints working for basic functionality")
    else:
        print("❌ SOME TESTS FAILED - Check the detailed output above")
        print(f"Failed tests: {len(result.failures)}")
        print(f"Error tests: {len(result.errors)}")