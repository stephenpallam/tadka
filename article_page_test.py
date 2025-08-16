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
print(f"Testing Article API endpoints at: {API_URL}")

class ArticlePageAPITest(unittest.TestCase):
    """Test suite specifically for ArticlePage component API endpoints"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_get_article_by_id_endpoint(self):
        """Test GET /api/articles/{id} - to fetch article by ID for ArticlePage"""
        print("\n=== Testing GET /api/articles/{id} for ArticlePage ===")
        
        # First get available articles to test with
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles list")
        articles = response.json()
        self.assertGreater(len(articles), 0, "No articles available for testing")
        
        # Test with multiple article IDs to ensure consistency
        test_article_ids = [articles[i]["id"] for i in range(min(3, len(articles)))]
        
        for article_id in test_article_ids:
            print(f"\n--- Testing Article ID: {article_id} ---")
            
            # Get the article by ID
            response = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get article with ID {article_id}")
            
            article = response.json()
            
            # Verify response format matches what frontend expects
            print("Checking response format for ArticlePage component...")
            
            # Essential fields for ArticlePage
            self.assertIn("id", article, "Missing 'id' field")
            self.assertIn("title", article, "Missing 'title' field")
            self.assertIn("content", article, "Missing 'content' field")
            self.assertIn("summary", article, "Missing 'summary' field")
            self.assertIn("author", article, "Missing 'author' field")
            self.assertIn("published_at", article, "Missing 'published_at' field")
            self.assertIn("category", article, "Missing 'category' field")
            self.assertIn("view_count", article, "Missing 'view_count' field")
            
            # Check for main_image_url (could be 'image_url', 'main_image_url', or 'image')
            has_image_field = "image_url" in article or "main_image_url" in article or "image" in article
            self.assertTrue(has_image_field, "Missing image field (expected 'image_url', 'main_image_url', or 'image')")
            
            # Verify data types
            self.assertIsInstance(article["id"], int, "Article ID should be integer")
            self.assertIsInstance(article["title"], str, "Title should be string")
            self.assertIsInstance(article["content"], str, "Content should be string")
            self.assertIsInstance(article["view_count"], int, "View count should be integer")
            
            # Verify content is not empty (important for ArticlePage)
            self.assertGreater(len(article["content"]), 0, "Article content should not be empty")
            self.assertGreater(len(article["title"]), 0, "Article title should not be empty")
            
            print(f"✅ Article {article_id} response format is correct")
            print(f"   - Title: {article['title'][:50]}...")
            print(f"   - Content length: {len(article['content'])} characters")
            print(f"   - Author: {article['author']}")
            print(f"   - Category: {article['category']}")
            print(f"   - View count: {article['view_count']}")
            
            # Test view count increment (important for analytics)
            initial_view_count = article["view_count"]
            
            # Get the article again to check view count increment
            response2 = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response2.status_code, 200)
            article2 = response2.json()
            
            self.assertEqual(article2["view_count"], initial_view_count + 1, 
                           f"View count should increment from {initial_view_count} to {initial_view_count + 1}")
            print(f"✅ View count incremented correctly: {initial_view_count} → {article2['view_count']}")
        
        # Test with invalid article ID
        print("\n--- Testing Invalid Article ID ---")
        response = requests.get(f"{API_URL}/articles/99999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        print("✅ Invalid article ID properly returns 404")
        
        print("\n🎉 GET /api/articles/{id} endpoint working correctly for ArticlePage!")

    def test_get_articles_by_category_endpoint(self):
        """Test GET /api/articles/category/{category_slug} - to fetch related articles by category"""
        print("\n=== Testing GET /api/articles/category/{category_slug} for Related Articles ===")
        
        # First get available categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertGreater(len(categories), 0, "No categories available for testing")
        
        # Test with multiple category slugs
        test_categories = categories[:min(3, len(categories))]
        
        for category in test_categories:
            category_slug = category["slug"]
            print(f"\n--- Testing Category: {category['name']} (slug: {category_slug}) ---")
            
            # Get articles for this category
            response = requests.get(f"{API_URL}/articles/category/{category_slug}")
            self.assertEqual(response.status_code, 200, f"Failed to get articles for category {category_slug}")
            
            articles = response.json()
            self.assertIsInstance(articles, list, "Category articles response should be a list")
            
            print(f"Found {len(articles)} articles in category '{category['name']}'")
            
            if len(articles) > 0:
                # Check response format for related articles
                article = articles[0]
                
                # Verify essential fields for related articles display
                self.assertIn("id", article, "Missing 'id' field in related article")
                self.assertIn("title", article, "Missing 'title' field in related article")
                self.assertIn("summary", article, "Missing 'summary' field in related article")
                self.assertIn("author", article, "Missing 'author' field in related article")
                self.assertIn("published_at", article, "Missing 'published_at' field in related article")
                self.assertIn("category", article, "Missing 'category' field in related article")
                self.assertIn("view_count", article, "Missing 'view_count' field in related article")
                
                # Check for image field
                has_image_field = "image_url" in article or "main_image_url" in article or "image" in article
                self.assertTrue(has_image_field, "Missing image field in related article")
                
                # Verify all articles belong to the requested category
                for art in articles:
                    # The category field might contain the full category object or just the slug
                    if isinstance(art["category"], dict):
                        self.assertEqual(art["category"]["slug"], category_slug, 
                                       f"Article category mismatch: expected {category_slug}, got {art['category']['slug']}")
                    else:
                        # If category is just a string, it should match the category name or slug
                        self.assertTrue(category_slug in str(art["category"]).lower() or 
                                      category["name"].lower() in str(art["category"]).lower(),
                                      f"Article category mismatch for {art['title']}")
                
                print(f"✅ Related articles format is correct for category '{category['name']}'")
                print(f"   - Sample article: {article['title'][:50]}...")
                print(f"   - All articles belong to correct category")
                
                # Test pagination for related articles
                if len(articles) > 5:
                    response_limited = requests.get(f"{API_URL}/articles/category/{category_slug}?limit=3")
                    self.assertEqual(response_limited.status_code, 200)
                    limited_articles = response_limited.json()
                    self.assertLessEqual(len(limited_articles), 3, "Pagination limit not working")
                    print(f"✅ Pagination working: limited to {len(limited_articles)} articles")
            else:
                print(f"⚠️ No articles found in category '{category['name']}' (this is acceptable)")
        
        # Test with invalid category slug
        print("\n--- Testing Invalid Category Slug ---")
        response = requests.get(f"{API_URL}/articles/category/invalid-category-slug-12345")
        self.assertEqual(response.status_code, 200, "Invalid category should return 200 with empty list")
        articles = response.json()
        self.assertEqual(len(articles), 0, "Invalid category should return empty list")
        print("✅ Invalid category slug returns empty list (not error)")
        
        print("\n🎉 GET /api/articles/category/{category_slug} endpoint working correctly for Related Articles!")

    def test_article_response_format_consistency(self):
        """Test that article response format is consistent across different endpoints"""
        print("\n=== Testing Article Response Format Consistency ===")
        
        # Get articles from different endpoints and compare formats
        endpoints_to_test = [
            ("/articles", "All Articles"),
            ("/articles/most-read", "Most Read Articles"),
        ]
        
        # Get a sample article ID for individual article testing
        response = requests.get(f"{API_URL}/articles")
        articles = response.json()
        if articles:
            sample_id = articles[0]["id"]
            endpoints_to_test.append((f"/articles/{sample_id}", "Individual Article"))
        
        response_formats = {}
        
        for endpoint, description in endpoints_to_test:
            print(f"\n--- Testing {description} ({endpoint}) ---")
            response = requests.get(f"{API_URL}{endpoint}")
            self.assertEqual(response.status_code, 200, f"Failed to get {description}")
            
            data = response.json()
            
            if isinstance(data, list) and len(data) > 0:
                # For list responses, check the first item
                sample_item = data[0]
                response_formats[description] = set(sample_item.keys())
                print(f"✅ {description} fields: {sorted(sample_item.keys())}")
            elif isinstance(data, dict):
                # For single item responses
                response_formats[description] = set(data.keys())
                print(f"✅ {description} fields: {sorted(data.keys())}")
        
        # Check that essential fields are present in all responses
        essential_fields = {"id", "title", "author", "view_count"}
        
        for description, fields in response_formats.items():
            missing_fields = essential_fields - fields
            self.assertEqual(len(missing_fields), 0, 
                           f"{description} missing essential fields: {missing_fields}")
            print(f"✅ {description} has all essential fields")
        
        print("\n🎉 Article response format is consistent across endpoints!")

    def test_article_content_quality(self):
        """Test that articles have quality content suitable for ArticlePage display"""
        print("\n=== Testing Article Content Quality ===")
        
        # Get a few articles to test content quality
        response = requests.get(f"{API_URL}/articles?limit=5")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        for article in articles:
            article_id = article["id"]
            
            # Get full article content
            response = requests.get(f"{API_URL}/articles/{article_id}")
            self.assertEqual(response.status_code, 200, f"Failed to get article {article_id}")
            full_article = response.json()
            
            print(f"\n--- Testing Article: {full_article['title'][:50]}... ---")
            
            # Test content quality
            content = full_article.get("content", "")
            title = full_article.get("title", "")
            summary = full_article.get("summary", "")
            
            # Content should be substantial for a good reading experience
            self.assertGreater(len(content), 50, f"Article {article_id} content too short: {len(content)} chars")
            self.assertGreater(len(title), 5, f"Article {article_id} title too short")
            
            # Summary should be present and reasonable length
            if summary:
                self.assertGreater(len(summary), 10, f"Article {article_id} summary too short")
                self.assertLess(len(summary), 500, f"Article {article_id} summary too long")
            
            # Check for HTML content (if using rich text editor)
            has_html_tags = any(tag in content.lower() for tag in ['<p>', '<div>', '<h1>', '<h2>', '<h3>', '<br>', '<strong>', '<em>'])
            
            print(f"✅ Article {article_id} content quality check passed")
            print(f"   - Content length: {len(content)} characters")
            print(f"   - Title length: {len(title)} characters")
            print(f"   - Summary length: {len(summary)} characters")
            print(f"   - Contains HTML tags: {has_html_tags}")
        
        print("\n🎉 Article content quality is suitable for ArticlePage display!")

    def test_category_based_recommendations(self):
        """Test that category-based article recommendations work properly"""
        print("\n=== Testing Category-Based Article Recommendations ===")
        
        # Get an article and then find related articles in the same category
        response = requests.get(f"{API_URL}/articles?limit=1")
        self.assertEqual(response.status_code, 200, "Failed to get sample article")
        articles = response.json()
        
        if not articles:
            print("⚠️ No articles available for recommendation testing")
            return
        
        sample_article = articles[0]
        article_id = sample_article["id"]
        
        # Get full article details
        response = requests.get(f"{API_URL}/articles/{article_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get article {article_id}")
        full_article = response.json()
        
        # Extract category information
        category_info = full_article.get("category")
        if isinstance(category_info, dict):
            category_slug = category_info.get("slug")
            category_name = category_info.get("name")
        else:
            # If category is a string, we need to find the corresponding slug
            # Get categories to find the slug
            cat_response = requests.get(f"{API_URL}/categories")
            categories = cat_response.json()
            category_slug = None
            category_name = str(category_info)
            
            for cat in categories:
                if cat["name"].lower() == str(category_info).lower():
                    category_slug = cat["slug"]
                    break
        
        if not category_slug:
            print("⚠️ Could not determine category slug for recommendation testing")
            return
        
        print(f"\n--- Testing Recommendations for Article: {full_article['title'][:50]}... ---")
        print(f"--- Category: {category_name} (slug: {category_slug}) ---")
        
        # Get related articles in the same category
        response = requests.get(f"{API_URL}/articles/category/{category_slug}")
        self.assertEqual(response.status_code, 200, f"Failed to get articles for category {category_slug}")
        
        related_articles = response.json()
        self.assertIsInstance(related_articles, list, "Related articles should be a list")
        
        # Filter out the current article from recommendations
        recommendations = [art for art in related_articles if art["id"] != article_id]
        
        print(f"✅ Found {len(related_articles)} total articles in category")
        print(f"✅ Found {len(recommendations)} recommendation candidates (excluding current article)")
        
        if recommendations:
            # Test that recommendations are properly formatted
            for rec in recommendations[:3]:  # Test first 3 recommendations
                self.assertIn("id", rec, "Recommendation missing ID")
                self.assertIn("title", rec, "Recommendation missing title")
                self.assertIn("summary", rec, "Recommendation missing summary")
                
                print(f"   - Recommendation: {rec['title'][:40]}...")
        
        print("\n🎉 Category-based article recommendations working correctly!")


if __name__ == "__main__":
    print("🚀 Starting ArticlePage API Endpoint Testing...")
    print("=" * 60)
    
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add specific tests for ArticlePage functionality
    suite.addTest(ArticlePageAPITest("test_get_article_by_id_endpoint"))
    suite.addTest(ArticlePageAPITest("test_get_articles_by_category_endpoint"))
    suite.addTest(ArticlePageAPITest("test_article_response_format_consistency"))
    suite.addTest(ArticlePageAPITest("test_article_content_quality"))
    suite.addTest(ArticlePageAPITest("test_category_based_recommendations"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print("🎉 ALL ARTICLE API TESTS PASSED!")
        print("✅ ArticlePage component should work correctly with these endpoints")
    else:
        print("❌ Some tests failed - ArticlePage may have issues")
        print(f"Failures: {len(result.failures)}, Errors: {len(result.errors)}")
    
    print("=" * 60)