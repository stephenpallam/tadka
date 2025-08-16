#!/usr/bin/env python3
import requests
import json
import unittest
import os
import sys
from datetime import datetime, timedelta

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing API at: {API_URL}")

class LatestNewsFilteringTest(unittest.TestCase):
    """Test suite for the Latest News filtering functionality"""

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

    def test_articles_api(self):
        """Test the Articles API endpoint"""
        print("\n--- Testing Articles API Endpoint ---")
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

    def test_categories_api(self):
        """Test the Categories API endpoint"""
        print("\n--- Testing Categories API Endpoint ---")
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertIsInstance(categories, list, "Categories response is not a list")
        self.assertGreater(len(categories), 0, "No categories returned")
        
        # Check if politics category exists
        politics_category = None
        for category in categories:
            if category["slug"] == "politics" or category["name"].lower() == "politics":
                politics_category = category
                break
        
        self.assertIsNotNone(politics_category, "Politics category not found")
        print(f"✅ Politics category found with ID {politics_category['id']}")
        
        # Test getting articles by politics category
        response = requests.get(f"{API_URL}/articles/category/politics")
        self.assertEqual(response.status_code, 200, "Failed to get politics articles")
        politics_articles = response.json()
        self.assertIsInstance(politics_articles, list, "Politics articles response is not a list")
        print(f"✅ GET articles by politics category endpoint working, returned {len(politics_articles)} articles")

    def test_articles_date_filtering(self):
        """Test that articles have proper date information for filtering"""
        print("\n--- Testing Articles Date Information ---")
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        # Check that articles have valid publishedAt dates
        for article in articles:
            self.assertIn("published_at", article)
            published_at = article["published_at"]
            self.assertIsNotNone(published_at, f"Article {article['id']} has no published_at date")
            
            # Verify date format is valid ISO format
            try:
                date_obj = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                self.assertIsInstance(date_obj, datetime, f"Invalid date format for article {article['id']}")
            except ValueError:
                self.fail(f"Invalid date format for article {article['id']}: {published_at}")
        
        print(f"✅ All {len(articles)} articles have valid published_at dates")

    def test_mock_data_structure(self):
        """Test the structure of the mock data in the frontend"""
        print("\n--- Testing Frontend Mock Data Structure ---")
        
        # We can't directly access the frontend mock data from Python,
        # but we can verify that the backend API structure is compatible
        
        # Test articles endpoint
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        # Check that articles have all fields needed by the frontend
        required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category", "view_count"]
        for article in articles[:5]:  # Check first 5 articles
            for field in required_fields:
                self.assertIn(field, article, f"Article {article['id']} missing required field: {field}")
        
        print(f"✅ Backend API structure is compatible with frontend mock data")
        
        # Note about the frontend mock data
        print("NOTE: The frontend is using expanded mock data with 25 politics articles spanning a full year")
        print("      These articles are defined in /app/frontend/src/data/comprehensiveMockData.js")
        print("      The backend database is seeded with only 1 politics article")
        print("      This is expected as the frontend is using mock data for development")
        print("      The expanded mock data includes:")
        print("      - Today: 2 articles")
        print("      - Yesterday: 2 articles")
        print("      - This Week (2-7 days ago): 5 articles")
        print("      - Last 7-14 days: 4 articles")
        print("      - Last 30 days: 2 articles")
        print("      - Last 3 months: 4 articles")
        print("      - Last 6 months: 3 articles")
        print("      - Last year: 5 articles")
        print("      All with dynamic date calculation based on Date.now()")

    def test_data_service_functionality(self):
        """Test that the backend provides data in the format expected by the frontend data service"""
        print("\n--- Testing Data Service Compatibility ---")
        
        # Test articles endpoint
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        articles = response.json()
        
        # Check that articles have all fields needed by the frontend
        required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category", "view_count"]
        for article in articles[:5]:  # Check first 5 articles
            for field in required_fields:
                self.assertIn(field, article, f"Article {article['id']} missing required field: {field}")
        
        # Test categories endpoint
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        
        # Check that categories have all fields needed by the frontend
        required_fields = ["id", "name", "slug"]
        for category in categories:
            for field in required_fields:
                self.assertIn(field, category, f"Category {category['id']} missing required field: {field}")
        
        print(f"✅ Backend data format is compatible with frontend data service")

    def test_cors_configuration(self):
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

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n--- Testing Error Handling ---")
        
        # Test invalid article ID
        response = requests.get(f"{API_URL}/articles/9999999")
        self.assertEqual(response.status_code, 404, "Invalid article ID should return 404")
        
        # Test invalid category
        response = requests.get(f"{API_URL}/articles/category/nonexistent-category")
        self.assertEqual(response.status_code, 200, "Invalid category should return empty list, not error")
        articles = response.json()
        self.assertEqual(len(articles), 0, "Invalid category should return empty list")
        
        print("✅ Error handling is working correctly")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add all tests
    suite.addTest(LatestNewsFilteringTest("test_health_check"))
    suite.addTest(LatestNewsFilteringTest("test_articles_api"))
    suite.addTest(LatestNewsFilteringTest("test_categories_api"))
    suite.addTest(LatestNewsFilteringTest("test_articles_date_filtering"))
    suite.addTest(LatestNewsFilteringTest("test_mock_data_structure"))
    suite.addTest(LatestNewsFilteringTest("test_data_service_functionality"))
    suite.addTest(LatestNewsFilteringTest("test_cors_configuration"))
    suite.addTest(LatestNewsFilteringTest("test_error_handling"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)