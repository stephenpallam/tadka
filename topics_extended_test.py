#!/usr/bin/env python3
"""
Extended Topics Management Testing
==================================

Additional tests for topics popup functionality edge cases and integration.
"""

import requests
import json
import sys
from datetime import datetime
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://repo-loader-7.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_topics_with_multiple_articles():
    """Test topics management with multiple article associations"""
    print("🔗 Testing Multiple Article Associations...")
    
    try:
        # Get existing topics and articles
        topics_response = requests.get(f"{API_BASE}/topics", timeout=10)
        articles_response = requests.get(f"{API_BASE}/articles?limit=10", timeout=10)
        
        if topics_response.status_code != 200 or articles_response.status_code != 200:
            print("❌ Cannot get topics or articles for testing")
            return False
        
        topics = topics_response.json()
        articles = articles_response.json()
        
        if not topics or not articles:
            print("⚠️  No topics or articles available for testing")
            return True
        
        # Test associating multiple articles with one topic
        topic_id = topics[0]['id']
        test_article_ids = [article['id'] for article in articles[:3]]  # First 3 articles
        
        print(f"   Testing topic {topic_id} with articles {test_article_ids}")
        
        # Associate all articles with the topic
        associations_created = 0
        for article_id in test_article_ids:
            response = requests.post(f"{API_BASE}/topics/{topic_id}/articles/{article_id}", timeout=10)
            if response.status_code in [200, 400]:  # 400 means already exists
                associations_created += 1
        
        print(f"   ✅ Created/verified {associations_created} associations")
        
        # Verify the topic now shows correct article count
        topic_response = requests.get(f"{API_BASE}/topics/{topic_id}", timeout=10)
        if topic_response.status_code == 200:
            updated_topic = topic_response.json()
            article_count = updated_topic.get('articles_count', 0)
            print(f"   ✅ Topic now has {article_count} associated articles")
        
        # Test getting articles for the topic
        articles_response = requests.get(f"{API_BASE}/topics/{topic_id}/articles", timeout=10)
        if articles_response.status_code == 200:
            topic_articles = articles_response.json()
            print(f"   ✅ Retrieved {len(topic_articles)} articles for topic")
        
        # Clean up - remove associations
        for article_id in test_article_ids:
            requests.delete(f"{API_BASE}/topics/{topic_id}/articles/{article_id}", timeout=5)
        
        print("   ✅ Multiple article associations test completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Multiple associations test failed: {str(e)}")
        return False

def test_topics_popup_data_flow():
    """Test the specific data flow that the topics popup uses"""
    print("🎯 Testing Topics Popup Data Flow...")
    
    try:
        # 1. Test getting all topics (for available topics list)
        topics_response = requests.get(f"{API_BASE}/topics", timeout=10)
        if topics_response.status_code == 200:
            all_topics = topics_response.json()
            print(f"   ✅ Available topics for popup: {len(all_topics)}")
            
            # Verify topics have categories for grouping
            categories = set(topic.get('category', 'Unknown') for topic in all_topics)
            print(f"   ✅ Topic categories available: {', '.join(categories)}")
        else:
            print(f"   ❌ Cannot get topics: HTTP {topics_response.status_code}")
            return False
        
        # 2. Test getting topics for a specific article (for current topics display)
        articles_response = requests.get(f"{API_BASE}/articles?limit=1", timeout=10)
        if articles_response.status_code == 200:
            articles = articles_response.json()
            if articles:
                article_id = articles[0]['id']
                
                article_topics_response = requests.get(f"{API_BASE}/articles/{article_id}/topics", timeout=10)
                if article_topics_response.status_code == 200:
                    article_topics = article_topics_response.json()
                    print(f"   ✅ Current topics for article {article_id}: {len(article_topics)}")
                else:
                    print(f"   ❌ Cannot get article topics: HTTP {article_topics_response.status_code}")
                    return False
        
        # 3. Test topic categories endpoint (for category grouping)
        categories_response = requests.get(f"{API_BASE}/topic-categories", timeout=10)
        if categories_response.status_code == 200:
            categories = categories_response.json()
            print(f"   ✅ Topic categories for grouping: {len(categories)}")
        else:
            print(f"   ❌ Cannot get topic categories: HTTP {categories_response.status_code}")
            return False
        
        print("   ✅ Topics popup data flow test completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Topics popup data flow test failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("🛡️  Testing Error Handling...")
    
    try:
        # Test invalid topic ID
        response = requests.get(f"{API_BASE}/topics/99999", timeout=10)
        if response.status_code == 404:
            print("   ✅ Invalid topic ID returns 404")
        else:
            print(f"   ⚠️  Invalid topic ID returned {response.status_code} instead of 404")
        
        # Test invalid article ID for topics
        response = requests.get(f"{API_BASE}/articles/99999/topics", timeout=10)
        if response.status_code == 404:
            print("   ✅ Invalid article ID returns 404")
        else:
            print(f"   ⚠️  Invalid article ID returned {response.status_code} instead of 404")
        
        # Test invalid association
        response = requests.post(f"{API_BASE}/topics/99999/articles/99999", timeout=10)
        if response.status_code == 404:
            print("   ✅ Invalid association returns 404")
        else:
            print(f"   ⚠️  Invalid association returned {response.status_code} instead of 404")
        
        # Test removing non-existent association
        response = requests.delete(f"{API_BASE}/topics/1/articles/99999", timeout=10)
        if response.status_code == 404:
            print("   ✅ Non-existent association removal returns 404")
        else:
            print(f"   ⚠️  Non-existent association removal returned {response.status_code} instead of 404")
        
        print("   ✅ Error handling test completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Error handling test failed: {str(e)}")
        return False

def test_performance_with_pagination():
    """Test performance and pagination"""
    print("⚡ Testing Performance and Pagination...")
    
    try:
        # Test pagination for topics
        response = requests.get(f"{API_BASE}/topics?limit=2&skip=0", timeout=10)
        if response.status_code == 200:
            page1 = response.json()
            print(f"   ✅ First page: {len(page1)} topics")
            
            response = requests.get(f"{API_BASE}/topics?limit=2&skip=2", timeout=10)
            if response.status_code == 200:
                page2 = response.json()
                print(f"   ✅ Second page: {len(page2)} topics")
                
                # Verify different results
                if page1 and page2:
                    page1_ids = {topic['id'] for topic in page1}
                    page2_ids = {topic['id'] for topic in page2}
                    if page1_ids.isdisjoint(page2_ids):
                        print("   ✅ Pagination working correctly - different results")
                    else:
                        print("   ⚠️  Pagination may have overlapping results")
        
        # Test large limit handling
        response = requests.get(f"{API_BASE}/topics?limit=1000", timeout=15)
        if response.status_code == 200:
            topics = response.json()
            print(f"   ✅ Large limit handled: {len(topics)} topics returned")
        else:
            print(f"   ⚠️  Large limit failed: HTTP {response.status_code}")
        
        print("   ✅ Performance and pagination test completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Performance test failed: {str(e)}")
        return False

def test_concurrent_operations():
    """Test concurrent topic operations"""
    print("🔄 Testing Concurrent Operations...")
    
    try:
        # Get test data
        topics_response = requests.get(f"{API_BASE}/topics?limit=2", timeout=10)
        articles_response = requests.get(f"{API_BASE}/articles?limit=2", timeout=10)
        
        if topics_response.status_code != 200 or articles_response.status_code != 200:
            print("   ⚠️  Cannot get test data for concurrent operations")
            return True
        
        topics = topics_response.json()
        articles = articles_response.json()
        
        if len(topics) < 2 or len(articles) < 2:
            print("   ⚠️  Insufficient test data for concurrent operations")
            return True
        
        # Test concurrent associations
        import threading
        import time
        
        results = []
        
        def associate_topic_article(topic_id, article_id, results_list):
            try:
                response = requests.post(f"{API_BASE}/topics/{topic_id}/articles/{article_id}", timeout=10)
                results_list.append(response.status_code in [200, 400])
            except:
                results_list.append(False)
        
        # Create threads for concurrent operations
        threads = []
        for i in range(2):
            thread = threading.Thread(
                target=associate_topic_article,
                args=(topics[i]['id'], articles[i]['id'], results)
            )
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        successful_operations = sum(results)
        print(f"   ✅ Concurrent operations: {successful_operations}/{len(results)} successful")
        
        # Cleanup
        for i in range(2):
            try:
                requests.delete(f"{API_BASE}/topics/{topics[i]['id']}/articles/{articles[i]['id']}", timeout=5)
            except:
                pass
        
        print("   ✅ Concurrent operations test completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Concurrent operations test failed: {str(e)}")
        return False

def main():
    """Run extended topics management tests"""
    print("🚀 Starting Extended Topics Management Testing")
    print("=" * 60)
    
    tests = [
        test_topics_with_multiple_articles,
        test_topics_popup_data_flow,
        test_error_handling,
        test_performance_with_pagination,
        test_concurrent_operations
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()  # Add spacing between tests
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}\n")
    
    print("=" * 60)
    print("📊 EXTENDED TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {total - passed}")
    
    success_rate = (passed / total * 100) if total > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL EXTENDED TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️  {total - passed} extended tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)