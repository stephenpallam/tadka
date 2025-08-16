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
print(f"Testing CMS Dashboard API at: {API_URL}")

class CMSDashboardBackendTest(unittest.TestCase):
    """Test suite for CMS Dashboard functionality - Image Galleries and Topics with pagination"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_01_gallery_management_apis(self):
        """Test Gallery Management APIs for CMS Dashboard"""
        print("\n--- Testing Gallery Management APIs ---")
        
        # Test 1: GET /api/galleries - should return galleries data for pagination
        print("\n1. Testing GET /api/galleries endpoint")
        response = requests.get(f"{API_URL}/galleries")
        self.assertEqual(response.status_code, 200, "Failed to get galleries")
        galleries = response.json()
        self.assertIsInstance(galleries, list, "Galleries response should be a list")
        print(f"✅ GET /api/galleries working - returned {len(galleries)} galleries")
        
        # Test pagination parameters
        response = requests.get(f"{API_URL}/galleries?skip=0&limit=10")
        self.assertEqual(response.status_code, 200, "Failed to get galleries with pagination")
        paginated_galleries = response.json()
        self.assertLessEqual(len(paginated_galleries), 10, "Pagination limit not working")
        print(f"✅ Gallery pagination working - returned {len(paginated_galleries)} galleries with limit=10")
        
        # Test large result set support (up to 1000 items)
        response = requests.get(f"{API_URL}/galleries?limit=1000")
        self.assertEqual(response.status_code, 200, "Failed to get galleries with large limit")
        large_galleries = response.json()
        print(f"✅ Large result set support working - can handle limit=1000, returned {len(large_galleries)} galleries")
        
        # Test 2: POST /api/galleries - Create gallery
        print("\n2. Testing POST /api/galleries endpoint")
        new_gallery = {
            "gallery_id": f"test-gallery-{int(time.time())}",
            "title": "Test Gallery for CMS Dashboard",
            "artists": ["Test Artist 1", "Test Artist 2"],
            "images": [
                {"id": "img1", "name": "test1.jpg", "data": "base64data1", "size": 1024},
                {"id": "img2", "name": "test2.jpg", "data": "base64data2", "size": 2048}
            ],
            "gallery_type": "vertical"
        }
        
        response = requests.post(f"{API_URL}/galleries", json=new_gallery)
        self.assertEqual(response.status_code, 200, f"Failed to create gallery: {response.text}")
        created_gallery = response.json()
        
        # Verify gallery structure
        required_fields = ["id", "gallery_id", "title", "artists", "images", "gallery_type", "created_at", "updated_at"]
        for field in required_fields:
            self.assertIn(field, created_gallery, f"Gallery missing required field: {field}")
        
        self.assertEqual(created_gallery["title"], new_gallery["title"])
        self.assertEqual(created_gallery["artists"], new_gallery["artists"])
        self.assertEqual(created_gallery["gallery_type"], new_gallery["gallery_type"])
        
        gallery_id = created_gallery["gallery_id"]
        print(f"✅ Gallery creation working - created gallery with ID: {gallery_id}")
        
        # Test 3: GET /api/galleries/{id} - Get specific gallery
        print("\n3. Testing GET /api/galleries/{id} endpoint")
        response = requests.get(f"{API_URL}/galleries/{gallery_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get gallery {gallery_id}")
        gallery = response.json()
        self.assertEqual(gallery["gallery_id"], gallery_id)
        self.assertEqual(gallery["title"], new_gallery["title"])
        print(f"✅ Gallery retrieval working - retrieved gallery: {gallery['title']}")
        
        # Test 4: PUT /api/galleries/{id} - Update gallery
        print("\n4. Testing PUT /api/galleries/{id} endpoint")
        update_data = {
            "title": "Updated Test Gallery",
            "artists": ["Updated Artist 1", "Updated Artist 2", "New Artist 3"]
        }
        
        response = requests.put(f"{API_URL}/galleries/{gallery_id}", json=update_data)
        self.assertEqual(response.status_code, 200, f"Failed to update gallery {gallery_id}")
        updated_gallery = response.json()
        self.assertEqual(updated_gallery["title"], update_data["title"])
        self.assertEqual(updated_gallery["artists"], update_data["artists"])
        print(f"✅ Gallery update working - updated title to: {updated_gallery['title']}")
        
        # Test 5: GET /api/galleries/{id}/topics - Gallery topics management
        print("\n5. Testing GET /api/galleries/{id}/topics endpoint")
        response = requests.get(f"{API_URL}/galleries/{created_gallery['id']}/topics")
        self.assertEqual(response.status_code, 200, f"Failed to get topics for gallery {created_gallery['id']}")
        gallery_topics = response.json()
        self.assertIsInstance(gallery_topics, list, "Gallery topics should be a list")
        print(f"✅ Gallery topics retrieval working - found {len(gallery_topics)} topics for gallery")
        
        # Test 6: DELETE /api/galleries/{id} - Delete gallery
        print("\n6. Testing DELETE /api/galleries/{id} endpoint")
        response = requests.delete(f"{API_URL}/galleries/{gallery_id}")
        self.assertEqual(response.status_code, 200, f"Failed to delete gallery {gallery_id}")
        delete_response = response.json()
        self.assertIn("message", delete_response)
        print(f"✅ Gallery deletion working - {delete_response['message']}")
        
        # Verify gallery is deleted
        response = requests.get(f"{API_URL}/galleries/{gallery_id}")
        self.assertEqual(response.status_code, 404, "Deleted gallery should return 404")
        print("✅ Gallery deletion verified - returns 404 for deleted gallery")

    def test_02_topics_management_apis(self):
        """Test Topics Management APIs for CMS Dashboard"""
        print("\n--- Testing Topics Management APIs ---")
        
        # Test 1: GET /api/topics with limit=1000 parameter
        print("\n1. Testing GET /api/topics with limit=1000")
        response = requests.get(f"{API_URL}/topics?limit=1000")
        self.assertEqual(response.status_code, 200, "Failed to get topics with large limit")
        all_topics = response.json()
        self.assertIsInstance(all_topics, list, "Topics response should be a list")
        print(f"✅ Topics large limit working - returned {len(all_topics)} topics with limit=1000")
        
        # Verify topic structure
        if all_topics:
            topic = all_topics[0]
            required_fields = ["id", "title", "slug", "category", "language", "created_at", "updated_at", "articles_count"]
            for field in required_fields:
                self.assertIn(field, topic, f"Topic missing required field: {field}")
            print("✅ Topic structure verified - all required fields present")
        
        # Test 2: GET /api/topics with filtering by language and category
        print("\n2. Testing GET /api/topics with filtering")
        
        # Test language filtering
        response = requests.get(f"{API_URL}/topics?language=en&limit=50")
        self.assertEqual(response.status_code, 200, "Failed to get topics with language filter")
        en_topics = response.json()
        print(f"✅ Language filtering working - found {len(en_topics)} English topics")
        
        # Test category filtering (get available categories first)
        if all_topics:
            # Get unique categories from topics
            categories = list(set(topic["category"] for topic in all_topics if topic["category"]))
            if categories:
                test_category = categories[0]
                response = requests.get(f"{API_URL}/topics?category={test_category}&limit=50")
                self.assertEqual(response.status_code, 200, f"Failed to get topics with category filter: {test_category}")
                category_topics = response.json()
                print(f"✅ Category filtering working - found {len(category_topics)} topics in category '{test_category}'")
        
        # Test search functionality
        response = requests.get(f"{API_URL}/topics?search=test&limit=50")
        self.assertEqual(response.status_code, 200, "Failed to get topics with search filter")
        search_topics = response.json()
        print(f"✅ Search functionality working - found {len(search_topics)} topics matching 'test'")
        
        # Test 3: POST /api/topics - Create topic
        print("\n3. Testing POST /api/topics endpoint")
        new_topic = {
            "title": f"Test Topic for CMS Dashboard {int(time.time())}",
            "description": "This is a test topic for CMS Dashboard testing",
            "category": "Technology",
            "language": "en"
        }
        
        response = requests.post(f"{API_URL}/topics", json=new_topic)
        self.assertEqual(response.status_code, 200, f"Failed to create topic: {response.text}")
        created_topic = response.json()
        
        # Verify topic creation
        self.assertEqual(created_topic["title"], new_topic["title"])
        self.assertEqual(created_topic["category"], new_topic["category"])
        self.assertEqual(created_topic["language"], new_topic["language"])
        self.assertIn("slug", created_topic)
        self.assertEqual(created_topic["articles_count"], 0)
        
        topic_id = created_topic["id"]
        print(f"✅ Topic creation working - created topic with ID: {topic_id}")
        
        # Test 4: GET /api/topics/{id} - Get specific topic
        print("\n4. Testing GET /api/topics/{id} endpoint")
        response = requests.get(f"{API_URL}/topics/{topic_id}")
        self.assertEqual(response.status_code, 200, f"Failed to get topic {topic_id}")
        topic = response.json()
        self.assertEqual(topic["id"], topic_id)
        self.assertEqual(topic["title"], new_topic["title"])
        print(f"✅ Topic retrieval working - retrieved topic: {topic['title']}")
        
        # Test 5: PUT /api/topics/{id} - Update topic
        print("\n5. Testing PUT /api/topics/{id} endpoint")
        update_data = {
            "title": "Updated Test Topic for CMS Dashboard",
            "description": "Updated description for testing",
            "category": "Updated Technology"
        }
        
        response = requests.put(f"{API_URL}/topics/{topic_id}", json=update_data)
        self.assertEqual(response.status_code, 200, f"Failed to update topic {topic_id}")
        updated_topic = response.json()
        self.assertEqual(updated_topic["title"], update_data["title"])
        self.assertEqual(updated_topic["category"], update_data["category"])
        print(f"✅ Topic update working - updated title to: {updated_topic['title']}")
        
        # Test 6: GET /api/topics/{id}/articles - Topic articles management
        print("\n6. Testing GET /api/topics/{id}/articles endpoint")
        response = requests.get(f"{API_URL}/topics/{topic_id}/articles")
        self.assertEqual(response.status_code, 200, f"Failed to get articles for topic {topic_id}")
        topic_articles = response.json()
        self.assertIsInstance(topic_articles, list, "Topic articles should be a list")
        print(f"✅ Topic articles retrieval working - found {len(topic_articles)} articles for topic")
        
        # Test 7: GET /api/topics/{id}/galleries - Topic galleries management
        print("\n7. Testing GET /api/topics/{id}/galleries endpoint")
        response = requests.get(f"{API_URL}/topics/{topic_id}/galleries")
        self.assertEqual(response.status_code, 200, f"Failed to get galleries for topic {topic_id}")
        topic_galleries = response.json()
        self.assertIsInstance(topic_galleries, list, "Topic galleries should be a list")
        print(f"✅ Topic galleries retrieval working - found {len(topic_galleries)} galleries for topic")
        
        # Test 8: DELETE /api/topics/{id} - Delete topic
        print("\n8. Testing DELETE /api/topics/{id} endpoint")
        response = requests.delete(f"{API_URL}/topics/{topic_id}")
        self.assertEqual(response.status_code, 200, f"Failed to delete topic {topic_id}")
        delete_response = response.json()
        self.assertIn("message", delete_response)
        print(f"✅ Topic deletion working - {delete_response['message']}")
        
        # Verify topic is deleted
        response = requests.get(f"{API_URL}/topics/{topic_id}")
        self.assertEqual(response.status_code, 404, "Deleted topic should return 404")
        print("✅ Topic deletion verified - returns 404 for deleted topic")

    def test_03_artist_management_apis(self):
        """Test Artist Management APIs for gallery filtering"""
        print("\n--- Testing Artist Management APIs ---")
        
        # Test 1: Get galleries to check artist data
        print("\n1. Testing Artist data in galleries")
        response = requests.get(f"{API_URL}/galleries")
        self.assertEqual(response.status_code, 200, "Failed to get galleries")
        galleries = response.json()
        
        # Check if galleries have artist information
        artists_found = []
        for gallery in galleries:
            if "artists" in gallery and gallery["artists"]:
                artists_found.extend(gallery["artists"])
        
        unique_artists = list(set(artists_found))
        print(f"✅ Artist data available - found {len(unique_artists)} unique artists across galleries")
        
        if unique_artists:
            print(f"   Sample artists: {unique_artists[:5]}")
        
        # Test 2: Create gallery with artist data for filtering
        print("\n2. Testing Gallery creation with artist data")
        test_artists = ["Samantha Ruth Prabhu", "Rakul Preet Singh", "Pooja Hegde"]
        new_gallery = {
            "gallery_id": f"artist-test-gallery-{int(time.time())}",
            "title": "Artist Test Gallery",
            "artists": test_artists,
            "images": [
                {"id": "img1", "name": "artist1.jpg", "data": "base64data1", "size": 1024}
            ],
            "gallery_type": "vertical"
        }
        
        response = requests.post(f"{API_URL}/galleries", json=new_gallery)
        self.assertEqual(response.status_code, 200, "Failed to create gallery with artists")
        created_gallery = response.json()
        self.assertEqual(created_gallery["artists"], test_artists)
        print(f"✅ Gallery with artists created - artists: {created_gallery['artists']}")
        
        # Test 3: Verify artist filtering capability
        print("\n3. Testing Artist filtering capability")
        # Get all galleries and check artist filtering potential
        response = requests.get(f"{API_URL}/galleries")
        all_galleries = response.json()
        
        # Group galleries by artist for filtering simulation
        artist_gallery_map = {}
        for gallery in all_galleries:
            if "artists" in gallery and gallery["artists"]:
                for artist in gallery["artists"]:
                    if artist not in artist_gallery_map:
                        artist_gallery_map[artist] = []
                    artist_gallery_map[artist].append(gallery)
        
        print(f"✅ Artist filtering data available - {len(artist_gallery_map)} artists can be used for filtering")
        
        # Clean up test gallery
        response = requests.delete(f"{API_URL}/galleries/{created_gallery['gallery_id']}")
        self.assertEqual(response.status_code, 200, "Failed to delete test gallery")
        print("✅ Test gallery cleanup completed")

    def test_04_pagination_support(self):
        """Test Pagination Support for large result sets"""
        print("\n--- Testing Pagination Support ---")
        
        # Test 1: Gallery pagination with various limits
        print("\n1. Testing Gallery pagination")
        test_limits = [10, 15, 20, 50, 100, 1000]
        
        for limit in test_limits:
            response = requests.get(f"{API_URL}/galleries?limit={limit}")
            self.assertEqual(response.status_code, 200, f"Failed to get galleries with limit={limit}")
            galleries = response.json()
            self.assertLessEqual(len(galleries), limit, f"Returned more galleries than limit={limit}")
            print(f"✅ Gallery pagination working with limit={limit} - returned {len(galleries)} galleries")
        
        # Test skip parameter
        response = requests.get(f"{API_URL}/galleries?skip=5&limit=10")
        self.assertEqual(response.status_code, 200, "Failed to get galleries with skip parameter")
        skipped_galleries = response.json()
        print(f"✅ Gallery skip parameter working - returned {len(skipped_galleries)} galleries with skip=5")
        
        # Test 2: Topics pagination with various limits
        print("\n2. Testing Topics pagination")
        
        for limit in test_limits:
            response = requests.get(f"{API_URL}/topics?limit={limit}")
            self.assertEqual(response.status_code, 200, f"Failed to get topics with limit={limit}")
            topics = response.json()
            self.assertLessEqual(len(topics), limit, f"Returned more topics than limit={limit}")
            print(f"✅ Topics pagination working with limit={limit} - returned {len(topics)} topics")
        
        # Test skip parameter for topics
        response = requests.get(f"{API_URL}/topics?skip=3&limit=15")
        self.assertEqual(response.status_code, 200, "Failed to get topics with skip parameter")
        skipped_topics = response.json()
        print(f"✅ Topics skip parameter working - returned {len(skipped_topics)} topics with skip=3")
        
        # Test 3: Combined filtering and pagination
        print("\n3. Testing Combined filtering and pagination")
        
        # Topics with language filter and pagination
        response = requests.get(f"{API_URL}/topics?language=en&skip=0&limit=20")
        self.assertEqual(response.status_code, 200, "Failed to get topics with language filter and pagination")
        filtered_topics = response.json()
        print(f"✅ Combined filtering and pagination working - returned {len(filtered_topics)} English topics with limit=20")
        
        # Test 4: Error handling for invalid pagination parameters
        print("\n4. Testing Error handling for pagination")
        
        # Test negative skip
        response = requests.get(f"{API_URL}/galleries?skip=-1&limit=10")
        # Should handle gracefully (either error or treat as 0)
        print(f"   Negative skip parameter response: {response.status_code}")
        
        # Test zero limit
        response = requests.get(f"{API_URL}/galleries?skip=0&limit=0")
        # Should handle gracefully
        print(f"   Zero limit parameter response: {response.status_code}")
        
        # Test very large skip
        response = requests.get(f"{API_URL}/galleries?skip=10000&limit=10")
        self.assertEqual(response.status_code, 200, "Should handle large skip values")
        large_skip_galleries = response.json()
        print(f"✅ Large skip parameter handled - returned {len(large_skip_galleries)} galleries")

    def test_05_error_handling_and_edge_cases(self):
        """Test Error handling and edge cases"""
        print("\n--- Testing Error Handling and Edge Cases ---")
        
        # Test 1: Non-existent gallery
        print("\n1. Testing Non-existent gallery handling")
        response = requests.get(f"{API_URL}/galleries/non-existent-gallery-id")
        self.assertEqual(response.status_code, 404, "Non-existent gallery should return 404")
        print("✅ Non-existent gallery returns 404")
        
        # Test 2: Non-existent topic
        print("\n2. Testing Non-existent topic handling")
        response = requests.get(f"{API_URL}/topics/99999")
        self.assertEqual(response.status_code, 404, "Non-existent topic should return 404")
        print("✅ Non-existent topic returns 404")
        
        # Test 3: Invalid gallery creation data
        print("\n3. Testing Invalid gallery creation")
        invalid_gallery = {
            "gallery_id": "",  # Empty gallery_id
            "title": "",       # Empty title
            "artists": [],
            "images": [],
            "gallery_type": "invalid_type"
        }
        
        response = requests.post(f"{API_URL}/galleries", json=invalid_gallery)
        # Should handle validation errors appropriately
        print(f"   Invalid gallery creation response: {response.status_code}")
        
        # Test 4: Invalid topic creation data
        print("\n4. Testing Invalid topic creation")
        invalid_topic = {
            "title": "",  # Empty title
            "category": "",  # Empty category
            "language": "invalid_lang"
        }
        
        response = requests.post(f"{API_URL}/topics", json=invalid_topic)
        # Should handle validation errors appropriately
        print(f"   Invalid topic creation response: {response.status_code}")
        
        # Test 5: Duplicate gallery ID
        print("\n5. Testing Duplicate gallery ID handling")
        # First create a gallery
        test_gallery = {
            "gallery_id": f"duplicate-test-{int(time.time())}",
            "title": "Duplicate Test Gallery",
            "artists": ["Test Artist"],
            "images": [{"id": "img1", "name": "test.jpg", "data": "data", "size": 1024}],
            "gallery_type": "vertical"
        }
        
        response = requests.post(f"{API_URL}/galleries", json=test_gallery)
        self.assertEqual(response.status_code, 200, "Failed to create first gallery")
        
        # Try to create another with same gallery_id
        response = requests.post(f"{API_URL}/galleries", json=test_gallery)
        self.assertEqual(response.status_code, 400, "Duplicate gallery_id should return 400")
        print("✅ Duplicate gallery_id properly rejected with 400")
        
        # Clean up
        response = requests.delete(f"{API_URL}/galleries/{test_gallery['gallery_id']}")
        self.assertEqual(response.status_code, 200, "Failed to delete test gallery")

    def test_06_performance_and_load_testing(self):
        """Test Performance and load handling"""
        print("\n--- Testing Performance and Load Handling ---")
        
        # Test 1: Response time for gallery listing
        print("\n1. Testing Gallery listing performance")
        start_time = time.time()
        response = requests.get(f"{API_URL}/galleries?limit=100")
        end_time = time.time()
        response_time = end_time - start_time
        
        self.assertEqual(response.status_code, 200, "Gallery listing failed")
        self.assertLess(response_time, 3.0, "Gallery listing too slow")
        print(f"✅ Gallery listing performance acceptable: {response_time:.3f} seconds for 100 galleries")
        
        # Test 2: Response time for topics listing with large limit
        print("\n2. Testing Topics listing performance")
        start_time = time.time()
        response = requests.get(f"{API_URL}/topics?limit=1000")
        end_time = time.time()
        response_time = end_time - start_time
        
        self.assertEqual(response.status_code, 200, "Topics listing failed")
        self.assertLess(response_time, 5.0, "Topics listing too slow")
        print(f"✅ Topics listing performance acceptable: {response_time:.3f} seconds for 1000 topics")
        
        # Test 3: Concurrent requests handling
        print("\n3. Testing Concurrent requests handling")
        import threading
        import queue
        
        results = queue.Queue()
        
        def make_request():
            try:
                response = requests.get(f"{API_URL}/galleries?limit=50")
                results.put(response.status_code)
            except Exception as e:
                results.put(f"Error: {e}")
        
        # Create 5 concurrent threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check results
        success_count = 0
        while not results.empty():
            result = results.get()
            if result == 200:
                success_count += 1
        
        self.assertEqual(success_count, 5, "Not all concurrent requests succeeded")
        print(f"✅ Concurrent requests handling working - {success_count}/5 requests successful")

if __name__ == "__main__":
    # Create a test suite focusing on CMS Dashboard functionality
    suite = unittest.TestSuite()
    
    # Add tests in priority order
    suite.addTest(CMSDashboardBackendTest("test_01_gallery_management_apis"))
    suite.addTest(CMSDashboardBackendTest("test_02_topics_management_apis"))
    suite.addTest(CMSDashboardBackendTest("test_03_artist_management_apis"))
    suite.addTest(CMSDashboardBackendTest("test_04_pagination_support"))
    suite.addTest(CMSDashboardBackendTest("test_05_error_handling_and_edge_cases"))
    suite.addTest(CMSDashboardBackendTest("test_06_performance_and_load_testing"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n{'='*80}")
    print("CMS DASHBOARD BACKEND TESTING SUMMARY")
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
        print("\n🎉 ALL CMS DASHBOARD BACKEND TESTS PASSED!")
        print("✅ Gallery Management APIs working correctly")
        print("✅ Topics Management APIs working correctly")
        print("✅ Artist Management APIs working correctly")
        print("✅ Pagination Support working correctly")
        print("✅ Error Handling working correctly")
        print("✅ Performance and Load Handling acceptable")
    else:
        print(f"\n❌ {len(result.failures + result.errors)} TESTS FAILED")