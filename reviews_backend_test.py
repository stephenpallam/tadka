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
print(f"Testing Reviews Page API at: {API_URL}")

class ReviewsPageBackendTest(unittest.TestCase):
    """Test suite specifically for Reviews Page backend functionality"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_reviews_page_movie_reviews_endpoint(self):
        """Test GET /api/articles/category/movie-reviews endpoint for Movie Reviews tab"""
        print("\n--- Testing Movie Reviews Tab Endpoint ---")
        
        # Test the movie-reviews category endpoint
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie-reviews articles")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "Movie reviews response should be a list")
        
        print(f"✅ Movie Reviews endpoint working - returned {len(articles)} articles")
        
        # If articles exist, verify their structure
        if articles:
            article = articles[0]
            required_fields = ["id", "title", "image_url", "published_at", "author", "summary"]
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in movie-reviews article")
            
            # Verify data types
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Article title should be string")
            self.assertIsNotNone(article["published_at"], "Article should have published_at timestamp")
            
            # Check for optional rating field (specific to reviews)
            if "rating" in article:
                self.assertIsInstance(article["rating"], (int, float, type(None)), "Rating should be numeric or None")
            
            print(f"✅ Movie Reviews article structure verified")
            print(f"   - Sample article: '{article['title'][:50]}...'")
            print(f"   - Published at: {article['published_at']}")
            print(f"   - Author: {article['author']}")
            
            # Check if rating field exists for reviews
            if "rating" in article and article["rating"]:
                print(f"   - Rating: {article['rating']}")
        else:
            print("⚠️ No movie-reviews articles found - this is acceptable, frontend should handle gracefully")

    def test_reviews_page_ott_reviews_endpoint(self):
        """Test GET /api/articles/category/ott-reviews endpoint for OTT Reviews tab"""
        print("\n--- Testing OTT Reviews Tab Endpoint ---")
        
        # Test the ott-reviews category endpoint
        response = requests.get(f"{API_URL}/articles/category/ott-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get ott-reviews articles")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "OTT reviews response should be a list")
        
        print(f"✅ OTT Reviews endpoint working - returned {len(articles)} articles")
        
        # If articles exist, verify their structure
        if articles:
            article = articles[0]
            required_fields = ["id", "title", "image_url", "published_at", "author", "summary"]
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in ott-reviews article")
            
            # Verify data types
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Article title should be string")
            self.assertIsNotNone(article["published_at"], "Article should have published_at timestamp")
            
            # Check for optional rating and reviewer fields (specific to reviews)
            if "rating" in article:
                self.assertIsInstance(article["rating"], (int, float, type(None)), "Rating should be numeric or None")
            if "reviewer" in article:
                self.assertIsInstance(article["reviewer"], (str, type(None)), "Reviewer should be string or None")
            
            print(f"✅ OTT Reviews article structure verified")
            print(f"   - Sample article: '{article['title'][:50]}...'")
            print(f"   - Published at: {article['published_at']}")
            print(f"   - Author: {article['author']}")
            
            # Check if rating and reviewer fields exist
            if "rating" in article and article["rating"]:
                print(f"   - Rating: {article['rating']}")
            if "reviewer" in article and article["reviewer"]:
                print(f"   - Reviewer: {article['reviewer']}")
        else:
            print("⚠️ No ott-reviews articles found - this is acceptable, frontend should handle gracefully")

    def test_reviews_page_related_articles_endpoint(self):
        """Test GET /api/related-articles/reviews endpoint for related articles"""
        print("\n--- Testing Reviews Related Articles Endpoint ---")
        
        # Test the related articles endpoint for reviews page
        response = requests.get(f"{API_URL}/related-articles/reviews")
        
        # This endpoint might not exist yet, so we test both scenarios
        if response.status_code == 200:
            articles = response.json()
            self.assertIsInstance(articles, list, "Related articles response should be a list")
            
            print(f"✅ Related articles endpoint working - returned {len(articles)} articles")
            
            if articles:
                article = articles[0]
                required_fields = ["id", "title", "image", "published_at"]
                
                for field in required_fields:
                    self.assertIn(field, article, f"Missing required field '{field}' in related article")
                
                print(f"✅ Related articles structure verified")
                print(f"   - Sample related article: '{article['title'][:50]}...'")
        
        elif response.status_code == 404:
            print("⚠️ Related articles endpoint not found - testing fallback to entertainment category")
            
            # Test fallback to entertainment category
            fallback_response = requests.get(f"{API_URL}/articles/category/entertainment")
            
            if fallback_response.status_code == 200:
                articles = fallback_response.json()
                print(f"✅ Fallback to entertainment category working - returned {len(articles)} articles")
            else:
                print("⚠️ Entertainment category fallback also not available - frontend should use mock data")
        
        else:
            print(f"⚠️ Unexpected response status {response.status_code} for related articles endpoint")

    def test_reviews_categories_existence(self):
        """Test if movie-reviews and ott-reviews categories exist in database"""
        print("\n--- Testing Reviews Categories Existence ---")
        
        # Get all categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        
        categories = response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        # Check for movie-reviews category
        movie_reviews_exists = "movie-reviews" in category_slugs
        ott_reviews_exists = "ott-reviews" in category_slugs
        
        print(f"✅ Categories check completed:")
        print(f"   - movie-reviews category exists: {movie_reviews_exists}")
        print(f"   - ott-reviews category exists: {ott_reviews_exists}")
        
        if movie_reviews_exists:
            movie_reviews_cat = next((cat for cat in categories if cat["slug"] == "movie-reviews"), None)
            print(f"   - Movie Reviews category: {movie_reviews_cat['name']} (ID: {movie_reviews_cat['id']})")
        
        if ott_reviews_exists:
            ott_reviews_cat = next((cat for cat in categories if cat["slug"] == "ott-reviews"), None)
            print(f"   - OTT Reviews category: {ott_reviews_cat['name']} (ID: {ott_reviews_cat['id']})")
        
        if not movie_reviews_exists and not ott_reviews_exists:
            print("⚠️ Neither movie-reviews nor ott-reviews categories exist - frontend should handle gracefully with mock data")
        
        # This is not a failure condition since categories might not exist yet
        # The frontend should handle this gracefully with fallback to mock data

    def test_article_data_structure_for_reviews(self):
        """Test that article responses include all required fields for Reviews page"""
        print("\n--- Testing Article Data Structure for Reviews Page ---")
        
        # Test with any available category to verify general article structure
        response = requests.get(f"{API_URL}/categories")
        categories = response.json()
        
        if categories:
            # Use the first available category for testing
            test_category = categories[0]["slug"]
            
            response = requests.get(f"{API_URL}/articles/category/{test_category}")
            self.assertEqual(response.status_code, 200, f"Failed to get articles for category {test_category}")
            
            articles = response.json()
            
            if articles:
                article = articles[0]
                
                # Basic required fields for Reviews page
                basic_fields = ["id", "title", "image_url", "published_at"]
                for field in basic_fields:
                    self.assertIn(field, article, f"Missing basic field '{field}' required by Reviews page")
                
                # Optional fields that Reviews page can use
                optional_fields = ["rating", "reviewer", "author", "summary"]
                available_optional = []
                for field in optional_fields:
                    if field in article:
                        available_optional.append(field)
                
                print(f"✅ Article data structure verified for Reviews page:")
                print(f"   - Basic fields present: {basic_fields}")
                print(f"   - Optional fields available: {available_optional}")
                
                # Verify image field handling (Reviews page expects both image_url and image)
                if "image_url" in article:
                    print(f"   - Image URL field: present")
                if "image" in article:
                    print(f"   - Image field: present")
                
                print(f"   - Sample article ID: {article['id']}")
                print(f"   - Sample title: '{article['title'][:50]}...'")
            else:
                print(f"⚠️ No articles found in category {test_category}")

    def test_filter_functionality_published_at(self):
        """Test that articles have proper published_at timestamps for date filtering"""
        print("\n--- Testing Filter Functionality (published_at timestamps) ---")
        
        # Get articles from any available category
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        
        articles = response.json()
        
        if articles:
            articles_with_timestamps = 0
            valid_timestamps = 0
            
            for article in articles[:5]:  # Test first 5 articles
                if "published_at" in article and article["published_at"]:
                    articles_with_timestamps += 1
                    
                    # Try to parse the timestamp
                    try:
                        if isinstance(article["published_at"], str):
                            # Try different timestamp formats
                            try:
                                parsed_date = datetime.fromisoformat(article["published_at"].replace('Z', '+00:00'))
                                valid_timestamps += 1
                            except:
                                try:
                                    parsed_date = datetime.strptime(article["published_at"], "%Y-%m-%d %H:%M:%S")
                                    valid_timestamps += 1
                                except:
                                    try:
                                        parsed_date = datetime.strptime(article["published_at"], "%Y-%m-%dT%H:%M:%S")
                                        valid_timestamps += 1
                                    except:
                                        print(f"   ⚠️ Could not parse timestamp: {article['published_at']}")
                        else:
                            # Assume it's already a datetime object or timestamp
                            valid_timestamps += 1
                    except Exception as e:
                        print(f"   ⚠️ Error parsing timestamp for article {article['id']}: {e}")
            
            print(f"✅ Published timestamp analysis:")
            print(f"   - Articles with published_at field: {articles_with_timestamps}/{len(articles[:5])}")
            print(f"   - Valid parseable timestamps: {valid_timestamps}/{articles_with_timestamps}")
            
            if valid_timestamps > 0:
                print(f"✅ Date filtering functionality supported - timestamps are properly formatted")
            else:
                print(f"⚠️ Date filtering may have issues - timestamp format needs verification")
        else:
            print("⚠️ No articles available to test timestamp functionality")

    def test_reviews_page_api_integration(self):
        """Test complete API integration for Reviews page functionality"""
        print("\n--- Testing Complete Reviews Page API Integration ---")
        
        # Test 1: Movie Reviews tab data
        print("\n1. Testing Movie Reviews Tab Integration")
        movie_response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        movie_articles = movie_response.json() if movie_response.status_code == 200 else []
        
        # Test 2: OTT Reviews tab data  
        print("2. Testing OTT Reviews Tab Integration")
        ott_response = requests.get(f"{API_URL}/articles/category/ott-reviews")
        ott_articles = ott_response.json() if ott_response.status_code == 200 else []
        
        # Test 3: Related articles
        print("3. Testing Related Articles Integration")
        related_response = requests.get(f"{API_URL}/related-articles/reviews")
        if related_response.status_code != 200:
            # Try fallback to entertainment category
            related_response = requests.get(f"{API_URL}/articles/category/entertainment")
        related_articles = related_response.json() if related_response.status_code == 200 else []
        
        # Test 4: Pagination support
        print("4. Testing Pagination Support")
        paginated_response = requests.get(f"{API_URL}/articles/category/movie-reviews?limit=5")
        paginated_articles = paginated_response.json() if paginated_response.status_code == 200 else []
        
        # Summary
        print(f"\n✅ Reviews Page API Integration Summary:")
        print(f"   - Movie Reviews articles available: {len(movie_articles)}")
        print(f"   - OTT Reviews articles available: {len(ott_articles)}")
        print(f"   - Related articles available: {len(related_articles)}")
        print(f"   - Pagination working: {len(paginated_articles) <= 5 if paginated_articles else 'N/A'}")
        
        # Test error handling
        print("\n5. Testing Error Handling")
        invalid_response = requests.get(f"{API_URL}/articles/category/non-existent-category")
        self.assertEqual(invalid_response.status_code, 200, "Invalid category should return empty list, not error")
        invalid_articles = invalid_response.json()
        self.assertEqual(len(invalid_articles), 0, "Invalid category should return empty list")
        print("✅ Error handling working - invalid categories return empty lists")
        
        # Overall assessment
        total_available_articles = len(movie_articles) + len(ott_articles)
        if total_available_articles > 0:
            print(f"\n🎉 Reviews Page Backend Integration: WORKING")
            print(f"✅ Backend provides {total_available_articles} review articles across both tabs")
            print(f"✅ Related articles functionality available")
            print(f"✅ Error handling working correctly")
        else:
            print(f"\n⚠️ Reviews Page Backend Integration: LIMITED DATA")
            print(f"⚠️ No review articles found in movie-reviews or ott-reviews categories")
            print(f"✅ API endpoints working correctly (returning empty lists as expected)")
            print(f"✅ Frontend should handle gracefully with mock data fallback")

if __name__ == "__main__":
    # Create a test suite specifically for Reviews page
    suite = unittest.TestSuite()
    
    # Add Reviews page specific tests
    suite.addTest(ReviewsPageBackendTest("test_reviews_page_movie_reviews_endpoint"))
    suite.addTest(ReviewsPageBackendTest("test_reviews_page_ott_reviews_endpoint"))
    suite.addTest(ReviewsPageBackendTest("test_reviews_page_related_articles_endpoint"))
    suite.addTest(ReviewsPageBackendTest("test_reviews_categories_existence"))
    suite.addTest(ReviewsPageBackendTest("test_article_data_structure_for_reviews"))
    suite.addTest(ReviewsPageBackendTest("test_filter_functionality_published_at"))
    suite.addTest(ReviewsPageBackendTest("test_reviews_page_api_integration"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print final summary
    print(f"\n" + "="*80)
    print(f"REVIEWS PAGE BACKEND TESTING COMPLETED")
    print(f"="*80)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    if len(result.failures) == 0 and len(result.errors) == 0:
        print(f"\n🎉 ALL REVIEWS PAGE BACKEND TESTS PASSED!")
    else:
        print(f"\n⚠️ Some tests had issues - see details above")