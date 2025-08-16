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

class ComprehensiveBackendTest(unittest.TestCase):
    """Comprehensive test suite for the Blog CMS API after UI height changes"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_health_check(self):
        """Test the health check endpoint"""
        print("\n--- Testing Health Check Endpoint ---")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working")

    def test_database_connectivity(self):
        """Test database connectivity by verifying data retrieval"""
        print("\n--- Testing Database Connectivity ---")
        
        # Test categories retrieval
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertGreater(len(categories), 0, "No categories returned from database")
        print(f"✅ Database connectivity working - retrieved {len(categories)} categories")
        
        # Test articles retrieval
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        self.assertGreater(len(articles), 0, "No articles returned from database")
        print(f"✅ Database connectivity working - retrieved {len(articles)} articles")
        
        # Test movie reviews retrieval
        response = requests.get(f"{API_URL}/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie reviews")
        reviews = response.json()
        self.assertGreater(len(reviews), 0, "No movie reviews returned from database")
        print(f"✅ Database connectivity working - retrieved {len(reviews)} movie reviews")
        
        # Test featured images retrieval
        response = requests.get(f"{API_URL}/featured-images")
        self.assertEqual(response.status_code, 200, "Failed to get featured images")
        images = response.json()
        self.assertGreater(len(images), 0, "No featured images returned from database")
        print(f"✅ Database connectivity working - retrieved {len(images)} featured images")

    def test_articles_api_with_pagination(self):
        """Test articles API with various pagination parameters"""
        print("\n--- Testing Articles API with Pagination ---")
        
        # Test default pagination
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        total_articles = len(articles)
        print(f"Total articles: {total_articles}")
        
        # Test with small limit
        limit = 5
        response = requests.get(f"{API_URL}/articles?limit={limit}")
        self.assertEqual(response.status_code, 200, "Failed to get articles with limit")
        limited_articles = response.json()
        self.assertLessEqual(len(limited_articles), limit, f"Limit parameter not working, got {len(limited_articles)} articles instead of {limit}")
        print(f"✅ Articles pagination with limit={limit} working")
        
        # Test with skip
        skip = 10
        response = requests.get(f"{API_URL}/articles?skip={skip}")
        self.assertEqual(response.status_code, 200, "Failed to get articles with skip")
        skipped_articles = response.json()
        if total_articles > skip:
            self.assertLessEqual(len(skipped_articles), total_articles - skip, "Skip parameter not working correctly")
        print(f"✅ Articles pagination with skip={skip} working")
        
        # Test with both skip and limit
        skip = 15
        limit = 10
        response = requests.get(f"{API_URL}/articles?skip={skip}&limit={limit}")
        self.assertEqual(response.status_code, 200, "Failed to get articles with skip and limit")
        paginated_articles = response.json()
        self.assertLessEqual(len(paginated_articles), limit, "Pagination with skip and limit not working correctly")
        print(f"✅ Articles pagination with skip={skip} and limit={limit} working")

    def test_categories_api(self):
        """Test categories API functionality"""
        print("\n--- Testing Categories API ---")
        
        # Get all categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertGreater(len(categories), 0, "No categories returned")
        print(f"✅ GET categories endpoint working, returned {len(categories)} categories")
        
        # Verify category structure
        category = categories[0]
        required_fields = ["id", "name", "slug", "description", "created_at"]
        for field in required_fields:
            self.assertIn(field, category, f"Category missing required field: {field}")
        print("✅ Category data structure is correct")
        
        # Test creating a new category with unique slug
        unique_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        new_category = {
            "name": f"Test Category {unique_timestamp}",
            "slug": f"test-category-{unique_timestamp}",
            "description": "This is a test category created during comprehensive testing"
        }
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 200, "Failed to create category")
        created_category = response.json()
        self.assertEqual(created_category["name"], new_category["name"])
        self.assertEqual(created_category["slug"], new_category["slug"])
        print("✅ POST categories endpoint working with unique slug")
        
        # Test creating a category with duplicate slug (should fail)
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 400, "Duplicate slug validation failed")
        print("✅ Category duplicate slug validation working")

    def test_movie_reviews_api(self):
        """Test movie reviews API functionality"""
        print("\n--- Testing Movie Reviews API ---")
        
        # Get all movie reviews
        response = requests.get(f"{API_URL}/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie reviews")
        reviews = response.json()
        self.assertGreater(len(reviews), 0, "No movie reviews returned")
        print(f"✅ GET movie reviews endpoint working, returned {len(reviews)} reviews")
        
        # Get a specific movie review
        review_id = reviews[0]["id"]
        response = requests.get(f"{API_URL}/movie-reviews/{review_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get movie review with ID {review_id}")
        review = response.json()
        self.assertEqual(review["id"], review_id)
        required_fields = ["title", "rating", "content", "image_url", "director", "cast", "genre"]
        for field in required_fields:
            self.assertIn(field, review, f"Movie review missing required field: {field}")
        print(f"✅ GET movie review by ID endpoint working for review ID {review_id}")
        
        # Create a new movie review
        unique_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        new_review = {
            "title": f"Test Movie Review {unique_timestamp}",
            "rating": 4.7,
            "content": "This is a test movie review created during comprehensive testing",
            "image_url": "https://example.com/test-movie.jpg",
            "director": "Test Director",
            "cast": "Actor 1, Actor 2, Actor 3",
            "genre": "Action/Drama",
            "reviewer": "Test Reviewer",
            "is_published": True
        }
        response = requests.post(f"{API_URL}/movie-reviews", json=new_review)
        self.assertEqual(response.status_code, 200, "Failed to create movie review")
        created_review = response.json()
        self.assertEqual(created_review["title"], new_review["title"])
        self.assertEqual(created_review["rating"], new_review["rating"])
        print("✅ POST movie reviews endpoint working")

    def test_featured_images_api(self):
        """Test featured images API functionality"""
        print("\n--- Testing Featured Images API ---")
        
        # Get all featured images
        response = requests.get(f"{API_URL}/featured-images")
        self.assertEqual(response.status_code, 200, "Failed to get featured images")
        images = response.json()
        self.assertGreater(len(images), 0, "No featured images returned")
        print(f"✅ GET featured images endpoint working, returned {len(images)} images")
        
        # Test limit parameter
        limit = 2
        response = requests.get(f"{API_URL}/featured-images?limit={limit}")
        self.assertEqual(response.status_code, 200, f"Failed to get featured images with limit={limit}")
        limited_images = response.json()
        self.assertLessEqual(len(limited_images), limit, f"Limit parameter not working, got {len(limited_images)} images instead of {limit}")
        print(f"✅ Featured images limit parameter working with limit={limit}")
        
        # Create a new featured image
        unique_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        new_image = {
            "title": f"Test Featured Image {unique_timestamp}",
            "image_url": "https://example.com/test-featured.jpg",
            "link_url": "/articles/1",
            "description": "This is a test featured image created during comprehensive testing",
            "order_index": 10,
            "is_active": True
        }
        response = requests.post(f"{API_URL}/featured-images", json=new_image)
        self.assertEqual(response.status_code, 200, "Failed to create featured image")
        created_image = response.json()
        self.assertEqual(created_image["title"], new_image["title"])
        self.assertEqual(created_image["image_url"], new_image["image_url"])
        print("✅ POST featured images endpoint working")

    def test_article_view_count_increment(self):
        """Test article view count increment functionality"""
        print("\n--- Testing Article View Count Increment ---")
        
        # Get an article ID
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        article_id = articles[0]["id"]
        initial_view_count = articles[0]["view_count"]
        print(f"Testing article ID {article_id} with initial view count {initial_view_count}")
        
        # View the article to increment view count
        response = requests.get(f"{API_URL}/articles/{article_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get article with ID {article_id}")
        
        # Get the article again to check if view count incremented
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        updated_articles = response.json()
        
        # Find the same article in the updated list
        updated_article = None
        for article in updated_articles:
            if article["id"] == article_id:
                updated_article = article
                break
        
        self.assertIsNotNone(updated_article, f"Could not find article with ID {article_id} in updated list")
        self.assertEqual(updated_article["view_count"], initial_view_count + 1, 
                         f"View count did not increment correctly. Expected {initial_view_count + 1}, got {updated_article['view_count']}")
        print(f"✅ Article view count increment working. Initial: {initial_view_count}, Updated: {updated_article['view_count']}")

    def test_cors_configuration(self):
        """Test CORS configuration"""
        print("\n--- Testing CORS Configuration ---")
        
        # Test with OPTIONS request
        response = requests.options(f"{API_URL}/", headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET"
        })
        self.assertEqual(response.status_code, 200, "OPTIONS request failed")
        
        # Check CORS headers
        self.assertIn("Access-Control-Allow-Origin", response.headers, "Missing Access-Control-Allow-Origin header")
        self.assertIn("Access-Control-Allow-Methods", response.headers, "Missing Access-Control-Allow-Methods header")
        self.assertIn("Access-Control-Allow-Headers", response.headers, "Missing Access-Control-Allow-Headers header")
        
        # Check if Origin is allowed
        origin_header = response.headers.get("Access-Control-Allow-Origin")
        self.assertTrue(origin_header == "*" or origin_header == "http://example.com", 
                        f"Access-Control-Allow-Origin header has unexpected value: {origin_header}")
        
        print("✅ CORS headers are properly configured")
        
        # Test with actual request from different origin
        response = requests.get(f"{API_URL}/", headers={
            "Origin": "http://example.com"
        })
        self.assertEqual(response.status_code, 200, "GET request with Origin header failed")
        self.assertIn("Access-Control-Allow-Origin", response.headers, "Missing Access-Control-Allow-Origin header in actual request")
        print("✅ CORS is working for actual requests")

    def test_analytics_tracking(self):
        """Test analytics tracking endpoint"""
        print("\n--- Testing Analytics Tracking Endpoint ---")
        
        # Test with standard page view tracking
        tracking_data = {
            "page": "/latest-news",
            "event": "page_view",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=tracking_data)
        self.assertEqual(response.status_code, 200, "Failed to track analytics data")
        data = response.json()
        self.assertEqual(data["status"], "success", f"Analytics tracking failed with status: {data.get('status')}")
        self.assertEqual(data["message"], "Analytics data tracked successfully")
        print("✅ Analytics tracking endpoint working for page views")
        
        # Test with article view tracking
        article_tracking = {
            "page": "/articles/1",
            "event": "article_view",
            "article_id": 1,
            "article_title": "State Assembly Session Begins Today",
            "category": "Top News",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=article_tracking)
        self.assertEqual(response.status_code, 200, "Failed to track article view analytics")
        data = response.json()
        self.assertEqual(data["status"], "success")
        print("✅ Analytics tracking working for article views")
        
        # Test with component height change tracking
        height_change_tracking = {
            "page": "/",
            "event": "component_height_change",
            "component": "PoliticalNews",
            "old_height": 662,
            "new_height": 643,
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=height_change_tracking)
        self.assertEqual(response.status_code, 200, "Failed to track component height change analytics")
        data = response.json()
        self.assertEqual(data["status"], "success")
        print("✅ Analytics tracking working for component height changes")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add all tests
    suite.addTest(ComprehensiveBackendTest("test_health_check"))
    suite.addTest(ComprehensiveBackendTest("test_database_connectivity"))
    suite.addTest(ComprehensiveBackendTest("test_articles_api_with_pagination"))
    suite.addTest(ComprehensiveBackendTest("test_categories_api"))
    suite.addTest(ComprehensiveBackendTest("test_movie_reviews_api"))
    suite.addTest(ComprehensiveBackendTest("test_featured_images_api"))
    suite.addTest(ComprehensiveBackendTest("test_article_view_count_increment"))
    suite.addTest(ComprehensiveBackendTest("test_cors_configuration"))
    suite.addTest(ComprehensiveBackendTest("test_analytics_tracking"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)