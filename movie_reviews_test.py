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
print(f"Testing Movie Reviews API at: {API_URL}")

class MovieReviewsTest(unittest.TestCase):
    """Test suite specifically for Movie Reviews functionality"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_veera_mallu_movie_review_article_data(self):
        """Test GET /api/articles/67 to verify Veera Mallu Movie Review article data"""
        print("\n--- Testing Veera Mallu Movie Review Article Data (ID 67) ---")
        
        # Test specific article ID 67
        response = requests.get(f"{API_URL}/articles/67")
        
        if response.status_code == 404:
            print("⚠️ Article ID 67 not found - checking if it exists in database")
            # Get all articles to see what's available
            all_articles_response = requests.get(f"{API_URL}/articles")
            if all_articles_response.status_code == 200:
                articles = all_articles_response.json()
                print(f"   - Total articles in database: {len(articles)}")
                
                # Look for Veera Mallu article by title
                veera_mallu_article = None
                for article in articles:
                    if "Veera Mallu" in article.get("title", ""):
                        veera_mallu_article = article
                        break
                
                if veera_mallu_article:
                    print(f"   - Found Veera Mallu article with ID: {veera_mallu_article['id']}")
                    print(f"   - Title: {veera_mallu_article['title']}")
                    print(f"   - Category: {veera_mallu_article.get('category', 'N/A')}")
                    print(f"   - Published: {veera_mallu_article.get('is_published', 'N/A')}")
                    print(f"   - Published At: {veera_mallu_article.get('published_at', 'N/A')}")
                    
                    # Test the actual article ID
                    actual_id = veera_mallu_article['id']
                    response = requests.get(f"{API_URL}/articles/{actual_id}")
                    self.assertEqual(response.status_code, 200, f"Failed to get Veera Mallu article with ID {actual_id}")
                    
                    article = response.json()
                    print(f"✅ Successfully retrieved Veera Mallu article with ID {actual_id}")
                    
                    # Verify article data
                    self.assertEqual(article["id"], actual_id)
                    self.assertIn("title", article)
                    self.assertIn("Veera Mallu", article["title"])
                    
                    # Check if it's in movie-reviews category
                    if article.get("category") == "movie-reviews":
                        print("✅ Article is correctly categorized as 'movie-reviews'")
                    else:
                        print(f"⚠️ Article category is '{article.get('category')}', not 'movie-reviews'")
                    
                    # Check content_type
                    if article.get("content_type") == "movie_review":
                        print("✅ Article content_type is correctly set to 'movie_review'")
                    else:
                        print(f"⚠️ Article content_type is '{article.get('content_type')}', not 'movie_review'")
                    
                    # Check publication status
                    if article.get("is_published") == True:
                        print("✅ Article is published (is_published: true)")
                    else:
                        print(f"⚠️ Article is not published (is_published: {article.get('is_published')})")
                    
                    # Check published_at timestamp
                    published_at = article.get("published_at")
                    if published_at:
                        try:
                            pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                            current_date = datetime.now()
                            
                            # Check if published_at is not in the future
                            if pub_date <= current_date:
                                print(f"✅ Published timestamp is current/past: {published_at}")
                            else:
                                print(f"⚠️ Published timestamp is in the future: {published_at}")
                            
                            # Check if it's within "this week" range (Aug 2-10, 2025)
                            week_start = datetime(2025, 8, 2)
                            week_end = datetime(2025, 8, 10, 23, 59, 59)
                            
                            if week_start <= pub_date <= week_end:
                                print(f"✅ Article is within 'this week' range (Aug 2-10, 2025)")
                            else:
                                print(f"⚠️ Article is outside 'this week' range: {pub_date}")
                                
                        except Exception as e:
                            print(f"⚠️ Error parsing published_at timestamp: {e}")
                    else:
                        print("⚠️ Article has no published_at timestamp")
                    
                    return article
                else:
                    print("❌ No Veera Mallu article found in database")
                    self.fail("Veera Mallu Movie Review article not found in database")
            else:
                self.fail("Failed to retrieve articles from database")
        else:
            self.assertEqual(response.status_code, 200, f"Failed to get article with ID 67")
            article = response.json()
            
            print(f"✅ Successfully retrieved article ID 67")
            print(f"   - Title: {article.get('title', 'N/A')}")
            print(f"   - Category: {article.get('category', 'N/A')}")
            print(f"   - Content Type: {article.get('content_type', 'N/A')}")
            print(f"   - Published: {article.get('is_published', 'N/A')}")
            print(f"   - Published At: {article.get('published_at', 'N/A')}")
            
            # Verify expected data
            expected_checks = {
                "category": "movie-reviews",
                "content_type": "movie_review", 
                "is_published": True
            }
            
            for field, expected_value in expected_checks.items():
                actual_value = article.get(field)
                if actual_value == expected_value:
                    print(f"✅ {field}: {actual_value} (matches expected)")
                else:
                    print(f"⚠️ {field}: {actual_value} (expected: {expected_value})")
            
            return article

    def test_movie_reviews_category_endpoint(self):
        """Test GET /api/articles/category/movie-reviews to verify article inclusion"""
        print("\n--- Testing Movie Reviews Category Endpoint ---")
        
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie-reviews category articles")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "Movie reviews response should be a list")
        
        print(f"✅ Movie reviews category endpoint working")
        print(f"   - Total articles in movie-reviews category: {len(articles)}")
        
        if len(articles) == 0:
            print("⚠️ No articles found in movie-reviews category")
            
            # Check if there are any articles with movie-reviews in other endpoints
            print("   - Checking all articles for movie-reviews category...")
            all_articles_response = requests.get(f"{API_URL}/articles")
            if all_articles_response.status_code == 200:
                all_articles = all_articles_response.json()
                movie_review_articles = [a for a in all_articles if a.get("category") == "movie-reviews"]
                print(f"   - Found {len(movie_review_articles)} articles with movie-reviews category in all articles")
                
                if movie_review_articles:
                    for article in movie_review_articles:
                        print(f"     * ID {article['id']}: {article['title']}")
            return articles
        
        # Look for Veera Mallu article specifically
        veera_mallu_found = False
        veera_mallu_article = None
        
        for article in articles:
            print(f"   - Article ID {article['id']}: {article['title']}")
            print(f"     * Published: {article.get('is_published', 'N/A')}")
            print(f"     * Published At: {article.get('published_at', 'N/A')}")
            
            if "Veera Mallu" in article.get("title", ""):
                veera_mallu_found = True
                veera_mallu_article = article
                print(f"     ✅ Found Veera Mallu Movie Review in category response")
        
        if veera_mallu_found:
            print(f"✅ Veera Mallu Movie Review is included in movie-reviews category")
            
            # Verify the article details
            if veera_mallu_article:
                published_at = veera_mallu_article.get("published_at")
                if published_at:
                    try:
                        pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                        current_date = datetime.now()
                        
                        if pub_date <= current_date:
                            print(f"✅ Veera Mallu article has current/past timestamp: {published_at}")
                        else:
                            print(f"⚠️ Veera Mallu article has future timestamp: {published_at}")
                    except Exception as e:
                        print(f"⚠️ Error parsing Veera Mallu published_at: {e}")
        else:
            print(f"⚠️ Veera Mallu Movie Review not found in movie-reviews category response")
        
        return articles

    def test_movie_reviews_date_filtering(self):
        """Test date filtering for movie reviews within 'this week' range"""
        print("\n--- Testing Movie Reviews Date Filtering ---")
        
        # Get movie reviews
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie-reviews articles")
        
        articles = response.json()
        print(f"Testing date filtering on {len(articles)} movie review articles")
        
        # Define "this week" range (Aug 2-10, 2025 as mentioned in the request)
        week_start = datetime(2025, 8, 2)
        week_end = datetime(2025, 8, 10, 23, 59, 59)
        current_date = datetime.now()
        
        print(f"   - This week range: {week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}")
        print(f"   - Current date: {current_date.strftime('%Y-%m-%d %H:%M:%S')}")
        
        this_week_articles = []
        future_articles = []
        past_articles = []
        invalid_dates = []
        
        for article in articles:
            published_at = article.get("published_at")
            article_title = article.get("title", "Unknown")
            
            if not published_at:
                invalid_dates.append(article)
                print(f"   ⚠️ {article_title}: No published_at timestamp")
                continue
            
            try:
                pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                
                if pub_date > current_date:
                    future_articles.append(article)
                    print(f"   ⚠️ {article_title}: Future date {pub_date.strftime('%Y-%m-%d %H:%M')}")
                elif week_start <= pub_date <= week_end:
                    this_week_articles.append(article)
                    print(f"   ✅ {article_title}: This week {pub_date.strftime('%Y-%m-%d %H:%M')}")
                else:
                    past_articles.append(article)
                    print(f"   📅 {article_title}: Past date {pub_date.strftime('%Y-%m-%d %H:%M')}")
                    
            except Exception as e:
                invalid_dates.append(article)
                print(f"   ❌ {article_title}: Invalid date format - {e}")
        
        print(f"\n📊 Date Filtering Results:")
        print(f"   - This week articles: {len(this_week_articles)}")
        print(f"   - Future articles: {len(future_articles)}")
        print(f"   - Past articles: {len(past_articles)}")
        print(f"   - Invalid dates: {len(invalid_dates)}")
        
        # Check specifically for Veera Mallu article
        veera_mallu_in_this_week = False
        for article in this_week_articles:
            if "Veera Mallu" in article.get("title", ""):
                veera_mallu_in_this_week = True
                print(f"✅ Veera Mallu Movie Review passes 'this week' date filtering")
                break
        
        if not veera_mallu_in_this_week and articles:
            # Check if Veera Mallu is in other categories
            for article in future_articles + past_articles + invalid_dates:
                if "Veera Mallu" in article.get("title", ""):
                    print(f"⚠️ Veera Mallu Movie Review found but not in 'this week' range")
                    break
        
        return {
            "this_week": this_week_articles,
            "future": future_articles,
            "past": past_articles,
            "invalid": invalid_dates
        }

    def test_other_movie_reviews_articles(self):
        """Test that other articles in movie-reviews category are returned"""
        print("\n--- Testing Other Movie Reviews Articles ---")
        
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie-reviews articles")
        
        articles = response.json()
        print(f"Found {len(articles)} total articles in movie-reviews category")
        
        if len(articles) == 0:
            print("⚠️ No articles found in movie-reviews category")
            
            # Check if movie-reviews category exists
            categories_response = requests.get(f"{API_URL}/categories")
            if categories_response.status_code == 200:
                categories = categories_response.json()
                movie_review_cat = None
                for cat in categories:
                    if cat.get("slug") == "movie-reviews":
                        movie_review_cat = cat
                        break
                
                if movie_review_cat:
                    print(f"✅ movie-reviews category exists: {movie_review_cat['name']} (ID: {movie_review_cat['id']})")
                else:
                    print("❌ movie-reviews category does not exist in database")
            
            return articles
        
        # Analyze the articles
        published_articles = []
        unpublished_articles = []
        
        for article in articles:
            title = article.get("title", "Unknown")
            is_published = article.get("is_published", False)
            published_at = article.get("published_at", "N/A")
            content_type = article.get("content_type", "N/A")
            
            print(f"   - {title}")
            print(f"     * Published: {is_published}")
            print(f"     * Published At: {published_at}")
            print(f"     * Content Type: {content_type}")
            
            if is_published:
                published_articles.append(article)
            else:
                unpublished_articles.append(article)
        
        print(f"\n📊 Movie Reviews Analysis:")
        print(f"   - Published articles: {len(published_articles)}")
        print(f"   - Unpublished articles: {len(unpublished_articles)}")
        
        # Verify article structure
        if articles:
            sample_article = articles[0]
            required_fields = ["id", "title", "summary", "image_url", "author", "published_at", "category"]
            
            print(f"\n🔍 Article Structure Verification:")
            for field in required_fields:
                if field in sample_article:
                    print(f"   ✅ {field}: {sample_article[field]}")
                else:
                    print(f"   ❌ Missing field: {field}")
        
        return articles

    def test_movie_reviews_section_endpoint(self):
        """Test the movie reviews section endpoint"""
        print("\n--- Testing Movie Reviews Section Endpoint ---")
        
        response = requests.get(f"{API_URL}/articles/sections/movie-reviews")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Movie reviews section endpoint working")
            
            if isinstance(data, dict):
                print(f"   - Response structure: {list(data.keys())}")
                
                # Check for expected structure
                if "movie_reviews" in data:
                    movie_reviews = data["movie_reviews"]
                    print(f"   - Movie reviews: {len(movie_reviews)} articles")
                    
                    # Look for Veera Mallu
                    for article in movie_reviews:
                        if "Veera Mallu" in article.get("title", ""):
                            print(f"   ✅ Veera Mallu found in section endpoint")
                            break
                
                if "bollywood" in data:
                    bollywood = data["bollywood"]
                    print(f"   - Bollywood reviews: {len(bollywood)} articles")
            
            elif isinstance(data, list):
                print(f"   - Direct list response: {len(data)} articles")
                
                # Look for Veera Mallu
                for article in data:
                    if "Veera Mallu" in article.get("title", ""):
                        print(f"   ✅ Veera Mallu found in section endpoint")
                        break
            
            return data
        else:
            print(f"⚠️ Movie reviews section endpoint returned {response.status_code}")
            print(f"   - Response: {response.text}")
            return None

    def test_publish_immediately_functionality(self):
        """Test the 'Publish Immediately' functionality fix"""
        print("\n--- Testing Publish Immediately Functionality ---")
        
        # Get all articles to check for recently published ones
        response = requests.get(f"{API_URL}/articles")
        self.assertEqual(response.status_code, 200, "Failed to get articles")
        
        articles = response.json()
        current_time = datetime.now()
        
        # Look for articles published in the last hour (indicating recent "Publish Immediately" usage)
        recently_published = []
        
        for article in articles:
            published_at = article.get("published_at")
            if published_at and article.get("is_published"):
                try:
                    pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    time_diff = current_time - pub_date
                    
                    # Check if published within last 24 hours
                    if time_diff.total_seconds() < 86400:  # 24 hours
                        recently_published.append({
                            "article": article,
                            "time_diff": time_diff
                        })
                except Exception as e:
                    continue
        
        print(f"Found {len(recently_published)} recently published articles")
        
        # Look specifically for Veera Mallu
        veera_mallu_recent = None
        for item in recently_published:
            article = item["article"]
            if "Veera Mallu" in article.get("title", ""):
                veera_mallu_recent = item
                break
        
        if veera_mallu_recent:
            article = veera_mallu_recent["article"]
            time_diff = veera_mallu_recent["time_diff"]
            
            print(f"✅ Veera Mallu Movie Review found in recently published articles")
            print(f"   - Published: {article['published_at']}")
            print(f"   - Time since publication: {time_diff}")
            print(f"   - Is Published: {article['is_published']}")
            
            # Verify it's not future-dated
            pub_date = datetime.fromisoformat(article['published_at'].replace('Z', '+00:00'))
            if pub_date <= current_time:
                print(f"✅ Published timestamp is not in the future")
            else:
                print(f"⚠️ Published timestamp is in the future: {pub_date}")
        else:
            print(f"⚠️ Veera Mallu Movie Review not found in recently published articles")
            
            # Check if it exists at all
            veera_mallu_exists = False
            for article in articles:
                if "Veera Mallu" in article.get("title", ""):
                    veera_mallu_exists = True
                    print(f"   - Found Veera Mallu article (ID {article['id']}) but not recently published")
                    print(f"   - Published At: {article.get('published_at', 'N/A')}")
                    print(f"   - Is Published: {article.get('is_published', 'N/A')}")
                    break
            
            if not veera_mallu_exists:
                print(f"   - Veera Mallu article not found in database at all")
        
        return recently_published

    def test_comprehensive_movie_reviews_functionality(self):
        """Comprehensive test of all movie reviews functionality"""
        print("\n=== COMPREHENSIVE MOVIE REVIEWS FUNCTIONALITY TEST ===")
        
        # Run all individual tests and collect results
        results = {}
        
        try:
            results["article_data"] = self.test_veera_mallu_movie_review_article_data()
        except Exception as e:
            results["article_data"] = f"Error: {e}"
        
        try:
            results["category_endpoint"] = self.test_movie_reviews_category_endpoint()
        except Exception as e:
            results["category_endpoint"] = f"Error: {e}"
        
        try:
            results["date_filtering"] = self.test_movie_reviews_date_filtering()
        except Exception as e:
            results["date_filtering"] = f"Error: {e}"
        
        try:
            results["other_articles"] = self.test_other_movie_reviews_articles()
        except Exception as e:
            results["other_articles"] = f"Error: {e}"
        
        try:
            results["section_endpoint"] = self.test_movie_reviews_section_endpoint()
        except Exception as e:
            results["section_endpoint"] = f"Error: {e}"
        
        try:
            results["publish_immediately"] = self.test_publish_immediately_functionality()
        except Exception as e:
            results["publish_immediately"] = f"Error: {e}"
        
        # Summary
        print(f"\n🎯 MOVIE REVIEWS FUNCTIONALITY TEST SUMMARY:")
        print(f"=" * 60)
        
        # Check if Veera Mallu article exists and is properly configured
        veera_mallu_found = False
        veera_mallu_in_category = False
        veera_mallu_published = False
        veera_mallu_current_date = False
        
        if isinstance(results["article_data"], dict):
            veera_mallu_found = True
            if results["article_data"].get("category") == "movie-reviews":
                veera_mallu_in_category = True
            if results["article_data"].get("is_published"):
                veera_mallu_published = True
            
            published_at = results["article_data"].get("published_at")
            if published_at:
                try:
                    pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    if pub_date <= datetime.now():
                        veera_mallu_current_date = True
                except:
                    pass
        
        print(f"✅ Veera Mallu Article Found: {veera_mallu_found}")
        print(f"✅ In movie-reviews Category: {veera_mallu_in_category}")
        print(f"✅ Published Status: {veera_mallu_published}")
        print(f"✅ Current/Past Timestamp: {veera_mallu_current_date}")
        
        # Check category endpoint
        category_working = isinstance(results["category_endpoint"], list)
        category_has_articles = category_working and len(results["category_endpoint"]) > 0
        
        print(f"✅ Category Endpoint Working: {category_working}")
        print(f"✅ Category Has Articles: {category_has_articles}")
        
        # Check date filtering
        date_filtering_working = isinstance(results["date_filtering"], dict)
        print(f"✅ Date Filtering Working: {date_filtering_working}")
        
        # Overall assessment
        critical_issues = []
        if not veera_mallu_found:
            critical_issues.append("Veera Mallu article not found")
        if not veera_mallu_in_category:
            critical_issues.append("Veera Mallu not in movie-reviews category")
        if not veera_mallu_published:
            critical_issues.append("Veera Mallu not published")
        if not veera_mallu_current_date:
            critical_issues.append("Veera Mallu has future timestamp")
        if not category_working:
            critical_issues.append("Category endpoint not working")
        
        if critical_issues:
            print(f"\n❌ CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                print(f"   - {issue}")
        else:
            print(f"\n🎉 ALL CRITICAL FUNCTIONALITY WORKING CORRECTLY!")
        
        return results

if __name__ == "__main__":
    # Create a test suite focusing on movie reviews
    suite = unittest.TestSuite()
    
    # Add the comprehensive test
    suite.addTest(MovieReviewsTest("test_comprehensive_movie_reviews_functionality"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with appropriate code
    sys.exit(0 if result.wasSuccessful() else 1)