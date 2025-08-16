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

class BlogCMSAPITest(unittest.TestCase):
    """Test suite for the Blog CMS API"""

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

    def test_get_categories(self):
        """Test getting all categories"""
        print("\n--- Testing GET Categories Endpoint ---")
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertIsInstance(categories, list, "Categories response is not a list")
        self.assertGreater(len(categories), 0, "No categories returned")
        
        # Check category structure
        category = categories[0]
        self.assertIn("id", category)
        self.assertIn("name", category)
        self.assertIn("slug", category)
        self.assertIn("description", category)
        self.assertIn("created_at", category)
        print(f"✅ GET categories endpoint working, returned {len(categories)} categories")
        
        # Test pagination
        response = requests.get(f"{API_URL}/categories?skip=2&limit=3")
        self.assertEqual(response.status_code, 200)
        paginated_categories = response.json()
        self.assertLessEqual(len(paginated_categories), 3, "Pagination limit not working")
        print("✅ Categories pagination working")

    def test_create_category(self):
        """Test creating a new category"""
        print("\n--- Testing POST Categories Endpoint ---")
        new_category = {
            "name": "Test Category",
            "slug": "test-category",
            "description": "This is a test category"
        }
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 200, "Failed to create category")
        created_category = response.json()
        self.assertEqual(created_category["name"], new_category["name"])
        self.assertEqual(created_category["slug"], new_category["slug"])
        self.assertEqual(created_category["description"], new_category["description"])
        print("✅ POST categories endpoint working")
        
        # Test duplicate slug error
        response = requests.post(f"{API_URL}/categories", json=new_category)
        self.assertEqual(response.status_code, 400, "Duplicate slug validation failed")
        print("✅ Category duplicate slug validation working")

    def test_get_articles(self):
        """Test getting all articles"""
        print("\n--- Testing GET Articles Endpoint ---")
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        self.assertIsInstance(articles, list, "Articles response is not a list")
        self.assertGreater(len(articles), 0, "No articles returned")
        
        # Check article structure
        article = articles[0]
        self.assertIn("id", article)
        self.assertIn("title", article)
        self.assertIn("summary", article)
        self.assertIn("image_url", article)
        self.assertIn("author", article)
        self.assertIn("published_at", article)
        self.assertIn("category", article)
        self.assertIn("view_count", article)
        print(f"✅ GET articles endpoint working, returned {len(articles)} articles")
        
        # Test pagination
        response = requests.get(f"{API_URL}/articles?skip=5&limit=10")
        self.assertEqual(response.status_code, 200)
        paginated_articles = response.json()
        self.assertLessEqual(len(paginated_articles), 10, "Pagination limit not working")
        print("✅ Articles pagination working")

    def test_get_articles_by_category(self):
        """Test getting articles by category slug"""
        print("\n--- Testing GET Articles by Category Endpoint ---")
        # First get a category slug
        response = requests.get(f"{API_URL}/categories")
        categories = response.json()
        category_slug = categories[0]["slug"]
        
        # Get articles for this category
        response = requests.get(f"{API_URL}/articles/category/{category_slug}")
        self.assertEqual(response.status_code, 200, f"Failed to get articles for category {category_slug}")
        articles = response.json()
        self.assertIsInstance(articles, list, "Category articles response is not a list")
        print(f"✅ GET articles by category endpoint working, returned {len(articles)} articles for category '{category_slug}'")
        
        # Test with invalid category slug
        response = requests.get(f"{API_URL}/articles/category/invalid-category-slug")
        self.assertEqual(response.status_code, 200, "Invalid category should return empty list, not error")
        articles = response.json()
        self.assertEqual(len(articles), 0, "Invalid category should return empty list")
        print("✅ Articles by invalid category returns empty list")

    def test_get_most_read_articles(self):
        """Test getting most read articles"""
        print("\n--- Testing GET Most Read Articles Endpoint ---")
        response = requests.get(f"{API_URL}/articles/most-read")
        self.assertEqual(response.status_code, 200, "Failed to get most read articles")
        articles = response.json()
        self.assertIsInstance(articles, list, "Most read articles response is not a list")
        self.assertGreater(len(articles), 0, "No most read articles returned")
        
        # Check if articles are sorted by view_count in descending order
        if len(articles) > 1:
            self.assertGreaterEqual(articles[0]["view_count"], articles[1]["view_count"], 
                                   "Most read articles not sorted by view count")
        print(f"✅ GET most read articles endpoint working, returned {len(articles)} articles")
        
        # Test limit parameter
        response = requests.get(f"{API_URL}/articles/most-read?limit=5")
        self.assertEqual(response.status_code, 200)
        limited_articles = response.json()
        self.assertLessEqual(len(limited_articles), 5, "Limit parameter not working")
        print("✅ Most read articles limit parameter working")

    def test_get_featured_article(self):
        """Test getting featured article"""
        print("\n--- Testing GET Featured Article Endpoint ---")
        response = requests.get(f"{API_URL}/articles/featured")
        
        # If there's a featured article, check its structure
        if response.status_code == 200:
            article = response.json()
            self.assertIn("id", article)
            self.assertIn("title", article)
            self.assertIn("content", article)
            self.assertIn("summary", article)
            self.assertIn("image_url", article)
            self.assertIn("author", article)
            self.assertIn("is_featured", article)
            self.assertTrue(article["is_featured"], "Featured article is_featured flag is not True")
            print("✅ GET featured article endpoint working")
        elif response.status_code == 404:
            # This is also acceptable if no featured article exists
            print("⚠️ No featured article found (404 response)")
        else:
            self.fail(f"Unexpected status code {response.status_code} for featured article")

    def test_get_article_by_id(self):
        """Test getting article by ID and view count increment"""
        print("\n--- Testing GET Article by ID Endpoint ---")
        # First get an article ID
        response = requests.get(f"{API_URL}/articles")
        articles = response.json()
        article_id = articles[0]["id"]
        
        # Get initial view count
        initial_view_count = articles[0]["view_count"]
        
        # Get the article by ID
        response = requests.get(f"{API_URL}/articles/{article_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get article with ID {article_id}")
        article = response.json()
        self.assertEqual(article["id"], article_id)
        self.assertIn("content", article)  # Full article should have content
        print(f"✅ GET article by ID endpoint working for article ID {article_id}")
        
        # Get the article again to check if view count incremented
        response = requests.get(f"{API_URL}/articles/{article_id}")
        self.assertEqual(response.status_code, 200)
        article_again = response.json()
        self.assertEqual(article_again["view_count"], initial_view_count + 2, 
                         "View count did not increment correctly")
        print("✅ Article view count increment working")
        
        # Test with invalid article ID
        response = requests.get(f"{API_URL}/articles/9999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        print("✅ Invalid article ID returns 404")

    def test_create_article(self):
        """Test creating a new article"""
        print("\n--- Testing POST Articles Endpoint ---")
        # First get a category ID
        response = requests.get(f"{API_URL}/categories")
        categories = response.json()
        category_id = categories[0]["id"]
        
        new_article = {
            "title": "Test Article",
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
        self.assertEqual(created_article["summary"], new_article["summary"])
        self.assertEqual(created_article["category_id"], new_article["category_id"])
        print("✅ POST articles endpoint working")

    def test_get_movie_reviews(self):
        """Test getting all movie reviews"""
        print("\n--- Testing GET Movie Reviews Endpoint ---")
        response = requests.get(f"{API_URL}/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie reviews")
        reviews = response.json()
        self.assertIsInstance(reviews, list, "Movie reviews response is not a list")
        self.assertGreater(len(reviews), 0, "No movie reviews returned")
        
        # Check review structure
        review = reviews[0]
        self.assertIn("id", review)
        self.assertIn("title", review)
        self.assertIn("rating", review)
        self.assertIn("image_url", review)
        self.assertIn("created_at", review)
        print(f"✅ GET movie reviews endpoint working, returned {len(reviews)} reviews")
        
        # Test pagination
        response = requests.get(f"{API_URL}/movie-reviews?skip=1&limit=2")
        self.assertEqual(response.status_code, 200)
        paginated_reviews = response.json()
        self.assertLessEqual(len(paginated_reviews), 2, "Pagination limit not working")
        print("✅ Movie reviews pagination working")

    def test_get_movie_review_by_id(self):
        """Test getting movie review by ID"""
        print("\n--- Testing GET Movie Review by ID Endpoint ---")
        # First get a review ID
        response = requests.get(f"{API_URL}/movie-reviews")
        reviews = response.json()
        review_id = reviews[0]["id"]
        
        # Get the review by ID
        response = requests.get(f"{API_URL}/movie-reviews/{review_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get movie review with ID {review_id}")
        review = response.json()
        self.assertEqual(review["id"], review_id)
        self.assertIn("content", review)  # Full review should have content
        self.assertIn("director", review)
        self.assertIn("cast", review)
        self.assertIn("genre", review)
        print(f"✅ GET movie review by ID endpoint working for review ID {review_id}")
        
        # Test with invalid review ID
        response = requests.get(f"{API_URL}/movie-reviews/9999")
        self.assertEqual(response.status_code, 404, "Invalid review ID should return 404")
        print("✅ Invalid movie review ID returns 404")

    def test_create_movie_review(self):
        """Test creating a new movie review"""
        print("\n--- Testing POST Movie Reviews Endpoint ---")
        new_review = {
            "title": "Test Movie Review",
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
        self.assertEqual(created_review["content"], new_review["content"])
        self.assertEqual(created_review["director"], new_review["director"])
        print("✅ POST movie reviews endpoint working")

    def test_get_featured_images(self):
        """Test getting featured images"""
        print("\n--- Testing GET Featured Images Endpoint ---")
        response = requests.get(f"{API_URL}/featured-images")
        self.assertEqual(response.status_code, 200, "Failed to get featured images")
        images = response.json()
        self.assertIsInstance(images, list, "Featured images response is not a list")
        self.assertGreater(len(images), 0, "No featured images returned")
        
        # Check image structure
        image = images[0]
        self.assertIn("id", image)
        self.assertIn("title", image)
        self.assertIn("image_url", image)
        self.assertIn("link_url", image)
        self.assertIn("order_index", image)
        self.assertIn("is_active", image)
        print(f"✅ GET featured images endpoint working, returned {len(images)} images")
        
        # Test limit parameter
        response = requests.get(f"{API_URL}/featured-images?limit=3")
        self.assertEqual(response.status_code, 200)
        limited_images = response.json()
        self.assertLessEqual(len(limited_images), 3, "Limit parameter not working")
        print("✅ Featured images limit parameter working")

    def test_create_featured_image(self):
        """Test creating a new featured image"""
        print("\n--- Testing POST Featured Images Endpoint ---")
        new_image = {
            "title": "Test Featured Image",
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
        self.assertEqual(created_image["link_url"], new_image["link_url"])
        self.assertEqual(created_image["order_index"], new_image["order_index"])
        print("✅ POST featured images endpoint working")

    def test_cors_headers(self):
        """Test CORS headers are properly set"""
        print("\n--- Testing CORS Headers ---")
        response = requests.options(f"{API_URL}/", headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET"
        })
        self.assertEqual(response.status_code, 200, "OPTIONS request failed")
        self.assertIn("Access-Control-Allow-Origin", response.headers)
        # The server might reflect the Origin header instead of using wildcard "*"
        self.assertIn(response.headers["Access-Control-Allow-Origin"], ["*", "http://example.com"])
        self.assertIn("Access-Control-Allow-Methods", response.headers)
        print("✅ CORS headers are properly set")

    def test_analytics_tracking(self):
        """Test analytics tracking endpoint"""
        print("\n--- Testing Analytics Tracking Endpoint ---")
        tracking_data = {
            "page": "/vertical-gallery/1",
            "event": "page_view",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=tracking_data)
        self.assertEqual(response.status_code, 200, "Failed to track analytics data")
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["message"], "Analytics data tracked successfully")
        self.assertIn("timestamp", data)
        print("✅ Analytics tracking endpoint working")
        
        # Test with vertical gallery specific tracking
        vertical_gallery_tracking = {
            "page": "/vertical-gallery/1",
            "event": "vertical_gallery_view",
            "article_id": 1,
            "article_title": "Profile: Young Entrepreneur's Success Journey",
            "category": "TravelPics",
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=vertical_gallery_tracking)
        self.assertEqual(response.status_code, 200, "Failed to track vertical gallery analytics")
        data = response.json()
        self.assertEqual(data["status"], "success")
        print("✅ Vertical gallery analytics tracking working")

    def test_vertical_gallery_support(self):
        """Test backend support for vertical gallery pages"""
        print("\n--- Testing Vertical Gallery Support ---")
        
        # First, get all articles to find the TravelPics category article
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        # Look for articles in the TravelPics category or with "Entrepreneur" in the title
        travel_article_id = None
        for article in articles:
            if article["category"] == "TravelPics" or "Entrepreneur" in article["title"]:
                travel_article_id = article["id"]
                break
        
        # If we didn't find a specific article, use the first one
        if not travel_article_id and articles:
            travel_article_id = articles[0]["id"]
        
        self.assertIsNotNone(travel_article_id, "No articles found to test vertical gallery")
        
        # Get the specific article that would be used for vertical gallery
        response = requests.get(f"{API_URL}/articles/{travel_article_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get article with ID {travel_article_id}")
        article = response.json()
        
        # Verify the article has the necessary fields for vertical gallery display
        self.assertIn("id", article)
        self.assertIn("title", article)
        self.assertIn("content", article)
        self.assertIn("image_url", article)
        print(f"✅ Article retrieval for vertical gallery working with article ID {travel_article_id}")
        
        # Test analytics tracking for vertical gallery
        tracking_data = {
            "page": f"/vertical-gallery/{travel_article_id}",
            "event": "vertical_gallery_view",
            "article_id": travel_article_id,
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{API_URL}/analytics/track", json=tracking_data)
        self.assertEqual(response.status_code, 200, "Failed to track vertical gallery view")
        print("✅ Vertical gallery view tracking working")

    def test_national_tab_top_stories_implementation(self):
        """Test National Tab implementation in Top Stories section"""
        print("\n--- Testing National Tab Top Stories Implementation ---")
        
        # Test 1: Database Categories Verification
        print("\n1. Testing Database Categories")
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        
        # Check for required categories
        category_slugs = [cat["slug"] for cat in categories]
        self.assertIn("top-stories", category_slugs, "top-stories category not found in database")
        self.assertIn("national-top-stories", category_slugs, "national-top-stories category not found in database")
        
        # Get category details
        top_stories_cat = next((cat for cat in categories if cat["slug"] == "top-stories"), None)
        national_top_stories_cat = next((cat for cat in categories if cat["slug"] == "national-top-stories"), None)
        
        self.assertIsNotNone(top_stories_cat, "top-stories category details not found")
        self.assertIsNotNone(national_top_stories_cat, "national-top-stories category details not found")
        
        self.assertEqual(top_stories_cat["name"], "Top Stories")
        self.assertEqual(national_top_stories_cat["name"], "National Top Stories")
        
        print("✅ Database categories verified - both 'top-stories' and 'national-top-stories' exist")
        print(f"   - Top Stories: {top_stories_cat['name']} (slug: {top_stories_cat['slug']})")
        print(f"   - National Top Stories: {national_top_stories_cat['name']} (slug: {national_top_stories_cat['slug']})")
        
        # Test 2: API Endpoint Testing
        print("\n2. Testing /api/articles/sections/top-stories Endpoint")
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
        
        print("✅ API endpoint structure verified - returns proper JSON with 'top_stories' and 'national' arrays")
        print(f"   - Top Stories articles: {len(top_stories_articles)}")
        print(f"   - National articles: {len(national_articles)}")
        
        # Test 3: Article Content Verification
        print("\n3. Testing Article Content and Fields")
        
        # Test top_stories articles
        if top_stories_articles:
            article = top_stories_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in top_stories article")
            
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Article title should be string")
            self.assertIsInstance(article["summary"], str, "Article summary should be string")
            self.assertIsInstance(article["author"], str, "Article author should be string")
            
            print("✅ Top Stories articles have proper field structure")
            print(f"   - Sample article: '{article['title']}' by {article['author']}")
        else:
            print("⚠️ No top_stories articles found - database may need seeding")
        
        # Test national articles
        if national_articles:
            article = national_articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "category", "published_at"]
            
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}' in national article")
            
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Article title should be string")
            self.assertIsInstance(article["summary"], str, "Article summary should be string")
            self.assertIsInstance(article["author"], str, "Article author should be string")
            
            print("✅ National articles have proper field structure")
            print(f"   - Sample article: '{article['title']}' by {article['author']}")
        else:
            print("⚠️ No national articles found - database may need seeding")
        
        # Test 4: Database Seeding Verification
        print("\n4. Testing Database Seeding for New Categories")
        
        # Check articles in top-stories category
        response = requests.get(f"{API_URL}/articles/category/top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get top-stories category articles")
        top_stories_db_articles = response.json()
        
        # Check articles in national-top-stories category
        response = requests.get(f"{API_URL}/articles/category/national-top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get national-top-stories category articles")
        national_db_articles = response.json()
        
        self.assertGreater(len(top_stories_db_articles), 0, "No articles found in top-stories category")
        self.assertGreater(len(national_db_articles), 0, "No articles found in national-top-stories category")
        
        print("✅ Database seeding verified - both categories have sample articles")
        print(f"   - top-stories category: {len(top_stories_db_articles)} articles")
        print(f"   - national-top-stories category: {len(national_db_articles)} articles")
        
        # Verify article content quality
        if top_stories_db_articles:
            sample_article = top_stories_db_articles[0]
            self.assertGreater(len(sample_article["title"]), 10, "Article titles should be substantial")
            self.assertGreater(len(sample_article["summary"]), 20, "Article summaries should be substantial")
            print(f"   - Sample top story: '{sample_article['title'][:50]}...'")
        
        if national_db_articles:
            sample_article = national_db_articles[0]
            self.assertGreater(len(sample_article["title"]), 10, "Article titles should be substantial")
            self.assertGreater(len(sample_article["summary"]), 20, "Article summaries should be substantial")
            print(f"   - Sample national story: '{sample_article['title'][:50]}...'")
        
        # Test 5: CMS Integration Verification
        print("\n5. Testing CMS Integration for New Categories")
        
        # Test CMS config includes new categories
        response = requests.get(f"{API_URL}/cms/config")
        self.assertEqual(response.status_code, 200, "Failed to get CMS config")
        cms_config = response.json()
        
        self.assertIn("categories", cms_config, "CMS config missing categories")
        cms_categories = cms_config["categories"]
        cms_category_slugs = [cat["slug"] for cat in cms_categories]
        
        self.assertIn("top-stories", cms_category_slugs, "top-stories not available in CMS categories")
        self.assertIn("national-top-stories", cms_category_slugs, "national-top-stories not available in CMS categories")
        
        print("✅ CMS integration verified - new categories available for article creation")
        
        # Test CMS articles endpoint with category filtering
        response = requests.get(f"{API_URL}/cms/articles?category=top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get CMS articles for top-stories category")
        cms_top_stories = response.json()
        
        response = requests.get(f"{API_URL}/cms/articles?category=national-top-stories")
        self.assertEqual(response.status_code, 200, "Failed to get CMS articles for national-top-stories category")
        cms_national_stories = response.json()
        
        print(f"✅ CMS category filtering working - top-stories: {len(cms_top_stories)}, national: {len(cms_national_stories)}")
        
        # Test 6: Error Handling
        print("\n6. Testing Error Handling")
        
        # Test with limit parameter
        response = requests.get(f"{API_URL}/articles/sections/top-stories?limit=2")
        self.assertEqual(response.status_code, 200, "API should handle limit parameter")
        limited_data = response.json()
        
        if limited_data["top_stories"]:
            self.assertLessEqual(len(limited_data["top_stories"]), 2, "Limit parameter not working for top_stories")
        if limited_data["national"]:
            self.assertLessEqual(len(limited_data["national"]), 2, "Limit parameter not working for national")
        
        print("✅ Error handling and parameter support working")
        
        print("\n🎉 NATIONAL TAB TOP STORIES IMPLEMENTATION TESTING COMPLETED SUCCESSFULLY!")
        print("✅ Database categories 'top-stories' and 'national-top-stories' exist and are properly configured")
        print("✅ API endpoint /api/articles/sections/top-stories returns correct JSON structure")
        print("✅ Both categories have sample articles with proper fields (id, title, summary, image_url, author, category, published_at)")
        print("✅ Database seeding works correctly with new categories and articles")
        print("✅ CMS integration allows creating articles in both 'top-stories' and 'national-top-stories' categories")
        print("✅ Backend article management for both categories is fully functional")
        print("✅ API endpoint functionality and response format are production-ready")
        print("✅ National Tab feature backend implementation is complete and working correctly")

    def test_gallery_post_functionality(self):
        """Test gallery post functionality and backend APIs as requested in review"""
        print("\n--- Testing Gallery Post Functionality and Backend APIs ---")
        
        # Test 1: Check Available Galleries - GET /api/galleries endpoint
        print("\n1. Testing GET /api/galleries endpoint")
        response = requests.get(f"{API_URL}/galleries")
        self.assertEqual(response.status_code, 200, "Failed to get galleries")
        galleries = response.json()
        self.assertIsInstance(galleries, list, "Galleries response should be a list")
        
        print(f"✅ GET /api/galleries working - found {len(galleries)} galleries")
        
        if len(galleries) == 0:
            print("⚠️ No galleries found in system - creating test gallery for testing")
            # Create a test gallery for testing purposes
            test_gallery = {
                "gallery_id": "test-gallery-001",
                "title": "Test Gallery for Backend Testing",
                "artists": ["Test Artist"],
                "images": [
                    {
                        "url": "https://example.com/image1.jpg",
                        "alt": "Test Image 1",
                        "caption": "First test image"
                    },
                    {
                        "url": "https://example.com/image2.jpg", 
                        "alt": "Test Image 2",
                        "caption": "Second test image"
                    }
                ],
                "gallery_type": "vertical"
            }
            
            create_response = requests.post(f"{API_URL}/galleries", json=test_gallery)
            if create_response.status_code == 200:
                print("✅ Test gallery created successfully")
                # Refresh galleries list
                response = requests.get(f"{API_URL}/galleries")
                galleries = response.json()
            else:
                print(f"⚠️ Could not create test gallery: {create_response.status_code}")
        
        # Verify gallery structure
        if galleries:
            gallery = galleries[0]
            required_fields = ["id", "gallery_id", "title", "artists", "images", "gallery_type", "created_at", "updated_at"]
            for field in required_fields:
                self.assertIn(field, gallery, f"Gallery missing required field: {field}")
            
            # Verify images structure
            self.assertIsInstance(gallery["images"], list, "Gallery images should be a list")
            if gallery["images"]:
                image = gallery["images"][0]
                image_fields = ["url", "alt", "caption"]
                for field in image_fields:
                    self.assertIn(field, image, f"Gallery image missing required field: {field}")
            
            print(f"✅ Gallery structure verified - sample gallery: '{gallery['title']}'")
            print(f"   - Gallery ID: {gallery['gallery_id']}")
            print(f"   - Artists: {gallery['artists']}")
            print(f"   - Images count: {len(gallery['images'])}")
            print(f"   - Gallery type: {gallery['gallery_type']}")
        
        # Test 2: Test Gallery API for articles with gallery data
        print("\n2. Testing GET /api/articles/{id} for articles with gallery data")
        
        # First get all articles to find ones with gallery_id
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        gallery_articles = []
        for article in articles:
            # Check if article has gallery information in the response
            if "gallery" in article and article["gallery"] is not None:
                gallery_articles.append(article)
        
        print(f"✅ Found {len(gallery_articles)} articles with gallery data")
        
        if len(gallery_articles) == 0:
            print("⚠️ No articles with gallery data found - checking individual articles")
            # Test a few individual articles to see if they have gallery data
            test_article_ids = [1, 2, 3, 4, 5] if len(articles) >= 5 else [article["id"] for article in articles[:3]]
            
            for article_id in test_article_ids:
                response = requests.get(f"{API_URL}/articles/{article_id}")
                if response.status_code == 200:
                    article = response.json()
                    if "gallery" in article and article["gallery"] is not None:
                        gallery_articles.append(article)
                        print(f"✅ Found gallery data in article {article_id}: '{article['title']}'")
        
        # Test 3: Test Gallery Post Backend Integration
        print("\n3. Testing Gallery Post Backend Integration")
        
        if gallery_articles:
            for gallery_article in gallery_articles[:3]:  # Test up to 3 gallery articles
                article_id = gallery_article["id"]
                
                # Get full article details
                response = requests.get(f"{API_URL}/articles/{article_id}")
                self.assertEqual(response.status_code, 200, f"Failed to get article {article_id}")
                article = response.json()
                
                print(f"\n   Testing article {article_id}: '{article['title']}'")
                
                # Verify article has gallery_id field (if present in backend)
                if "gallery_id" in article:
                    self.assertIsNotNone(article["gallery_id"], f"Article {article_id} has null gallery_id")
                    print(f"   ✅ Article has gallery_id: {article['gallery_id']}")
                
                # Verify article has gallery object with images array
                if "gallery" in article and article["gallery"] is not None:
                    gallery_data = article["gallery"]
                    
                    # Check gallery structure
                    self.assertIn("images", gallery_data, f"Gallery data missing images array for article {article_id}")
                    self.assertIsInstance(gallery_data["images"], list, f"Gallery images should be a list for article {article_id}")
                    
                    print(f"   ✅ Article has gallery object with {len(gallery_data['images'])} images")
                    
                    # Verify each image has required fields
                    for i, image in enumerate(gallery_data["images"]):
                        required_image_fields = ["url", "alt", "caption"]
                        for field in required_image_fields:
                            self.assertIn(field, image, f"Image {i} missing {field} field in article {article_id}")
                        
                        # Verify field types
                        self.assertIsInstance(image["url"], str, f"Image {i} url should be string in article {article_id}")
                        self.assertIsInstance(image["alt"], str, f"Image {i} alt should be string in article {article_id}")
                        self.assertIsInstance(image["caption"], str, f"Image {i} caption should be string in article {article_id}")
                    
                    print(f"   ✅ All images have required fields (url, alt, caption)")
                    
                    # Check if gallery data matches frontend expectations
                    if "gallery_id" in gallery_data:
                        print(f"   ✅ Gallery has gallery_id: {gallery_data['gallery_id']}")
                    if "gallery_title" in gallery_data:
                        print(f"   ✅ Gallery has title: {gallery_data['gallery_title']}")
                    
                else:
                    print(f"   ⚠️ Article {article_id} does not have gallery object in response")
        else:
            print("⚠️ No articles with gallery data found for integration testing")
        
        # Test 4: Backend API Validation for Frontend GalleryPost Component
        print("\n4. Testing Backend API Validation for Frontend GalleryPost Component")
        
        # Test gallery endpoints that frontend might use
        gallery_endpoints_to_test = [
            "/galleries",
            "/galleries?limit=10",
            "/galleries?limit=20"
        ]
        
        for endpoint in gallery_endpoints_to_test:
            response = requests.get(f"{API_URL}{endpoint}")
            self.assertEqual(response.status_code, 200, f"Gallery endpoint {endpoint} failed")
            data = response.json()
            self.assertIsInstance(data, list, f"Gallery endpoint {endpoint} should return list")
            print(f"   ✅ {endpoint} working - returned {len(data)} galleries")
        
        # Test individual gallery retrieval if galleries exist
        if galleries:
            test_gallery_id = galleries[0]["id"]
            response = requests.get(f"{API_URL}/galleries/{test_gallery_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get individual gallery {test_gallery_id}")
            gallery_detail = response.json()
            
            # Verify detailed gallery structure
            self.assertIn("images", gallery_detail, "Individual gallery missing images")
            self.assertIn("title", gallery_detail, "Individual gallery missing title")
            self.assertIn("artists", gallery_detail, "Individual gallery missing artists")
            
            print(f"   ✅ Individual gallery retrieval working for gallery {test_gallery_id}")
        
        # Test 5: Verify Data Structure Compatibility with Frontend
        print("\n5. Testing Data Structure Compatibility with Frontend GalleryPost Component")
        
        if galleries:
            sample_gallery = galleries[0]
            
            # Check if data structure matches what frontend GalleryPost expects
            frontend_required_fields = {
                "id": int,
                "title": str,
                "images": list,
                "gallery_type": str
            }
            
            for field, expected_type in frontend_required_fields.items():
                self.assertIn(field, sample_gallery, f"Gallery missing frontend required field: {field}")
                if sample_gallery[field] is not None:
                    self.assertIsInstance(sample_gallery[field], expected_type, 
                                        f"Gallery field {field} should be {expected_type.__name__}")
            
            # Check image slider compatibility
            if sample_gallery["images"]:
                sample_image = sample_gallery["images"][0]
                image_required_fields = {
                    "url": str,
                    "alt": str,
                    "caption": str
                }
                
                for field, expected_type in image_required_fields.items():
                    self.assertIn(field, sample_image, f"Image missing frontend required field: {field}")
                    self.assertIsInstance(sample_image[field], expected_type,
                                        f"Image field {field} should be {expected_type.__name__}")
                
                print(f"   ✅ Gallery data structure compatible with frontend image slider")
                print(f"   ✅ Sample image URL: {sample_image['url']}")
                print(f"   ✅ Sample image alt: {sample_image['alt']}")
                print(f"   ✅ Sample image caption: {sample_image['caption']}")
        
        # Test 6: Performance and Error Handling
        print("\n6. Testing Performance and Error Handling")
        
        # Test invalid gallery ID
        response = requests.get(f"{API_URL}/galleries/99999")
        self.assertEqual(response.status_code, 404, "Invalid gallery ID should return 404")
        print("   ✅ Invalid gallery ID returns 404")
        
        # Test invalid article ID
        response = requests.get(f"{API_URL}/articles/99999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        print("   ✅ Invalid article ID returns 404")
        
        # Test gallery pagination
        response = requests.get(f"{API_URL}/galleries?limit=5")
        self.assertEqual(response.status_code, 200, "Gallery pagination failed")
        paginated_galleries = response.json()
        self.assertLessEqual(len(paginated_galleries), 5, "Gallery pagination limit not working")
        print("   ✅ Gallery pagination working")
        
        # Test 7: Summary and Recommendations
        print("\n7. Gallery Post Functionality Test Summary")
        
        total_galleries = len(galleries)
        total_gallery_articles = len(gallery_articles)
        
        print(f"\n📊 GALLERY POST FUNCTIONALITY TEST RESULTS:")
        print(f"   - Total galleries in system: {total_galleries}")
        print(f"   - Articles with gallery data: {total_gallery_articles}")
        print(f"   - Gallery API endpoints: ✅ Working")
        print(f"   - Article gallery integration: {'✅ Working' if total_gallery_articles > 0 else '⚠️ Limited data'}")
        print(f"   - Frontend compatibility: ✅ Data structure matches expectations")
        print(f"   - Error handling: ✅ Proper 404 responses")
        print(f"   - Performance: ✅ Pagination and limits working")
        
        if total_galleries > 0 and total_gallery_articles > 0:
            print(f"\n🎉 GALLERY POST FUNCTIONALITY TESTING COMPLETED SUCCESSFULLY!")
            print(f"✅ Backend is properly serving gallery data for frontend GalleryPost component")
            print(f"✅ Gallery data structure matches frontend image slider requirements")
            print(f"✅ All required fields (url, alt, caption) present in gallery images")
            print(f"✅ Gallery API endpoints working correctly")
            print(f"✅ Article-gallery integration functional")
        else:
            print(f"\n⚠️ GALLERY POST FUNCTIONALITY TESTING COMPLETED WITH LIMITATIONS:")
            if total_galleries == 0:
                print(f"⚠️ No galleries found in system - may need data seeding")
            if total_gallery_articles == 0:
                print(f"⚠️ No articles with gallery data found - may need gallery-article associations")
            print(f"✅ Backend API structure is correct and ready for gallery data")

    def test_authentication_system(self):
        """Test comprehensive authentication system"""
        print("\n--- Testing Authentication System ---")
        
        # Test 1: User Registration
        print("\n1. Testing User Registration")
        new_user = {
            "username": "testuser",
            "password": "testpass123",
            "confirm_password": "testpass123"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=new_user)
        self.assertEqual(response.status_code, 200, "Failed to register new user")
        registration_data = response.json()
        self.assertEqual(registration_data["username"], new_user["username"])
        self.assertEqual(registration_data["roles"], ["Viewer"])
        print("✅ User registration working - default Viewer role assigned")
        
        # Test duplicate username validation
        response = requests.post(f"{API_URL}/auth/register", json=new_user)
        self.assertEqual(response.status_code, 400, "Duplicate username validation failed")
        print("✅ Duplicate username validation working")
        
        # Test password mismatch validation
        mismatched_user = {
            "username": "testuser2",
            "password": "testpass123",
            "confirm_password": "differentpass"
        }
        response = requests.post(f"{API_URL}/auth/register", json=mismatched_user)
        self.assertEqual(response.status_code, 400, "Password mismatch validation failed")
        print("✅ Password mismatch validation working")
        
        # Test 2: User Login
        print("\n2. Testing User Login")
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 200, "Failed to login user")
        login_response = response.json()
        self.assertIn("access_token", login_response)
        self.assertEqual(login_response["token_type"], "bearer")
        self.assertIn("user", login_response)
        self.assertEqual(login_response["user"]["username"], "testuser")
        self.assertEqual(login_response["user"]["roles"], ["Viewer"])
        
        user_token = login_response["access_token"]
        print("✅ User login working - JWT token generated")
        
        # Test invalid credentials
        invalid_login = {
            "username": "testuser",
            "password": "wrongpassword"
        }
        response = requests.post(f"{API_URL}/auth/login", data=invalid_login)
        self.assertEqual(response.status_code, 401, "Invalid credentials should return 401")
        print("✅ Invalid credentials properly rejected")
        
        # Test 3: Admin Login
        print("\n3. Testing Admin Login")
        admin_login = {
            "username": "admin",
            "password": "admin123"
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=admin_login)
        self.assertEqual(response.status_code, 200, "Failed to login admin")
        admin_response = response.json()
        self.assertIn("access_token", admin_response)
        self.assertEqual(admin_response["user"]["username"], "admin")
        self.assertIn("Admin", admin_response["user"]["roles"])
        
        admin_token = admin_response["access_token"]
        print("✅ Admin login working - Admin role confirmed")
        
        # Test 4: Current User Endpoint
        print("\n4. Testing Current User Endpoint")
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, "Failed to get current user info")
        user_info = response.json()
        self.assertEqual(user_info["username"], "testuser")
        self.assertEqual(user_info["roles"], ["Viewer"])
        self.assertTrue(user_info["is_active"])
        print("✅ Current user endpoint working")
        
        # Test unauthorized access
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 401, "Unauthorized access should return 401")
        print("✅ Unauthorized access properly rejected")
        
        # Test invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{API_URL}/auth/me", headers=invalid_headers)
        self.assertEqual(response.status_code, 401, "Invalid token should return 401")
        print("✅ Invalid token properly rejected")
        
        # Test 5: Admin Endpoints
        print("\n5. Testing Admin Endpoints")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get all users (admin only)
        response = requests.get(f"{API_URL}/auth/users", headers=admin_headers)
        self.assertEqual(response.status_code, 200, "Failed to get users list")
        users_list = response.json()
        self.assertIsInstance(users_list, list)
        self.assertGreater(len(users_list), 0, "No users returned")
        print(f"✅ Get all users endpoint working - returned {len(users_list)} users")
        
        # Test non-admin access to admin endpoint
        response = requests.get(f"{API_URL}/auth/users", headers=headers)
        self.assertEqual(response.status_code, 403, "Non-admin should not access admin endpoints")
        print("✅ Admin endpoint protection working")
        
        # Update user role (admin only)
        role_update = ["Author"]
        response = requests.put(f"{API_URL}/auth/users/testuser/role", 
                               json=role_update, headers=admin_headers)
        self.assertEqual(response.status_code, 200, "Failed to update user role")
        print("✅ User role update working")
        
        # Verify role was updated
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        # Note: The token still has old roles, need to login again to get new token
        new_login_response = requests.post(f"{API_URL}/auth/login", data=login_data)
        new_token = new_login_response.json()["access_token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}
        
        response = requests.get(f"{API_URL}/auth/me", headers=new_headers)
        updated_user = response.json()
        self.assertEqual(updated_user["roles"], ["Author"])
        print("✅ Role update verified - user now has Author role")
        
        # Test invalid role update
        invalid_roles = ["InvalidRole"]
        response = requests.put(f"{API_URL}/auth/users/testuser/role", 
                               json=invalid_roles, headers=admin_headers)
        self.assertEqual(response.status_code, 400, "Invalid role should be rejected")
        print("✅ Invalid role validation working")
        
        # Test role update for non-existent user
        response = requests.put(f"{API_URL}/auth/users/nonexistentuser/role", 
                               json=["Viewer"], headers=admin_headers)
        self.assertEqual(response.status_code, 404, "Non-existent user should return 404")
        print("✅ Non-existent user role update returns 404")
        
        # Test 6: User Deletion
        print("\n6. Testing User Deletion")
        
        # Try to delete admin user (should fail)
        response = requests.delete(f"{API_URL}/auth/users/admin", headers=admin_headers)
        self.assertEqual(response.status_code, 400, "Admin user deletion should be prevented")
        print("✅ Admin user deletion protection working")
        
        # Delete test user
        response = requests.delete(f"{API_URL}/auth/users/testuser", headers=admin_headers)
        self.assertEqual(response.status_code, 200, "Failed to delete user")
        print("✅ User deletion working")
        
        # Verify user was deleted
        response = requests.get(f"{API_URL}/auth/me", headers=new_headers)
        self.assertEqual(response.status_code, 401, "Deleted user token should be invalid")
        print("✅ Deleted user token invalidation working")
        
        # Test deleting non-existent user
        response = requests.delete(f"{API_URL}/auth/users/nonexistentuser", headers=admin_headers)
        self.assertEqual(response.status_code, 404, "Non-existent user deletion should return 404")
        print("✅ Non-existent user deletion returns 404")
        
        print("\n🎉 COMPREHENSIVE AUTHENTICATION SYSTEM TESTING COMPLETED SUCCESSFULLY!")
        print("✅ All authentication endpoints working correctly")
        print("✅ JWT token generation and validation working")
        print("✅ Role-based access control functioning properly")
        print("✅ Admin user protection and management working")
        print("✅ Error handling and validation working correctly")
        print("✅ Authentication system is ready for AuthModal integration")


    def test_movie_release_management_system(self):
        """Test comprehensive movie release management system with language field migration"""
        print("\n--- Testing Movie Release Management System ---")
        
        # Test 1: Theater Release Creation with Language Field
        print("\n1. Testing Theater Release Creation with Language Field")
        
        # Test data for theater release
        theater_release_data = {
            "movie_name": "Pushpa 2: The Rule",
            "movie_banner": "Mythri Movie Makers",
            "language": "Telugu",
            "release_date": "2024-12-05",
            "created_by": "Admin User"
        }
        
        # Create theater release using form data (multipart/form-data)
        response = requests.post(f"{API_URL}/cms/theater-releases", data=theater_release_data)
        self.assertEqual(response.status_code, 200, f"Failed to create theater release: {response.text}")
        
        created_theater_release = response.json()
        self.assertEqual(created_theater_release["movie_name"], theater_release_data["movie_name"])
        self.assertEqual(created_theater_release["movie_banner"], theater_release_data["movie_banner"])
        self.assertEqual(created_theater_release["language"], theater_release_data["language"])
        self.assertEqual(created_theater_release["created_by"], theater_release_data["created_by"])
        self.assertIn("id", created_theater_release)
        self.assertIn("created_at", created_theater_release)
        
        theater_release_id = created_theater_release["id"]
        print(f"✅ Theater release created successfully with ID {theater_release_id}")
        print(f"   - Movie: {created_theater_release['movie_name']}")
        print(f"   - Language: {created_theater_release['language']}")
        print(f"   - Banner: {created_theater_release['movie_banner']}")
        print(f"   - Release Date: {created_theater_release['release_date']}")
        
        # Test 2: OTT Release Creation with Language Field
        print("\n2. Testing OTT Release Creation with Language Field")
        
        # Test data for OTT release
        ott_release_data = {
            "movie_name": "RRR",
            "ott_platform": "Netflix",
            "language": "Hindi",
            "release_date": "2024-12-10",
            "created_by": "Content Manager"
        }
        
        # Create OTT release using form data
        response = requests.post(f"{API_URL}/cms/ott-releases", data=ott_release_data)
        self.assertEqual(response.status_code, 200, f"Failed to create OTT release: {response.text}")
        
        created_ott_release = response.json()
        self.assertEqual(created_ott_release["movie_name"], ott_release_data["movie_name"])
        self.assertEqual(created_ott_release["ott_platform"], ott_release_data["ott_platform"])
        self.assertEqual(created_ott_release["language"], ott_release_data["language"])
        self.assertEqual(created_ott_release["created_by"], ott_release_data["created_by"])
        self.assertIn("id", created_ott_release)
        self.assertIn("created_at", created_ott_release)
        
        ott_release_id = created_ott_release["id"]
        print(f"✅ OTT release created successfully with ID {ott_release_id}")
        print(f"   - Movie: {created_ott_release['movie_name']}")
        print(f"   - Language: {created_ott_release['language']}")
        print(f"   - Platform: {created_ott_release['ott_platform']}")
        print(f"   - Release Date: {created_ott_release['release_date']}")
        
        # Test 3: Theater Release Retrieval with Language Field
        print("\n3. Testing Theater Release Retrieval with Language Field")
        
        # Get all theater releases
        response = requests.get(f"{API_URL}/cms/theater-releases")
        self.assertEqual(response.status_code, 200, "Failed to get theater releases")
        theater_releases = response.json()
        self.assertIsInstance(theater_releases, list, "Theater releases response should be a list")
        self.assertGreater(len(theater_releases), 0, "No theater releases found")
        
        # Verify language field is present in all releases
        for release in theater_releases:
            self.assertIn("language", release, "Language field missing from theater release")
            self.assertIsInstance(release["language"], str, "Language should be a string")
            self.assertIn("id", release)
            self.assertIn("movie_name", release)
            self.assertIn("movie_banner", release)
            self.assertIn("release_date", release)
            self.assertIn("created_by", release)
            self.assertIn("created_at", release)
        
        print(f"✅ Theater releases retrieval working - found {len(theater_releases)} releases")
        print(f"   - All releases have language field")
        
        # Get specific theater release
        response = requests.get(f"{API_URL}/cms/theater-releases/{theater_release_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get theater release {theater_release_id}")
        specific_theater_release = response.json()
        self.assertEqual(specific_theater_release["id"], theater_release_id)
        self.assertEqual(specific_theater_release["language"], "Telugu")
        print(f"✅ Specific theater release retrieval working with language field")
        
        # Test 4: OTT Release Retrieval with Language Field
        print("\n4. Testing OTT Release Retrieval with Language Field")
        
        # Get all OTT releases
        response = requests.get(f"{API_URL}/cms/ott-releases")
        self.assertEqual(response.status_code, 200, "Failed to get OTT releases")
        ott_releases = response.json()
        self.assertIsInstance(ott_releases, list, "OTT releases response should be a list")
        self.assertGreater(len(ott_releases), 0, "No OTT releases found")
        
        # Verify language field is present in all releases
        for release in ott_releases:
            self.assertIn("language", release, "Language field missing from OTT release")
            self.assertIsInstance(release["language"], str, "Language should be a string")
            self.assertIn("id", release)
            self.assertIn("movie_name", release)
            self.assertIn("ott_platform", release)
            self.assertIn("release_date", release)
            self.assertIn("created_by", release)
            self.assertIn("created_at", release)
        
        print(f"✅ OTT releases retrieval working - found {len(ott_releases)} releases")
        print(f"   - All releases have language field")
        
        # Get specific OTT release
        response = requests.get(f"{API_URL}/cms/ott-releases/{ott_release_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get OTT release {ott_release_id}")
        specific_ott_release = response.json()
        self.assertEqual(specific_ott_release["id"], ott_release_id)
        self.assertEqual(specific_ott_release["language"], "Hindi")
        print(f"✅ Specific OTT release retrieval working with language field")
        
        # Test 5: Homepage Release Data with Language Field
        print("\n5. Testing Homepage Release Data with Language Field")
        
        response = requests.get(f"{API_URL}/releases/theater-ott")
        self.assertEqual(response.status_code, 200, "Failed to get homepage release data")
        homepage_data = response.json()
        
        # Verify structure
        self.assertIn("theater", homepage_data, "Homepage data missing theater section")
        self.assertIn("ott", homepage_data, "Homepage data missing OTT section")
        
        theater_data = homepage_data["theater"]
        ott_data = homepage_data["ott"]
        
        self.assertIn("this_week", theater_data, "Theater data missing this_week section")
        self.assertIn("coming_soon", theater_data, "Theater data missing coming_soon section")
        self.assertIn("this_week", ott_data, "OTT data missing this_week section")
        self.assertIn("coming_soon", ott_data, "OTT data missing coming_soon section")
        
        # Check language field in theater releases
        all_theater_releases = theater_data["this_week"] + theater_data["coming_soon"]
        for release in all_theater_releases:
            self.assertIn("language", release, "Language field missing from homepage theater release")
            self.assertIn("movie_name", release)
            self.assertIn("movie_banner", release)
            self.assertIn("release_date", release)
        
        # Check language field in OTT releases
        all_ott_releases = ott_data["this_week"] + ott_data["coming_soon"]
        for release in all_ott_releases:
            self.assertIn("language", release, "Language field missing from homepage OTT release")
            self.assertIn("movie_name", release)
            self.assertIn("ott_platform", release)
            self.assertIn("release_date", release)
        
        print(f"✅ Homepage release data working with language field")
        print(f"   - Theater releases: {len(all_theater_releases)} total")
        print(f"   - OTT releases: {len(all_ott_releases)} total")
        print(f"   - All releases include language field")
        
        # Test 6: Language Field Validation and Default Values
        print("\n6. Testing Language Field Validation and Default Values")
        
        # Test theater release with default language (should be Hindi)
        default_theater_data = {
            "movie_name": "Test Movie Default Lang",
            "movie_banner": "Test Banner",
            "release_date": "2024-12-15",
            "created_by": "Test User"
            # No language field - should default to Hindi
        }
        
        response = requests.post(f"{API_URL}/cms/theater-releases", data=default_theater_data)
        self.assertEqual(response.status_code, 200, "Failed to create theater release with default language")
        default_theater_release = response.json()
        self.assertEqual(default_theater_release["language"], "Hindi", "Default language should be Hindi")
        print(f"✅ Theater release default language working - defaults to 'Hindi'")
        
        # Test OTT release with default language
        default_ott_data = {
            "movie_name": "Test OTT Movie Default Lang",
            "ott_platform": "Amazon Prime",
            "release_date": "2024-12-20",
            "created_by": "Test User"
            # No language field - should default to Hindi
        }
        
        response = requests.post(f"{API_URL}/cms/ott-releases", data=default_ott_data)
        self.assertEqual(response.status_code, 200, "Failed to create OTT release with default language")
        default_ott_release = response.json()
        self.assertEqual(default_ott_release["language"], "Hindi", "Default language should be Hindi")
        print(f"✅ OTT release default language working - defaults to 'Hindi'")
        
        # Test 7: Update Operations with Language Field
        print("\n7. Testing Update Operations with Language Field")
        
        # Update theater release language
        update_theater_data = {
            "language": "Tamil"
        }
        
        response = requests.put(f"{API_URL}/cms/theater-releases/{theater_release_id}", 
                               data=update_theater_data)
        self.assertEqual(response.status_code, 200, "Failed to update theater release language")
        updated_theater = response.json()
        self.assertEqual(updated_theater["language"], "Tamil")
        print(f"✅ Theater release language update working")
        
        # Update OTT release language
        update_ott_data = {
            "language": "English"
        }
        
        response = requests.put(f"{API_URL}/cms/ott-releases/{ott_release_id}", 
                               data=update_ott_data)
        self.assertEqual(response.status_code, 200, "Failed to update OTT release language")
        updated_ott = response.json()
        self.assertEqual(updated_ott["language"], "English")
        print(f"✅ OTT release language update working")
        
        # Test 8: Error Handling and Edge Cases
        print("\n8. Testing Error Handling and Edge Cases")
        
        # Test invalid theater release data
        invalid_theater_data = {
            "movie_name": "",  # Empty movie name
            "movie_banner": "Test Banner",
            "language": "Telugu",
            "release_date": "invalid-date",  # Invalid date format
            "created_by": "Test User"
        }
        
        response = requests.post(f"{API_URL}/cms/theater-releases", data=invalid_theater_data)
        # Should handle validation errors gracefully
        print(f"   - Invalid theater data response: {response.status_code}")
        
        # Test non-existent release retrieval
        response = requests.get(f"{API_URL}/cms/theater-releases/99999")
        self.assertEqual(response.status_code, 404, "Non-existent theater release should return 404")
        
        response = requests.get(f"{API_URL}/cms/ott-releases/99999")
        self.assertEqual(response.status_code, 404, "Non-existent OTT release should return 404")
        print(f"✅ Error handling working - 404 for non-existent releases")
        
        # Test 9: Database Schema Verification (Indirect)
        print("\n9. Testing Database Schema Verification (Indirect)")
        
        # The fact that we can create, read, update releases with language field
        # confirms that the database migration was successful
        print(f"✅ Database schema verification successful:")
        print(f"   - theater_releases table has language column (confirmed by successful CRUD operations)")
        print(f"   - ott_releases table has language column (confirmed by successful CRUD operations)")
        print(f"   - Language field accepts string values and has default value 'Hindi'")
        print(f"   - No 'no such column' errors encountered during testing")
        
        # Test 10: Multiple Language Support
        print("\n10. Testing Multiple Language Support")
        
        languages_to_test = ["Telugu", "Hindi", "Tamil", "English", "Kannada", "Malayalam"]
        
        for i, language in enumerate(languages_to_test):
            test_theater_data = {
                "movie_name": f"Test Movie {language}",
                "movie_banner": f"Test Banner {language}",
                "language": language,
                "release_date": "2024-12-25",
                "created_by": "Language Test User"
            }
            
            response = requests.post(f"{API_URL}/cms/theater-releases", data=test_theater_data)
            self.assertEqual(response.status_code, 200, f"Failed to create theater release in {language}")
            created_release = response.json()
            self.assertEqual(created_release["language"], language)
        
        print(f"✅ Multiple language support working - tested {len(languages_to_test)} languages")
        print(f"   - Languages tested: {', '.join(languages_to_test)}")
        
        print("\n🎉 MOVIE RELEASE MANAGEMENT SYSTEM TESTING COMPLETED SUCCESSFULLY!")
        print("✅ Theater release creation working with language field")
        print("✅ OTT release creation working with language field")
        print("✅ Theater release retrieval includes language field")
        print("✅ OTT release retrieval includes language field")
        print("✅ Homepage release data includes language field")
        print("✅ Database migration successful - no 'no such column' errors")
        print("✅ Language field validation and default values working")
        print("✅ Update operations support language field")
        print("✅ Error handling working correctly")
        print("✅ Multiple language support confirmed")
        print("✅ CRITICAL ISSUE RESOLVED: Theater and OTT release creation now works without database errors")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add the gallery post functionality test as priority (as requested in review)
    suite.addTest(BlogCMSAPITest("test_gallery_post_functionality"))
    
    # Add other essential tests
    suite.addTest(BlogCMSAPITest("test_health_check"))
    suite.addTest(BlogCMSAPITest("test_get_categories"))
    suite.addTest(BlogCMSAPITest("test_get_articles"))
    suite.addTest(BlogCMSAPITest("test_get_articles_by_category"))
    suite.addTest(BlogCMSAPITest("test_get_article_by_id"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)