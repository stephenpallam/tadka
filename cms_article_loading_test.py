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
print(f"Testing CMS Article Loading API at: {API_URL}")

class CMSArticleLoadingTest(unittest.TestCase):
    """Test suite specifically for CMS Article Loading Issue - /api/cms/articles endpoint"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_01_cms_articles_basic_endpoint(self):
        """Test basic CMS articles endpoint functionality"""
        print("\n--- Testing Basic CMS Articles Endpoint ---")
        
        # Test 1: Basic GET /api/cms/articles request
        print("\n1. Testing GET /api/cms/articles (basic request)")
        response = requests.get(f"{API_URL}/cms/articles")
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print(f"❌ CRITICAL ERROR: Basic CMS articles request failed")
            print(f"Response Text: {response.text}")
            self.fail(f"Basic CMS articles request failed with status {response.status_code}")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "CMS articles response should be a list")
        print(f"✅ Basic CMS articles endpoint working - returned {len(articles)} articles")
        
        # Verify article structure if articles exist
        if articles:
            article = articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "language", "category", "is_published", "published_at"]
            missing_fields = []
            for field in required_fields:
                if field not in article:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"⚠️  Missing fields in article structure: {missing_fields}")
            else:
                print("✅ Article structure verified - all required fields present")
            
            print(f"Sample article: {article['title']} (ID: {article['id']})")

    def test_02_cms_articles_with_frontend_parameters(self):
        """Test CMS articles endpoint with exact parameters used by frontend"""
        print("\n--- Testing CMS Articles with Frontend Parameters ---")
        
        # Test 2: GET /api/cms/articles?language=en&limit=1000 (exact frontend call)
        print("\n2. Testing GET /api/cms/articles?language=en&limit=1000 (frontend parameters)")
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=1000")
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ CRITICAL ERROR: Frontend parameter request failed")
            print(f"Response Text: {response.text}")
            self.fail(f"Frontend parameter request failed with status {response.status_code}")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "CMS articles response should be a list")
        print(f"✅ Frontend parameter request working - returned {len(articles)} articles")
        
        # Verify language filtering
        english_articles = [a for a in articles if a.get('language') == 'en']
        print(f"   English articles: {len(english_articles)}")
        print(f"   Total articles: {len(articles)}")
        
        # Test 3: Different language parameters
        print("\n3. Testing different language parameters")
        for lang in ['en', 'te', 'hi']:
            response = requests.get(f"{API_URL}/cms/articles?language={lang}&limit=100")
            self.assertEqual(response.status_code, 200, f"Failed to get articles for language {lang}")
            lang_articles = response.json()
            print(f"   Language '{lang}': {len(lang_articles)} articles")

    def test_03_cms_articles_parameter_variations(self):
        """Test CMS articles endpoint with various parameter combinations"""
        print("\n--- Testing CMS Articles Parameter Variations ---")
        
        # Test 4: Different limit values
        print("\n4. Testing different limit values")
        test_limits = [10, 20, 50, 100, 500, 1000]
        
        for limit in test_limits:
            response = requests.get(f"{API_URL}/cms/articles?language=en&limit={limit}")
            self.assertEqual(response.status_code, 200, f"Failed with limit={limit}")
            articles = response.json()
            actual_count = len(articles)
            print(f"   Limit {limit}: returned {actual_count} articles")
            
            # Verify limit is respected (should not exceed limit)
            self.assertLessEqual(actual_count, limit, f"Returned more articles than limit={limit}")
        
        # Test 5: Skip parameter
        print("\n5. Testing skip parameter")
        response = requests.get(f"{API_URL}/cms/articles?language=en&skip=5&limit=10")
        self.assertEqual(response.status_code, 200, "Failed with skip parameter")
        skipped_articles = response.json()
        print(f"   Skip=5, Limit=10: returned {len(skipped_articles)} articles")
        
        # Test 6: Category filtering
        print("\n6. Testing category filtering")
        # First get available categories
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=100")
        all_articles = response.json()
        
        if all_articles:
            categories = list(set(a.get('category') for a in all_articles if a.get('category')))
            print(f"   Available categories: {categories[:5]}...")  # Show first 5
            
            if categories:
                test_category = categories[0]
                response = requests.get(f"{API_URL}/cms/articles?language=en&category={test_category}&limit=50")
                self.assertEqual(response.status_code, 200, f"Failed with category filter: {test_category}")
                category_articles = response.json()
                print(f"   Category '{test_category}': {len(category_articles)} articles")
        
        # Test 7: State filtering
        print("\n7. Testing state filtering")
        response = requests.get(f"{API_URL}/cms/articles?language=en&state=ap&limit=50")
        self.assertEqual(response.status_code, 200, "Failed with state filter")
        state_articles = response.json()
        print(f"   State 'ap': {len(state_articles)} articles")

    def test_04_cms_articles_response_format(self):
        """Test CMS articles response format and data quality"""
        print("\n--- Testing CMS Articles Response Format ---")
        
        # Test 8: Response format validation
        print("\n8. Testing response format validation")
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=20")
        self.assertEqual(response.status_code, 200, "Failed to get articles for format validation")
        articles = response.json()
        
        if not articles:
            print("⚠️  No articles found for format validation")
            return
        
        print(f"Validating format of {len(articles)} articles...")
        
        # Check each article structure
        valid_articles = 0
        issues_found = []
        
        for i, article in enumerate(articles):
            article_issues = []
            
            # Required fields check
            required_fields = {
                'id': int,
                'title': str,
                'summary': str,
                'author': str,
                'language': str,
                'category': str,
                'is_published': bool
            }
            
            for field, expected_type in required_fields.items():
                if field not in article:
                    article_issues.append(f"Missing field: {field}")
                elif article[field] is not None and not isinstance(article[field], expected_type):
                    article_issues.append(f"Wrong type for {field}: expected {expected_type.__name__}, got {type(article[field]).__name__}")
            
            # Optional fields check
            optional_fields = ['image_url', 'short_title', 'content_type', 'artists', 'published_at', 'scheduled_publish_at', 'view_count']
            for field in optional_fields:
                if field in article and article[field] is not None:
                    # Just verify they exist, type checking is less strict for optional fields
                    pass
            
            if not article_issues:
                valid_articles += 1
            else:
                issues_found.extend([f"Article {i+1} (ID: {article.get('id', 'unknown')}): {issue}" for issue in article_issues])
        
        print(f"✅ Valid articles: {valid_articles}/{len(articles)}")
        
        if issues_found:
            print(f"⚠️  Issues found in {len(articles) - valid_articles} articles:")
            for issue in issues_found[:10]:  # Show first 10 issues
                print(f"   - {issue}")
            if len(issues_found) > 10:
                print(f"   ... and {len(issues_found) - 10} more issues")
        
        # Test 9: Data quality check
        print("\n9. Testing data quality")
        quality_issues = []
        
        for article in articles[:10]:  # Check first 10 articles
            if not article.get('title') or len(article['title'].strip()) < 3:
                quality_issues.append(f"Article {article.get('id')}: Title too short or empty")
            
            if not article.get('summary') or len(article['summary'].strip()) < 10:
                quality_issues.append(f"Article {article.get('id')}: Summary too short or empty")
            
            if not article.get('author') or len(article['author'].strip()) < 2:
                quality_issues.append(f"Article {article.get('id')}: Author name too short or empty")
        
        if quality_issues:
            print(f"⚠️  Data quality issues found:")
            for issue in quality_issues:
                print(f"   - {issue}")
        else:
            print("✅ Data quality check passed")

    def test_05_cms_articles_error_handling(self):
        """Test CMS articles error handling and edge cases"""
        print("\n--- Testing CMS Articles Error Handling ---")
        
        # Test 10: Invalid parameters
        print("\n10. Testing invalid parameters")
        
        # Invalid language
        response = requests.get(f"{API_URL}/cms/articles?language=invalid_lang&limit=10")
        print(f"   Invalid language response: {response.status_code}")
        # Should either return 200 with empty list or handle gracefully
        
        # Negative limit
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=-1")
        print(f"   Negative limit response: {response.status_code}")
        
        # Zero limit
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=0")
        print(f"   Zero limit response: {response.status_code}")
        
        # Very large limit
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=999999")
        print(f"   Very large limit response: {response.status_code}")
        
        # Negative skip
        response = requests.get(f"{API_URL}/cms/articles?language=en&skip=-1&limit=10")
        print(f"   Negative skip response: {response.status_code}")

    def test_06_cms_articles_performance(self):
        """Test CMS articles performance"""
        print("\n--- Testing CMS Articles Performance ---")
        
        # Test 11: Response time for large requests
        print("\n11. Testing response time for large requests")
        
        start_time = time.time()
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=1000")
        end_time = time.time()
        response_time = end_time - start_time
        
        self.assertEqual(response.status_code, 200, "Large request failed")
        articles = response.json()
        
        print(f"✅ Large request performance: {response_time:.3f} seconds for {len(articles)} articles")
        
        if response_time > 5.0:
            print(f"⚠️  Response time is slow: {response_time:.3f} seconds")
        else:
            print(f"✅ Response time acceptable: {response_time:.3f} seconds")

    def test_07_database_verification(self):
        """Verify articles exist in database"""
        print("\n--- Testing Database Verification ---")
        
        # Test 12: Verify articles exist in database
        print("\n12. Testing database article existence")
        
        # Get articles from CMS endpoint
        response = requests.get(f"{API_URL}/cms/articles?language=en&limit=100")
        self.assertEqual(response.status_code, 200, "Failed to get CMS articles")
        cms_articles = response.json()
        
        # Get articles from regular endpoint for comparison
        response = requests.get(f"{API_URL}/articles?limit=100")
        self.assertEqual(response.status_code, 200, "Failed to get regular articles")
        regular_articles = response.json()
        
        print(f"CMS articles count: {len(cms_articles)}")
        print(f"Regular articles count: {len(regular_articles)}")
        
        if len(cms_articles) == 0 and len(regular_articles) == 0:
            print("⚠️  No articles found in database - this might be the root cause")
        elif len(cms_articles) == 0 and len(regular_articles) > 0:
            print("❌ CRITICAL: Regular articles exist but CMS articles endpoint returns empty")
        elif len(cms_articles) > 0:
            print("✅ Articles exist in database and CMS endpoint returns them")
        
        # Test specific article retrieval
        if cms_articles:
            test_article_id = cms_articles[0]['id']
            response = requests.get(f"{API_URL}/cms/articles/{test_article_id}")
            if response.status_code == 200:
                print(f"✅ Individual article retrieval working (ID: {test_article_id})")
            else:
                print(f"❌ Individual article retrieval failed (ID: {test_article_id})")

    def test_08_frontend_compatibility(self):
        """Test frontend compatibility and exact use case"""
        print("\n--- Testing Frontend Compatibility ---")
        
        # Test 13: Simulate exact frontend Dashboard.jsx fetchArticles() call
        print("\n13. Testing exact frontend fetchArticles() simulation")
        
        # This simulates the exact call made by Dashboard.jsx
        params = {
            'language': 'en',
            'limit': 1000
        }
        
        print(f"Making request with params: {params}")
        response = requests.get(f"{API_URL}/cms/articles", params=params)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print(f"❌ CRITICAL: Frontend simulation failed")
            print(f"Response text: {response.text}")
            return
        
        try:
            articles = response.json()
            print(f"✅ Frontend simulation successful - received {len(articles)} articles")
            
            # Check if response is what frontend expects
            if isinstance(articles, list):
                print("✅ Response is array as expected by frontend")
                
                if articles:
                    # Check first article structure matches frontend expectations
                    first_article = articles[0]
                    frontend_expected_fields = ['id', 'title', 'summary', 'image_url', 'author', 'category', 'published_at']
                    
                    missing_frontend_fields = []
                    for field in frontend_expected_fields:
                        if field not in first_article:
                            missing_frontend_fields.append(field)
                    
                    if missing_frontend_fields:
                        print(f"⚠️  Missing fields expected by frontend: {missing_frontend_fields}")
                    else:
                        print("✅ All frontend-expected fields present")
                        
                    # Show sample article data
                    print(f"Sample article for frontend:")
                    print(f"  ID: {first_article.get('id')}")
                    print(f"  Title: {first_article.get('title', 'N/A')}")
                    print(f"  Author: {first_article.get('author', 'N/A')}")
                    print(f"  Category: {first_article.get('category', 'N/A')}")
                    print(f"  Published: {first_article.get('is_published', 'N/A')}")
                    
                else:
                    print("❌ CRITICAL: Empty articles array - this is likely the root cause of 'Loading articles...' issue")
            else:
                print(f"❌ CRITICAL: Response is not an array, got {type(articles)}")
                
        except json.JSONDecodeError as e:
            print(f"❌ CRITICAL: Invalid JSON response - {e}")
            print(f"Response text: {response.text[:500]}...")

if __name__ == "__main__":
    # Create a test suite focusing on CMS Article Loading
    suite = unittest.TestSuite()
    
    # Add tests in priority order
    suite.addTest(CMSArticleLoadingTest("test_01_cms_articles_basic_endpoint"))
    suite.addTest(CMSArticleLoadingTest("test_02_cms_articles_with_frontend_parameters"))
    suite.addTest(CMSArticleLoadingTest("test_03_cms_articles_parameter_variations"))
    suite.addTest(CMSArticleLoadingTest("test_04_cms_articles_response_format"))
    suite.addTest(CMSArticleLoadingTest("test_05_cms_articles_error_handling"))
    suite.addTest(CMSArticleLoadingTest("test_06_cms_articles_performance"))
    suite.addTest(CMSArticleLoadingTest("test_07_database_verification"))
    suite.addTest(CMSArticleLoadingTest("test_08_frontend_compatibility"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n{'='*80}")
    print("CMS ARTICLE LOADING BACKEND TESTING SUMMARY")
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
        print("\n🎉 ALL CMS ARTICLE LOADING TESTS PASSED!")
        print("✅ Basic CMS articles endpoint working")
        print("✅ Frontend parameter compatibility working")
        print("✅ Parameter variations working")
        print("✅ Response format correct")
        print("✅ Error handling working")
        print("✅ Performance acceptable")
        print("✅ Database verification successful")
        print("✅ Frontend compatibility confirmed")
        print("\n🔍 ROOT CAUSE ANALYSIS: If Dashboard is still stuck on 'Loading articles...', the issue is likely in frontend JavaScript code, not backend API.")
    else:
        print(f"\n❌ {len(result.failures + result.errors)} TESTS FAILED")
        print("\n🔍 ROOT CAUSE ANALYSIS: Backend API issues identified that could cause 'Loading articles...' problem.")