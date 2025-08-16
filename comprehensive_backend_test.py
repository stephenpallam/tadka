#!/usr/bin/env python3
import requests
import json
import unittest
import os
import sys
from datetime import datetime
import time

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing API at: {API_URL}")

class ComprehensiveBackendTest(unittest.TestCase):
    """Comprehensive test suite for the Blog CMS API after UI changes"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")
        
        # Get categories for later use
        self.categories = requests.get(f"{API_URL}/categories").json()
        
        # Get articles for later use
        self.articles = requests.get(f"{API_URL}/articles").json()
        
        # Get movie reviews for later use
        self.movie_reviews = requests.get(f"{API_URL}/movie-reviews").json()
        
        # Get featured images for later use
        self.featured_images = requests.get(f"{API_URL}/featured-images").json()

    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n--- Testing Health Check Endpoint ---")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working")

    def test_02_database_seeding(self):
        """Test database seeding functionality"""
        print("\n--- Testing Database Seeding ---")
        # Verify categories were seeded
        self.assertGreaterEqual(len(self.categories), 12, "Categories not seeded correctly")
        
        # Verify articles were seeded
        self.assertGreaterEqual(len(self.articles), 60, "Articles not seeded correctly")
        
        # Verify movie reviews were seeded
        self.assertGreaterEqual(len(self.movie_reviews), 3, "Movie reviews not seeded correctly")
        
        # Verify featured images were seeded
        self.assertGreaterEqual(len(self.featured_images), 5, "Featured images not seeded correctly")
        
        print(f"✅ Database seeding working correctly. Found {len(self.categories)} categories, {len(self.articles)} articles, {len(self.movie_reviews)} movie reviews, and {len(self.featured_images)} featured images.")

    def test_03_categories_api(self):
        """Test all category API endpoints"""
        print("\n--- Testing Categories API ---")
        
        # Test GET /categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertIsInstance(categories, list, "Categories response is not a list")
        self.assertGreaterEqual(len(categories), 12, "Not enough categories returned")
        
        # Check category structure
        category = categories[0]
        required_fields = ["id", "name", "slug", "description", "created_at"]
        for field in required_fields:
            self.assertIn(field, category, f"Category missing required field: {field}")
        
        # Test pagination
        response = requests.get(f"{API_URL}/categories?skip=2&limit=3")
        self.assertEqual(response.status_code, 200, "Pagination request failed")
        paginated_categories = response.json()
        self.assertLessEqual(len(paginated_categories), 3, "Pagination limit not working")
        
        # Test POST /categories
        new_category = {
            "name": "Test Category",
            "slug": "test-category-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "description": "This is a test category"
        }
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 200, "Failed to create category")
        created_category = response.json()
        self.assertEqual(created_category["name"], new_category["name"])
        self.assertEqual(created_category["slug"], new_category["slug"])
        
        # Test duplicate slug validation
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 400, "Duplicate slug validation failed")
        
        print("✅ Categories API working correctly with proper validation")

    def test_04_articles_api(self):
        """Test all article API endpoints"""
        print("\n--- Testing Articles API ---")
        
        # Test GET /articles
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        self.assertIsInstance(articles, list, "Articles response is not a list")
        self.assertGreaterEqual(len(articles), 60, "Not enough articles returned")
        
        # Check article structure
        article = articles[0]
        required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category", "view_count"]
        for field in required_fields:
            self.assertIn(field, article, f"Article missing required field: {field}")
        
        # Test pagination
        response = requests.get(f"{API_URL}/articles?skip=5&limit=10")
        self.assertEqual(response.status_code, 200, "Pagination request failed")
        paginated_articles = response.json()
        self.assertLessEqual(len(paginated_articles), 10, "Pagination limit not working")
        
        # Test GET /articles/category/{slug}
        if self.categories:
            category_slug = self.categories[0]["slug"]
            response = requests.get(f"{API_URL}/articles/category/{category_slug}")
            self.assertEqual(response.status_code, 200, f"Failed to get articles for category {category_slug}")
            category_articles = response.json()
            self.assertIsInstance(category_articles, list, "Category articles response is not a list")
            
            # Test invalid category
            response = requests.get(f"{API_URL}/articles/category/invalid-category-slug")
            self.assertEqual(response.status_code, 200, "Invalid category should return empty list")
            self.assertEqual(len(response.json()), 0, "Invalid category should return empty list")
        
        # Test GET /articles/most-read
        response = requests.get(f"{API_URL}/articles/most-read")
        self.assertEqual(response.status_code, 200, "Failed to get most read articles")
        most_read = response.json()
        self.assertIsInstance(most_read, list, "Most read articles response is not a list")
        self.assertGreaterEqual(len(most_read), 1, "No most read articles returned")
        
        # Check if articles are sorted by view_count
        if len(most_read) > 1:
            self.assertGreaterEqual(most_read[0]["view_count"], most_read[1]["view_count"], 
                                   "Most read articles not sorted by view count")
        
        # Test GET /articles/featured
        response = requests.get(f"{API_URL}/articles/featured")
        if response.status_code == 200:
            featured = response.json()
            self.assertIn("is_featured", featured, "Featured article missing is_featured field")
            self.assertTrue(featured["is_featured"], "Featured article is_featured flag is not True")
        
        # Test GET /articles/{id}
        if self.articles:
            article_id = self.articles[0]["id"]
            initial_view_count = self.articles[0]["view_count"]
            
            response = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get article with ID {article_id}")
            article = response.json()
            self.assertEqual(article["id"], article_id)
            self.assertIn("content", article, "Full article missing content field")
            
            # Test view count increment
            response = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response.status_code, 200)
            article_again = response.json()
            self.assertEqual(article_again["view_count"], initial_view_count + 2, 
                             "View count did not increment correctly")
            
            # Test invalid article ID
            response = requests.get(f"{API_URL}/articles/9999")
            self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        
        # Test POST /articles
        if self.categories:
            category_id = self.categories[0]["id"]
            new_article = {
                "title": "Test Article " + datetime.now().strftime("%Y%m%d%H%M%S"),
                "content": "This is a test article content with detailed information.",
                "summary": "This is a test article summary.",
                "image_url": "https://example.com/test-image.jpg",
                "author": "Test Author",
                "is_published": True,
                "is_featured": False,
                "category_id": category_id
            }
            
            response = requests.post(f"{API_URL}/articles", json=new_article)
            self.assertEqual(response.status_code, 200, "Failed to create article")
            created_article = response.json()
            self.assertEqual(created_article["title"], new_article["title"])
            self.assertEqual(created_article["content"], new_article["content"])
        
        print("✅ Articles API working correctly with proper pagination, filtering, and view count increment")

    def test_05_movie_reviews_api(self):
        """Test all movie review API endpoints"""
        print("\n--- Testing Movie Reviews API ---")
        
        # Test GET /movie-reviews
        response = requests.get(f"{API_URL}/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie reviews")
        reviews = response.json()
        self.assertIsInstance(reviews, list, "Movie reviews response is not a list")
        self.assertGreaterEqual(len(reviews), 3, "Not enough movie reviews returned")
        
        # Check review structure
        review = reviews[0]
        required_fields = ["id", "title", "rating", "image_url", "created_at"]
        for field in required_fields:
            self.assertIn(field, review, f"Movie review missing required field: {field}")
        
        # Test pagination
        response = requests.get(f"{API_URL}/movie-reviews?skip=1&limit=2")
        self.assertEqual(response.status_code, 200, "Pagination request failed")
        paginated_reviews = response.json()
        self.assertLessEqual(len(paginated_reviews), 2, "Pagination limit not working")
        
        # Test GET /movie-reviews/{id}
        if self.movie_reviews:
            review_id = self.movie_reviews[0]["id"]
            response = requests.get(f"{API_URL}/movie-reviews/{review_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get movie review with ID {review_id}")
            review = response.json()
            self.assertEqual(review["id"], review_id)
            self.assertIn("content", review, "Full review missing content field")
            
            # Test invalid review ID
            response = requests.get(f"{API_URL}/movie-reviews/9999")
            self.assertEqual(response.status_code, 404, "Invalid review ID should return 404")
        
        # Test POST /movie-reviews
        new_review = {
            "title": "Test Movie Review " + datetime.now().strftime("%Y%m%d%H%M%S"),
            "rating": 4.2,
            "content": "This is a test movie review with detailed critique.",
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
        
        print("✅ Movie Reviews API working correctly with proper pagination and validation")

    def test_06_featured_images_api(self):
        """Test all featured image API endpoints"""
        print("\n--- Testing Featured Images API ---")
        
        # Test GET /featured-images
        response = requests.get(f"{API_URL}/featured-images")
        self.assertEqual(response.status_code, 200, "Failed to get featured images")
        images = response.json()
        self.assertIsInstance(images, list, "Featured images response is not a list")
        self.assertGreaterEqual(len(images), 5, "Not enough featured images returned")
        
        # Check image structure
        image = images[0]
        required_fields = ["id", "title", "image_url", "link_url", "order_index", "is_active"]
        for field in required_fields:
            self.assertIn(field, image, f"Featured image missing required field: {field}")
        
        # Test limit parameter
        response = requests.get(f"{API_URL}/featured-images?limit=3")
        self.assertEqual(response.status_code, 200, "Limit parameter request failed")
        limited_images = response.json()
        self.assertLessEqual(len(limited_images), 3, "Limit parameter not working")
        
        # Test POST /featured-images
        new_image = {
            "title": "Test Featured Image " + datetime.now().strftime("%Y%m%d%H%M%S"),
            "image_url": "https://example.com/test-featured.jpg",
            "link_url": "/articles/1",
            "description": "This is a test featured image",
            "order_index": 10,
            "is_active": True
        }
        
        response = requests.post(f"{API_URL}/featured-images", json=new_image)
        self.assertEqual(response.status_code, 200, "Failed to create featured image")
        created_image = response.json()
        self.assertEqual(created_image["title"], new_image["title"])
        self.assertEqual(created_image["image_url"], new_image["image_url"])
        
        print("✅ Featured Images API working correctly with proper limit parameter")

    def test_07_cors_configuration(self):
        """Test CORS configuration"""
        print("\n--- Testing CORS Configuration ---")
        
        # Test OPTIONS request
        response = requests.options(f"{API_URL}/", headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET"
        })
        self.assertEqual(response.status_code, 200, "OPTIONS request failed")
        self.assertIn("Access-Control-Allow-Origin", response.headers, "Missing Access-Control-Allow-Origin header")
        self.assertIn("Access-Control-Allow-Methods", response.headers, "Missing Access-Control-Allow-Methods header")
        self.assertIn("Access-Control-Allow-Headers", response.headers, "Missing Access-Control-Allow-Headers header")
        
        # Test cross-origin GET request
        response = requests.get(f"{API_URL}/", headers={
            "Origin": "http://example.com"
        })
        self.assertEqual(response.status_code, 200, "Cross-origin GET request failed")
        self.assertIn("Access-Control-Allow-Origin", response.headers, "Missing Access-Control-Allow-Origin header")
        
        print("✅ CORS configuration working correctly with proper headers")

    def test_08_analytics_tracking(self):
        """Test analytics tracking endpoint"""
        print("\n--- Testing Analytics Tracking Endpoint ---")
        
        # Test basic page view tracking
        tracking_data = {
            "page": "/home",
            "event": "page_view",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=tracking_data)
        self.assertEqual(response.status_code, 200, "Failed to track analytics data")
        data = response.json()
        self.assertEqual(data["status"], "success", "Analytics tracking status not successful")
        self.assertEqual(data["message"], "Analytics data tracked successfully", "Incorrect success message")
        
        # Test article view tracking
        if self.articles:
            article_id = self.articles[0]["id"]
            article_tracking = {
                "page": f"/articles/{article_id}",
                "event": "article_view",
                "article_id": article_id,
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(f"{API_URL}/analytics/track", json=article_tracking)
            self.assertEqual(response.status_code, 200, "Failed to track article view")
            self.assertEqual(response.json()["status"], "success", "Article view tracking status not successful")
        
        # Test movie review view tracking
        if self.movie_reviews:
            review_id = self.movie_reviews[0]["id"]
            review_tracking = {
                "page": f"/movie-reviews/{review_id}",
                "event": "movie_review_view",
                "review_id": review_id,
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(f"{API_URL}/analytics/track", json=review_tracking)
            self.assertEqual(response.status_code, 200, "Failed to track movie review view")
            self.assertEqual(response.json()["status"], "success", "Movie review tracking status not successful")
        
        print("✅ Analytics tracking endpoint working correctly for various event types")

    def test_09_error_handling(self):
        """Test error handling"""
        print("\n--- Testing Error Handling ---")
        
        # Test 404 for non-existent resource
        response = requests.get(f"{API_URL}/non-existent-endpoint")
        self.assertEqual(response.status_code, 404, "Non-existent endpoint should return 404")
        
        # Test 404 for non-existent article
        response = requests.get(f"{API_URL}/articles/9999")
        self.assertEqual(response.status_code, 404, "Non-existent article should return 404")
        
        # Test 404 for non-existent movie review
        response = requests.get(f"{API_URL}/movie-reviews/9999")
        self.assertEqual(response.status_code, 404, "Non-existent movie review should return 404")
        
        # Test 400 for validation error
        if self.categories:
            # Try to create a category with an existing slug
            existing_slug = self.categories[0]["slug"]
            duplicate_category = {
                "name": "Duplicate Category",
                "slug": existing_slug,
                "description": "This should fail validation"
            }
            
            response = requests.post(f"{API_URL}/categories", json=duplicate_category)
            self.assertEqual(response.status_code, 400, "Duplicate slug should return 400")
        
        print("✅ Error handling working correctly for 404 and 400 responses")

    def test_10_performance(self):
        """Test API performance"""
        print("\n--- Testing API Performance ---")
        
        # Test health check endpoint response time
        start_time = time.time()
        response = requests.get(f"{API_URL}/")
        end_time = time.time()
        health_check_time = end_time - start_time
        self.assertLess(health_check_time, 1.0, "Health check endpoint too slow")
        print(f"Health check response time: {health_check_time:.3f} seconds")
        
        # Test articles endpoint response time
        start_time = time.time()
        response = requests.get(f"{API_URL}/articles")
        end_time = time.time()
        articles_time = end_time - start_time
        self.assertLess(articles_time, 2.0, "Articles endpoint too slow")
        print(f"Articles endpoint response time: {articles_time:.3f} seconds")
        
        # Test categories endpoint response time
        start_time = time.time()
        response = requests.get(f"{API_URL}/categories")
        end_time = time.time()
        categories_time = end_time - start_time
        self.assertLess(categories_time, 1.0, "Categories endpoint too slow")
        print(f"Categories endpoint response time: {categories_time:.3f} seconds")
        
        print("✅ API performance is acceptable")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add all tests in order
    suite.addTest(ComprehensiveBackendTest("test_01_health_check"))
    suite.addTest(ComprehensiveBackendTest("test_02_database_seeding"))
    suite.addTest(ComprehensiveBackendTest("test_03_categories_api"))
    suite.addTest(ComprehensiveBackendTest("test_04_articles_api"))
    suite.addTest(ComprehensiveBackendTest("test_05_movie_reviews_api"))
    suite.addTest(ComprehensiveBackendTest("test_06_featured_images_api"))
    suite.addTest(ComprehensiveBackendTest("test_07_cors_configuration"))
    suite.addTest(ComprehensiveBackendTest("test_08_analytics_tracking"))
    suite.addTest(ComprehensiveBackendTest("test_09_error_handling"))
    suite.addTest(ComprehensiveBackendTest("test_10_performance"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)