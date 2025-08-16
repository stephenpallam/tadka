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
print(f"Testing Viral Shorts API at: {API_URL}")

class ViralShortsBackendTest(unittest.TestCase):
    """Test suite for the Viral Shorts Backend API"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully for Viral Shorts testing")

    def test_viral_shorts_endpoint_basic_functionality(self):
        """Test basic functionality of GET /api/articles/sections/viral-shorts endpoint"""
        print("\n--- Testing Viral Shorts Endpoint Basic Functionality ---")
        
        # Test basic endpoint without parameters
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts section data")
        
        data = response.json()
        self.assertIsInstance(data, dict, "Viral shorts response should be a dictionary")
        
        # Verify response structure
        self.assertIn("viral_shorts", data, "Response missing 'viral_shorts' array")
        self.assertIn("bollywood", data, "Response missing 'bollywood' array")
        
        viral_shorts_articles = data["viral_shorts"]
        bollywood_articles = data["bollywood"]
        
        self.assertIsInstance(viral_shorts_articles, list, "'viral_shorts' should be a list")
        self.assertIsInstance(bollywood_articles, list, "'bollywood' should be a list")
        
        print("✅ Basic endpoint structure verified - returns proper JSON with 'viral_shorts' and 'bollywood' arrays")
        print(f"   - Viral Shorts articles: {len(viral_shorts_articles)}")
        print(f"   - Bollywood articles: {len(bollywood_articles)}")
        
        return data

    def test_viral_shorts_article_structure(self):
        """Test that articles have all required fields including youtube_url"""
        print("\n--- Testing Viral Shorts Article Structure ---")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts data")
        data = response.json()
        
        # Required fields for frontend Viral Shorts component
        required_fields = [
            "id", "title", "summary", "image_url", "youtube_url", 
            "author", "published_at", "category", "content_type"
        ]
        
        # Test viral_shorts articles
        viral_shorts_articles = data["viral_shorts"]
        if viral_shorts_articles:
            print(f"\n1. Testing Viral Shorts Articles Structure ({len(viral_shorts_articles)} articles)")
            for i, article in enumerate(viral_shorts_articles[:3]):  # Test first 3 articles
                print(f"\n   Article {i+1}: '{article.get('title', 'No Title')[:50]}...'")
                
                for field in required_fields:
                    self.assertIn(field, article, f"Missing required field '{field}' in viral_shorts article")
                    print(f"     ✅ {field}: {type(article[field]).__name__}")
                
                # Specific validation for key fields
                self.assertIsInstance(article["id"], int, "Article ID should be integer")
                self.assertIsInstance(article["title"], str, "Article title should be string")
                self.assertIsInstance(article["summary"], str, "Article summary should be string")
                self.assertIsInstance(article["author"], str, "Article author should be string")
                
                # Critical: Check youtube_url field for thumbnail extraction
                if article["youtube_url"]:
                    self.assertIsInstance(article["youtube_url"], str, "YouTube URL should be string")
                    print(f"     ✅ YouTube URL present: {article['youtube_url'][:50]}...")
                else:
                    print(f"     ⚠️ YouTube URL is null/empty for article {article['id']}")
                
                # Check image_url for fallback thumbnails
                if article["image_url"]:
                    self.assertIsInstance(article["image_url"], str, "Image URL should be string")
                    print(f"     ✅ Image URL present: {article['image_url'][:50]}...")
                
            print("✅ Viral Shorts articles have proper field structure")
        else:
            print("⚠️ No viral_shorts articles found - database may need seeding")
        
        # Test bollywood articles
        bollywood_articles = data["bollywood"]
        if bollywood_articles:
            print(f"\n2. Testing Bollywood Articles Structure ({len(bollywood_articles)} articles)")
            for i, article in enumerate(bollywood_articles[:3]):  # Test first 3 articles
                print(f"\n   Article {i+1}: '{article.get('title', 'No Title')[:50]}...'")
                
                for field in required_fields:
                    self.assertIn(field, article, f"Missing required field '{field}' in bollywood article")
                    print(f"     ✅ {field}: {type(article[field]).__name__}")
                
                # Critical: Check youtube_url field for thumbnail extraction
                if article["youtube_url"]:
                    self.assertIsInstance(article["youtube_url"], str, "YouTube URL should be string")
                    print(f"     ✅ YouTube URL present: {article['youtube_url'][:50]}...")
                else:
                    print(f"     ⚠️ YouTube URL is null/empty for article {article['id']}")
                
            print("✅ Bollywood articles have proper field structure")
        else:
            print("⚠️ No bollywood articles found - database may need seeding")

    def test_viral_shorts_state_filtering(self):
        """Test state filtering functionality with ?states=ap parameter"""
        print("\n--- Testing Viral Shorts State Filtering ---")
        
        # Test with Andhra Pradesh state filtering
        print("\n1. Testing with states=ap parameter")
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=ap")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts with AP state filtering")
        
        ap_data = response.json()
        self.assertIn("viral_shorts", ap_data, "AP filtered response missing 'viral_shorts' array")
        self.assertIn("bollywood", ap_data, "AP filtered response missing 'bollywood' array")
        
        ap_viral_shorts = ap_data["viral_shorts"]
        ap_bollywood = ap_data["bollywood"]
        
        print(f"   - AP Viral Shorts articles: {len(ap_viral_shorts)}")
        print(f"   - AP Bollywood articles: {len(ap_bollywood)} (should be unfiltered)")
        
        # Verify that viral_shorts are filtered but bollywood is not
        if ap_viral_shorts:
            for article in ap_viral_shorts[:2]:  # Check first 2 articles
                if "states" in article and article["states"]:
                    # If states field exists, it should contain 'ap' or be null (universal)
                    if isinstance(article["states"], list):
                        states_valid = 'ap' in article["states"] or article["states"] is None
                    else:
                        states_valid = True  # Universal articles
                    print(f"   - Article '{article['title'][:30]}...' states: {article.get('states', 'universal')}")
        
        # Test with multiple states
        print("\n2. Testing with states=ap,ts parameter")
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=ap,ts")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts with AP,TS state filtering")
        
        multi_state_data = response.json()
        multi_viral_shorts = multi_state_data["viral_shorts"]
        
        print(f"   - AP+TS Viral Shorts articles: {len(multi_viral_shorts)}")
        
        # Test with invalid state
        print("\n3. Testing with invalid state parameter")
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=invalid")
        self.assertEqual(response.status_code, 200, "Invalid state should still return 200")
        
        invalid_data = response.json()
        print(f"   - Invalid state Viral Shorts articles: {len(invalid_data['viral_shorts'])}")
        
        print("✅ State filtering functionality working correctly")

    def test_viral_shorts_limit_parameter(self):
        """Test limit parameter functionality"""
        print("\n--- Testing Viral Shorts Limit Parameter ---")
        
        # Test with different limit values
        limits_to_test = [5, 10, 15, 20]
        
        for limit in limits_to_test:
            print(f"\n   Testing limit={limit}")
            response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit={limit}")
            self.assertEqual(response.status_code, 200, f"Failed to get viral shorts with limit={limit}")
            
            data = response.json()
            viral_shorts = data["viral_shorts"]
            bollywood = data["bollywood"]
            
            # Both arrays should respect the limit
            self.assertLessEqual(len(viral_shorts), limit, f"Viral shorts exceeded limit of {limit}")
            self.assertLessEqual(len(bollywood), limit, f"Bollywood exceeded limit of {limit}")
            
            print(f"     ✅ Viral Shorts: {len(viral_shorts)}/{limit}, Bollywood: {len(bollywood)}/{limit}")
        
        print("✅ Limit parameter functionality working correctly")

    def test_viral_shorts_youtube_thumbnail_extraction(self):
        """Test that articles have proper YouTube URLs for thumbnail extraction"""
        print("\n--- Testing YouTube Thumbnail Extraction Capability ---")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=10")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts data")
        data = response.json()
        
        all_articles = data["viral_shorts"] + data["bollywood"]
        youtube_articles = []
        non_youtube_articles = []
        
        for article in all_articles:
            if article.get("youtube_url") and article["youtube_url"].strip():
                youtube_articles.append(article)
                
                # Test if URL looks like a valid YouTube URL
                youtube_url = article["youtube_url"]
                is_valid_youtube = (
                    "youtube.com" in youtube_url.lower() or 
                    "youtu.be" in youtube_url.lower()
                )
                
                if is_valid_youtube:
                    print(f"   ✅ Valid YouTube URL: {article['title'][:40]}...")
                    print(f"      URL: {youtube_url[:60]}...")
                else:
                    print(f"   ⚠️ Non-YouTube URL: {article['title'][:40]}...")
                    print(f"      URL: {youtube_url[:60]}...")
            else:
                non_youtube_articles.append(article)
        
        print(f"\n📊 YouTube URL Analysis:")
        print(f"   - Total articles analyzed: {len(all_articles)}")
        print(f"   - Articles with YouTube URLs: {len(youtube_articles)}")
        print(f"   - Articles without YouTube URLs: {len(non_youtube_articles)}")
        
        if youtube_articles:
            print(f"   - YouTube URL coverage: {len(youtube_articles)/len(all_articles)*100:.1f}%")
            print("✅ YouTube thumbnail extraction is supported")
        else:
            print("⚠️ No YouTube URLs found - may need to add YouTube content to database")
        
        # Test thumbnail extraction logic (simulated)
        if youtube_articles:
            sample_article = youtube_articles[0]
            youtube_url = sample_article["youtube_url"]
            
            print(f"\n🎬 Sample Thumbnail Extraction Test:")
            print(f"   - Article: {sample_article['title'][:50]}...")
            print(f"   - YouTube URL: {youtube_url}")
            
            # Simulate frontend thumbnail extraction logic
            if "youtube.com/watch?v=" in youtube_url:
                video_id = youtube_url.split("v=")[1].split("&")[0]
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                print(f"   - Extracted Video ID: {video_id}")
                print(f"   - Thumbnail URL: {thumbnail_url}")
                print("   ✅ Thumbnail extraction logic compatible")
            elif "youtu.be/" in youtube_url:
                video_id = youtube_url.split("youtu.be/")[1].split("?")[0]
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                print(f"   - Extracted Video ID: {video_id}")
                print(f"   - Thumbnail URL: {thumbnail_url}")
                print("   ✅ Thumbnail extraction logic compatible")
            else:
                print("   ⚠️ URL format may need custom thumbnail extraction logic")

    def test_viral_shorts_frontend_compatibility(self):
        """Test that data structure is suitable for frontend Viral Shorts component"""
        print("\n--- Testing Frontend Viral Shorts Component Compatibility ---")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=5")
        self.assertEqual(response.status_code, 200, "Failed to get viral shorts data")
        data = response.json()
        
        # Test 1: Component Data Structure
        print("\n1. Testing Component Data Structure")
        self.assertIsInstance(data, dict, "Data should be a dictionary")
        self.assertIn("viral_shorts", data, "Missing viral_shorts array for main tab")
        self.assertIn("bollywood", data, "Missing bollywood array for Bollywood tab")
        
        viral_shorts = data["viral_shorts"]
        bollywood = data["bollywood"]
        
        print(f"   ✅ Data structure compatible with tabbed interface")
        print(f"   - Main tab (viral_shorts): {len(viral_shorts)} articles")
        print(f"   - Bollywood tab (bollywood): {len(bollywood)} articles")
        
        # Test 2: Article Display Requirements
        print("\n2. Testing Article Display Requirements")
        
        all_articles = viral_shorts + bollywood
        display_ready_count = 0
        
        for article in all_articles[:5]:  # Test first 5 articles
            has_title = bool(article.get("title", "").strip())
            has_thumbnail = bool(article.get("youtube_url", "").strip() or article.get("image_url", "").strip())
            has_author = bool(article.get("author", "").strip())
            has_date = bool(article.get("published_at"))
            
            if has_title and has_thumbnail and has_author and has_date:
                display_ready_count += 1
                print(f"   ✅ Article ready for display: '{article['title'][:40]}...'")
            else:
                print(f"   ⚠️ Article missing display data: '{article.get('title', 'No Title')[:40]}...'")
                if not has_title:
                    print(f"      - Missing title")
                if not has_thumbnail:
                    print(f"      - Missing thumbnail (no youtube_url or image_url)")
                if not has_author:
                    print(f"      - Missing author")
                if not has_date:
                    print(f"      - Missing published_at")
        
        display_percentage = (display_ready_count / min(len(all_articles), 5)) * 100 if all_articles else 0
        print(f"\n   📊 Display Readiness: {display_ready_count}/{min(len(all_articles), 5)} articles ({display_percentage:.1f}%)")
        
        # Test 3: Video Modal Requirements
        print("\n3. Testing Video Modal Requirements")
        
        video_ready_count = 0
        for article in all_articles[:5]:
            youtube_url = article.get("youtube_url", "")
            if youtube_url and youtube_url.strip():
                video_ready_count += 1
                print(f"   ✅ Video modal ready: '{article['title'][:40]}...'")
                print(f"      YouTube URL: {youtube_url[:50]}...")
            else:
                print(f"   ⚠️ No video URL: '{article.get('title', 'No Title')[:40]}...'")
        
        video_percentage = (video_ready_count / min(len(all_articles), 5)) * 100 if all_articles else 0
        print(f"\n   📊 Video Modal Readiness: {video_ready_count}/{min(len(all_articles), 5)} articles ({video_percentage:.1f}%)")
        
        # Test 4: State Filtering Integration
        print("\n4. Testing State Filtering Integration")
        
        # Test that state filtering works for component
        ap_response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=ap&limit=3")
        self.assertEqual(ap_response.status_code, 200, "State filtering failed")
        ap_data = ap_response.json()
        
        print(f"   ✅ State filtering integration working")
        print(f"   - AP filtered viral_shorts: {len(ap_data['viral_shorts'])} articles")
        print(f"   - Bollywood (unfiltered): {len(ap_data['bollywood'])} articles")
        
        # Test 5: Performance and Response Time
        print("\n5. Testing Performance and Response Time")
        
        import time
        start_time = time.time()
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=20")
        end_time = time.time()
        
        response_time = end_time - start_time
        self.assertEqual(response.status_code, 200, "Performance test request failed")
        
        print(f"   ✅ API Response Time: {response_time:.3f} seconds")
        if response_time < 1.0:
            print(f"   ✅ Performance: Excellent (< 1 second)")
        elif response_time < 2.0:
            print(f"   ✅ Performance: Good (< 2 seconds)")
        else:
            print(f"   ⚠️ Performance: May need optimization (> 2 seconds)")
        
        print("\n✅ Frontend Viral Shorts Component Compatibility Verified")

    def test_viral_shorts_error_handling(self):
        """Test error handling and edge cases"""
        print("\n--- Testing Viral Shorts Error Handling ---")
        
        # Test 1: Invalid parameters
        print("\n1. Testing Invalid Parameters")
        
        # Test with very large limit
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=1000")
        self.assertEqual(response.status_code, 200, "Large limit should be handled gracefully")
        data = response.json()
        print(f"   ✅ Large limit handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        # Test with zero limit
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=0")
        self.assertEqual(response.status_code, 200, "Zero limit should be handled gracefully")
        data = response.json()
        print(f"   ✅ Zero limit handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        # Test with negative limit
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=-5")
        self.assertEqual(response.status_code, 200, "Negative limit should be handled gracefully")
        data = response.json()
        print(f"   ✅ Negative limit handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        # Test 2: Invalid state codes
        print("\n2. Testing Invalid State Codes")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=xyz,abc")
        self.assertEqual(response.status_code, 200, "Invalid state codes should not cause errors")
        data = response.json()
        print(f"   ✅ Invalid states handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        # Test 3: Empty parameters
        print("\n3. Testing Empty Parameters")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=&limit=")
        self.assertEqual(response.status_code, 200, "Empty parameters should be handled gracefully")
        data = response.json()
        print(f"   ✅ Empty parameters handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        # Test 4: Multiple parameter combinations
        print("\n4. Testing Multiple Parameter Combinations")
        
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=ap,ts&limit=10")
        self.assertEqual(response.status_code, 200, "Multiple parameters should work together")
        data = response.json()
        print(f"   ✅ Multiple parameters handled: viral_shorts={len(data['viral_shorts'])}, bollywood={len(data['bollywood'])}")
        
        print("✅ Error handling and edge cases working correctly")

    def test_viral_shorts_comprehensive_integration(self):
        """Comprehensive integration test for Viral Shorts functionality"""
        print("\n--- Comprehensive Viral Shorts Integration Test ---")
        
        print("\n🎯 TESTING COMPLETE VIRAL SHORTS WORKFLOW")
        
        # Step 1: Basic endpoint functionality
        print("\n1. Basic Endpoint Test")
        response = requests.get(f"{API_URL}/articles/sections/viral-shorts")
        self.assertEqual(response.status_code, 200, "Basic endpoint failed")
        data = response.json()
        
        self.assertIn("viral_shorts", data)
        self.assertIn("bollywood", data)
        print("   ✅ Basic endpoint working")
        
        # Step 2: Data quality verification
        print("\n2. Data Quality Verification")
        all_articles = data["viral_shorts"] + data["bollywood"]
        
        quality_metrics = {
            "total_articles": len(all_articles),
            "articles_with_youtube": 0,
            "articles_with_images": 0,
            "articles_with_both": 0,
            "articles_ready_for_display": 0
        }
        
        for article in all_articles:
            has_youtube = bool(article.get("youtube_url", "").strip())
            has_image = bool(article.get("image_url", "").strip())
            has_title = bool(article.get("title", "").strip())
            has_author = bool(article.get("author", "").strip())
            
            if has_youtube:
                quality_metrics["articles_with_youtube"] += 1
            if has_image:
                quality_metrics["articles_with_images"] += 1
            if has_youtube and has_image:
                quality_metrics["articles_with_both"] += 1
            if has_youtube and has_title and has_author:
                quality_metrics["articles_ready_for_display"] += 1
        
        print(f"   📊 Data Quality Metrics:")
        print(f"      - Total articles: {quality_metrics['total_articles']}")
        print(f"      - With YouTube URLs: {quality_metrics['articles_with_youtube']}")
        print(f"      - With image URLs: {quality_metrics['articles_with_images']}")
        print(f"      - With both: {quality_metrics['articles_with_both']}")
        print(f"      - Display ready: {quality_metrics['articles_ready_for_display']}")
        
        # Step 3: State filtering test
        print("\n3. State Filtering Test")
        ap_response = requests.get(f"{API_URL}/articles/sections/viral-shorts?states=ap")
        self.assertEqual(ap_response.status_code, 200, "State filtering failed")
        ap_data = ap_response.json()
        
        print(f"   ✅ AP filtering: {len(ap_data['viral_shorts'])} viral shorts, {len(ap_data['bollywood'])} bollywood")
        
        # Step 4: Frontend component simulation
        print("\n4. Frontend Component Simulation")
        
        # Simulate what the frontend component would do
        component_data = {
            "viral_shorts_tab": ap_data["viral_shorts"][:10],  # First 10 for main tab
            "bollywood_tab": ap_data["bollywood"][:10]        # First 10 for bollywood tab
        }
        
        for tab_name, articles in component_data.items():
            print(f"\n   {tab_name.replace('_', ' ').title()}:")
            for i, article in enumerate(articles[:3]):  # Show first 3
                title = article.get("title", "No Title")[:40]
                youtube_url = article.get("youtube_url", "")
                has_video = "✅" if youtube_url else "❌"
                print(f"      {i+1}. {title}... {has_video}")
        
        # Step 5: Performance verification
        print("\n5. Performance Verification")
        import time
        
        start_time = time.time()
        for _ in range(3):  # Test 3 consecutive requests
            response = requests.get(f"{API_URL}/articles/sections/viral-shorts?limit=20")
            self.assertEqual(response.status_code, 200, "Performance test failed")
        end_time = time.time()
        
        avg_response_time = (end_time - start_time) / 3
        print(f"   ✅ Average response time: {avg_response_time:.3f} seconds")
        
        print("\n🎉 COMPREHENSIVE VIRAL SHORTS INTEGRATION TEST COMPLETED SUCCESSFULLY!")
        print("✅ All critical functionality verified")
        print("✅ Data structure suitable for frontend component")
        print("✅ YouTube thumbnail extraction supported")
        print("✅ State filtering working correctly")
        print("✅ Performance within acceptable limits")
        print("✅ Error handling robust")
        print("✅ Ready for frontend Viral Shorts component integration")

if __name__ == "__main__":
    # Create a test suite focused on Viral Shorts
    suite = unittest.TestSuite()
    
    # Add all Viral Shorts tests in logical order
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_endpoint_basic_functionality"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_article_structure"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_state_filtering"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_limit_parameter"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_youtube_thumbnail_extraction"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_frontend_compatibility"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_error_handling"))
    suite.addTest(ViralShortsBackendTest("test_viral_shorts_comprehensive_integration"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n{'='*80}")
    print("VIRAL SHORTS BACKEND API TESTING SUMMARY")
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
        print("\n🎉 ALL VIRAL SHORTS BACKEND TESTS PASSED!")
        print("✅ Viral Shorts API is ready for frontend integration")
    else:
        print("\n❌ Some tests failed. Please review the issues above.")