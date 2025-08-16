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

class iPadLayoutBackendTest(unittest.TestCase):
    """Test suite for backend APIs after iPad 2-column layout implementation"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_health_check_endpoint(self):
        """Test the health check endpoint (GET /api/health)"""
        print("\n--- Testing Health Check Endpoint ---")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working correctly")

    def test_top_stories_section_endpoint(self):
        """Test GET /api/articles/sections/top-stories (for TopStoriesWithTabs)"""
        print("\n--- Testing Top Stories Section Endpoint ---")
        response = requests.get(f"{API_URL}/articles/sections/top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get top stories section data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Top stories response should be a dictionary")
        
        # Verify response structure
        self.assertIn("top_stories", data, "Response missing 'top_stories' array")
        self.assertIn("national", data, "Response missing 'national' array")
        
        top_stories_articles = data["top_stories"]
        national_articles = data["national"]
        
        self.assertIsInstance(top_stories_articles, list, "'top_stories' should be a list")
        self.assertIsInstance(national_articles, list, "'national' should be a list")
        
        # Check article structure if articles exist
        if top_stories_articles:
            article = top_stories_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in top_stories article")
        
        if national_articles:
            article = national_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in national article")
        
        print(f"✅ Top Stories section endpoint working - top_stories: {len(top_stories_articles)}, national: {len(national_articles)}")

    def test_trailers_teasers_section_endpoint(self):
        """Test GET /api/articles/sections/trailers-teasers (for TrailersTeasers component)"""
        print("\n--- Testing Trailers & Teasers Section Endpoint ---")
        response = requests.get(f"{API_URL}/articles/sections/trailers-teasers")
        self.assertEqual(response.status_code, 200, "Failed to get trailers-teasers section data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Trailers-teasers response should be a dictionary")
        
        # Verify response structure
        self.assertIn("trailers", data, "Response missing 'trailers' array")
        self.assertIn("bollywood", data, "Response missing 'bollywood' array")
        
        trailers_articles = data["trailers"]
        bollywood_articles = data["bollywood"]
        
        self.assertIsInstance(trailers_articles, list, "'trailers' should be a list")
        self.assertIsInstance(bollywood_articles, list, "'bollywood' should be a list")
        
        # Check article structure if articles exist
        if trailers_articles:
            article = trailers_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in trailers article")
        
        if bollywood_articles:
            article = bollywood_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in bollywood article")
        
        print(f"✅ Trailers & Teasers section endpoint working - trailers: {len(trailers_articles)}, bollywood: {len(bollywood_articles)}")

    def test_new_video_songs_section_endpoint(self):
        """Test GET /api/articles/sections/new-video-songs (for NewVideoSongs component)"""
        print("\n--- Testing New Video Songs Section Endpoint ---")
        response = requests.get(f"{API_URL}/articles/sections/new-video-songs")
        self.assertEqual(response.status_code, 200, "Failed to get new-video-songs section data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "New video songs response should be a dictionary")
        
        # Verify response structure
        self.assertIn("video_songs", data, "Response missing 'video_songs' array")
        self.assertIn("bollywood", data, "Response missing 'bollywood' array")
        
        video_songs_articles = data["video_songs"]
        bollywood_articles = data["bollywood"]
        
        self.assertIsInstance(video_songs_articles, list, "'video_songs' should be a list")
        self.assertIsInstance(bollywood_articles, list, "'bollywood' should be a list")
        
        # Check article structure if articles exist
        if video_songs_articles:
            article = video_songs_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in video_songs article")
        
        if bollywood_articles:
            article = bollywood_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in bollywood article")
        
        print(f"✅ New Video Songs section endpoint working - video_songs: {len(video_songs_articles)}, bollywood: {len(bollywood_articles)}")

    def test_tv_shows_section_endpoint(self):
        """Test GET /api/articles/sections/tv-shows (for TVShows component)"""
        print("\n--- Testing TV Shows Section Endpoint ---")
        response = requests.get(f"{API_URL}/articles/sections/tv-shows")
        self.assertEqual(response.status_code, 200, "Failed to get tv-shows section data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "TV shows response should be a dictionary")
        
        # Verify response structure
        self.assertIn("tv", data, "Response missing 'tv' array")
        self.assertIn("bollywood", data, "Response missing 'bollywood' array")
        
        tv_articles = data["tv"]
        bollywood_articles = data["bollywood"]
        
        self.assertIsInstance(tv_articles, list, "'tv' should be a list")
        self.assertIsInstance(bollywood_articles, list, "'bollywood' should be a list")
        
        # Check article structure if articles exist
        if tv_articles:
            article = tv_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in tv article")
        
        if bollywood_articles:
            article = bollywood_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in bollywood article")
        
        print(f"✅ TV Shows section endpoint working - tv: {len(tv_articles)}, bollywood: {len(bollywood_articles)}")

    def test_theater_bollywood_releases_endpoint(self):
        """Test GET /api/releases/theater-bollywood (for MovieSchedules)"""
        print("\n--- Testing Theater Bollywood Releases Endpoint ---")
        response = requests.get(f"{API_URL}/releases/theater-bollywood")
        self.assertEqual(response.status_code, 200, "Failed to get theater-bollywood releases data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Theater-bollywood response should be a dictionary")
        
        # Verify response structure
        self.assertIn("theater", data, "Response missing 'theater' section")
        self.assertIn("ott", data, "Response missing 'ott' section")
        
        theater_data = data["theater"]
        ott_data = data["ott"]
        
        self.assertIsInstance(theater_data, dict, "'theater' should be a dictionary")
        self.assertIsInstance(ott_data, dict, "'ott' should be a dictionary")
        
        # Check theater section structure
        self.assertIn("this_week", theater_data, "Theater section missing 'this_week'")
        self.assertIn("coming_soon", theater_data, "Theater section missing 'coming_soon'")
        
        # Check ott section structure (contains Bollywood articles)
        self.assertIn("this_week", ott_data, "OTT section missing 'this_week'")
        self.assertIn("coming_soon", ott_data, "OTT section missing 'coming_soon'")
        
        # Verify data types
        self.assertIsInstance(theater_data["this_week"], list, "Theater this_week should be a list")
        self.assertIsInstance(theater_data["coming_soon"], list, "Theater coming_soon should be a list")
        self.assertIsInstance(ott_data["this_week"], list, "OTT this_week should be a list")
        self.assertIsInstance(ott_data["coming_soon"], list, "OTT coming_soon should be a list")
        
        # Check theater release structure if data exists
        all_theater_releases = theater_data["this_week"] + theater_data["coming_soon"]
        if all_theater_releases:
            release = all_theater_releases[0]
            required_fields = ["id", "movie_name", "language", "release_date", "movie_image"]
            for field in required_fields:
                self.assertIn(field, release, f"Missing required field '{field}' in theater release")
        
        # Check ott/bollywood article structure if data exists
        all_ott_articles = ott_data["this_week"] + ott_data["coming_soon"]
        if all_ott_articles:
            article = all_ott_articles[0]
            required_fields = ["id", "title", "movie_name", "image_url", "movie_image", "author", "language"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in ott/bollywood article")
        
        print(f"✅ Theater Bollywood releases endpoint working")
        print(f"   - Theater releases: {len(all_theater_releases)} total")
        print(f"   - Bollywood articles: {len(all_ott_articles)} total")

    def test_ott_bollywood_releases_endpoint(self):
        """Test GET /api/releases/ott-bollywood (for OTTReleases)"""
        print("\n--- Testing OTT Bollywood Releases Endpoint ---")
        response = requests.get(f"{API_URL}/releases/ott-bollywood")
        self.assertEqual(response.status_code, 200, "Failed to get ott-bollywood releases data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "OTT-bollywood response should be a dictionary")
        
        # Verify response structure
        self.assertIn("ott", data, "Response missing 'ott' section")
        self.assertIn("bollywood", data, "Response missing 'bollywood' section")
        
        ott_data = data["ott"]
        bollywood_data = data["bollywood"]
        
        self.assertIsInstance(ott_data, dict, "'ott' should be a dictionary")
        self.assertIsInstance(bollywood_data, dict, "'bollywood' should be a dictionary")
        
        # Check ott section structure
        self.assertIn("this_week", ott_data, "OTT section missing 'this_week'")
        self.assertIn("coming_soon", ott_data, "OTT section missing 'coming_soon'")
        
        # Check bollywood section structure
        self.assertIn("this_week", bollywood_data, "Bollywood section missing 'this_week'")
        self.assertIn("coming_soon", bollywood_data, "Bollywood section missing 'coming_soon'")
        
        # Verify data types
        self.assertIsInstance(ott_data["this_week"], list, "OTT this_week should be a list")
        self.assertIsInstance(ott_data["coming_soon"], list, "OTT coming_soon should be a list")
        self.assertIsInstance(bollywood_data["this_week"], list, "Bollywood this_week should be a list")
        self.assertIsInstance(bollywood_data["coming_soon"], list, "Bollywood coming_soon should be a list")
        
        # Check ott release structure if data exists
        all_ott_releases = ott_data["this_week"] + ott_data["coming_soon"]
        if all_ott_releases:
            release = all_ott_releases[0]
            required_fields = ["id", "movie_name", "language", "release_date", "movie_image", "ott_platform"]
            for field in required_fields:
                self.assertIn(field, release, f"Missing required field '{field}' in ott release")
        
        # Check bollywood article structure if data exists
        all_bollywood_articles = bollywood_data["this_week"] + bollywood_data["coming_soon"]
        if all_bollywood_articles:
            article = all_bollywood_articles[0]
            required_fields = ["id", "title", "movie_name", "image_url", "movie_image", "author", "language", "ott_platform"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in bollywood article")
        
        print(f"✅ OTT Bollywood releases endpoint working")
        print(f"   - OTT releases: {len(all_ott_releases)} total")
        print(f"   - Bollywood articles: {len(all_bollywood_articles)} total")

    def test_general_articles_api(self):
        """Test GET /api/articles (basic article listing)"""
        print("\n--- Testing General Articles API ---")
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        self.assertIsInstance(articles, list, "Articles response is not a list")
        self.assertGreater(len(articles), 0, "No articles returned")
        
        # Check article structure
        article = articles[0]
        required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category", "view_count"]
        for field in required_fields:
            self.assertIn(field, article, f"Missing required field '{field}' in article")
        
        # Verify data types
        self.assertIsInstance(article["id"], int, "Article ID should be integer")
        self.assertIsInstance(article["title"], str, "Article title should be string")
        self.assertIsInstance(article["summary"], str, "Article summary should be string")
        self.assertIsInstance(article["author"], str, "Article author should be string")
        self.assertIsInstance(article["view_count"], int, "Article view_count should be integer")
        
        print(f"✅ General articles API working - returned {len(articles)} articles")
        
        # Test pagination
        response = requests.get(f"{API_URL}/articles?skip=5&limit=10")
        self.assertEqual(response.status_code, 200)
        paginated_articles = response.json()
        self.assertLessEqual(len(paginated_articles), 10, "Pagination limit not working")
        print("✅ Articles pagination working")

    def test_api_response_consistency(self):
        """Test that all APIs return consistent JSON responses"""
        print("\n--- Testing API Response Consistency ---")
        
        endpoints_to_test = [
            ("/", "Health check"),
            ("/articles", "General articles"),
            ("/articles/sections/top-stories", "Top stories section"),
            ("/articles/sections/trailers-teasers", "Trailers teasers section"),
            ("/articles/sections/new-video-songs", "New video songs section"),
            ("/articles/sections/tv-shows", "TV shows section"),
            ("/releases/theater-bollywood", "Theater bollywood releases"),
            ("/releases/ott-bollywood", "OTT bollywood releases")
        ]
        
        for endpoint, description in endpoints_to_test:
            response = requests.get(f"{API_URL}{endpoint}")
            self.assertEqual(response.status_code, 200, f"{description} endpoint failed")
            
            # Verify response is valid JSON
            try:
                data = response.json()
                self.assertIsNotNone(data, f"{description} returned null data")
            except json.JSONDecodeError:
                self.fail(f"{description} returned invalid JSON")
            
            # Verify Content-Type header
            self.assertIn("application/json", response.headers.get("content-type", "").lower(),
                         f"{description} doesn't return JSON content-type")
        
        print("✅ All API endpoints return consistent JSON responses")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n--- Testing Error Handling ---")
        
        # Test invalid category slug
        response = requests.get(f"{API_URL}/articles/category/invalid-category-slug")
        self.assertEqual(response.status_code, 200, "Invalid category should return empty list, not error")
        articles = response.json()
        self.assertEqual(len(articles), 0, "Invalid category should return empty list")
        print("✅ Invalid category returns empty list")
        
        # Test invalid article ID
        response = requests.get(f"{API_URL}/articles/99999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        print("✅ Invalid article ID returns 404")
        
        # Test invalid endpoint
        response = requests.get(f"{API_URL}/invalid-endpoint")
        self.assertEqual(response.status_code, 404, "Invalid endpoint should return 404")
        print("✅ Invalid endpoint returns 404")

if __name__ == "__main__":
    # Create a test suite with the specific tests for iPad layout backend verification
    suite = unittest.TestSuite()
    
    # Add tests in priority order
    suite.addTest(iPadLayoutBackendTest("test_health_check_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_top_stories_section_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_trailers_teasers_section_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_new_video_songs_section_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_tv_shows_section_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_theater_bollywood_releases_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_ott_bollywood_releases_endpoint"))
    suite.addTest(iPadLayoutBackendTest("test_general_articles_api"))
    suite.addTest(iPadLayoutBackendTest("test_api_response_consistency"))
    suite.addTest(iPadLayoutBackendTest("test_error_handling"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n{'='*80}")
    print("IPAD LAYOUT BACKEND TESTING SUMMARY")
    print(f"{'='*80}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print("\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    if result.wasSuccessful():
        print("\n🎉 ALL BACKEND APIS ARE WORKING CORRECTLY AFTER IPAD LAYOUT IMPLEMENTATION!")
        print("✅ No existing backend functionality has been broken by frontend layout changes")
    else:
        print("\n❌ Some backend APIs have issues that need to be addressed")
    
    print(f"{'='*80}")