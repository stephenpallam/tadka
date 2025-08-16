#!/usr/bin/env python3
"""
Topics Management Backend API Testing
=====================================

This script tests the topics popup functionality implementation in Dashboard.jsx
by testing all the backend API endpoints that support topics management.

Test Coverage:
1. Topics Management API Endpoints
2. Article-Topic Association Flow  
3. Data Integrity
4. Backend Status
"""

import requests
import json
import sys
from datetime import datetime
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://indian-cms.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class TopicsAPITester:
    def __init__(self):
        self.test_results = []
        self.test_data = {
            'created_topics': [],
            'created_articles': [],
            'test_associations': []
        }
        
    def log_test(self, test_name, status, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        
        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_symbol} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test if backend is running and accessible"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health Check", "PASS", 
                            f"Backend is running: {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("Backend Health Check", "FAIL", 
                            f"Backend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", "FAIL", 
                        f"Cannot connect to backend: {str(e)}")
            return False
    
    def test_get_topics_endpoint(self):
        """Test GET /api/topics endpoint"""
        try:
            response = requests.get(f"{API_BASE}/topics", timeout=10)
            
            if response.status_code == 200:
                topics = response.json()
                
                # Verify response structure
                if isinstance(topics, list):
                    self.log_test("GET /api/topics", "PASS", 
                                f"Retrieved {len(topics)} topics successfully")
                    
                    # Test topic structure if topics exist
                    if topics:
                        topic = topics[0]
                        required_fields = ['id', 'title', 'slug', 'category', 'language', 
                                         'created_at', 'updated_at', 'articles_count']
                        missing_fields = [field for field in required_fields if field not in topic]
                        
                        if not missing_fields:
                            self.log_test("Topic Data Structure", "PASS", 
                                        "All required fields present in topic response")
                        else:
                            self.log_test("Topic Data Structure", "FAIL", 
                                        f"Missing fields: {missing_fields}")
                    
                    return topics
                else:
                    self.log_test("GET /api/topics", "FAIL", 
                                "Response is not a list")
                    return []
            else:
                self.log_test("GET /api/topics", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            self.log_test("GET /api/topics", "FAIL", f"Request failed: {str(e)}")
            return []
    
    def test_get_topic_categories(self):
        """Test GET /api/topic-categories endpoint"""
        try:
            response = requests.get(f"{API_BASE}/topic-categories", timeout=10)
            
            if response.status_code == 200:
                categories = response.json()
                
                if isinstance(categories, list):
                    self.log_test("GET /api/topic-categories", "PASS", 
                                f"Retrieved {len(categories)} topic categories")
                    
                    # Test category structure if categories exist
                    if categories:
                        category = categories[0]
                        required_fields = ['id', 'name', 'slug', 'created_at']
                        missing_fields = [field for field in required_fields if field not in category]
                        
                        if not missing_fields:
                            self.log_test("Topic Category Structure", "PASS", 
                                        "All required fields present in category response")
                        else:
                            self.log_test("Topic Category Structure", "FAIL", 
                                        f"Missing fields: {missing_fields}")
                    
                    return categories
                else:
                    self.log_test("GET /api/topic-categories", "FAIL", 
                                "Response is not a list")
                    return []
            else:
                self.log_test("GET /api/topic-categories", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            self.log_test("GET /api/topic-categories", "FAIL", f"Request failed: {str(e)}")
            return []
    
    def test_create_topic(self):
        """Test POST /api/topics endpoint"""
        try:
            # Create test topic
            topic_data = {
                "title": f"Test Topic {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "description": "Test topic for API testing",
                "category": "Movies",
                "language": "en"
            }
            
            response = requests.post(f"{API_BASE}/topics", 
                                   json=topic_data, timeout=10)
            
            if response.status_code == 200:
                created_topic = response.json()
                
                # Verify created topic structure
                required_fields = ['id', 'title', 'slug', 'category', 'language']
                missing_fields = [field for field in required_fields if field not in created_topic]
                
                if not missing_fields:
                    self.test_data['created_topics'].append(created_topic)
                    self.log_test("POST /api/topics", "PASS", 
                                f"Topic created successfully with ID {created_topic['id']}")
                    return created_topic
                else:
                    self.log_test("POST /api/topics", "FAIL", 
                                f"Created topic missing fields: {missing_fields}")
                    return None
            else:
                self.log_test("POST /api/topics", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("POST /api/topics", "FAIL", f"Request failed: {str(e)}")
            return None
    
    def test_get_articles_endpoint(self):
        """Test GET /api/articles endpoint to get test articles"""
        try:
            response = requests.get(f"{API_BASE}/articles?limit=5", timeout=10)
            
            if response.status_code == 200:
                articles = response.json()
                
                if isinstance(articles, list) and articles:
                    self.log_test("GET /api/articles", "PASS", 
                                f"Retrieved {len(articles)} articles for testing")
                    return articles
                else:
                    self.log_test("GET /api/articles", "WARN", 
                                "No articles found for testing associations")
                    return []
            else:
                self.log_test("GET /api/articles", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            self.log_test("GET /api/articles", "FAIL", f"Request failed: {str(e)}")
            return []
    
    def test_get_article_topics(self, article_id):
        """Test GET /api/articles/{id}/topics endpoint"""
        try:
            response = requests.get(f"{API_BASE}/articles/{article_id}/topics", timeout=10)
            
            if response.status_code == 200:
                topics = response.json()
                
                if isinstance(topics, list):
                    self.log_test(f"GET /api/articles/{article_id}/topics", "PASS", 
                                f"Retrieved {len(topics)} topics for article {article_id}")
                    return topics
                else:
                    self.log_test(f"GET /api/articles/{article_id}/topics", "FAIL", 
                                "Response is not a list")
                    return []
            else:
                self.log_test(f"GET /api/articles/{article_id}/topics", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            self.log_test(f"GET /api/articles/{article_id}/topics", "FAIL", 
                        f"Request failed: {str(e)}")
            return []
    
    def test_associate_article_with_topic(self, topic_id, article_id):
        """Test POST /api/topics/{topicId}/articles/{articleId} endpoint"""
        try:
            response = requests.post(f"{API_BASE}/topics/{topic_id}/articles/{article_id}", 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                self.test_data['test_associations'].append({
                    'topic_id': topic_id,
                    'article_id': article_id
                })
                self.log_test(f"POST /api/topics/{topic_id}/articles/{article_id}", "PASS", 
                            f"Article {article_id} associated with topic {topic_id}")
                return True
            elif response.status_code == 400:
                # Association already exists - this is acceptable
                self.log_test(f"POST /api/topics/{topic_id}/articles/{article_id}", "PASS", 
                            "Association already exists (acceptable)")
                return True
            else:
                self.log_test(f"POST /api/topics/{topic_id}/articles/{article_id}", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test(f"POST /api/topics/{topic_id}/articles/{article_id}", "FAIL", 
                        f"Request failed: {str(e)}")
            return False
    
    def test_remove_article_from_topic(self, topic_id, article_id):
        """Test DELETE /api/topics/{topicId}/articles/{articleId} endpoint"""
        try:
            response = requests.delete(f"{API_BASE}/topics/{topic_id}/articles/{article_id}", 
                                     timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                self.log_test(f"DELETE /api/topics/{topic_id}/articles/{article_id}", "PASS", 
                            f"Article {article_id} removed from topic {topic_id}")
                return True
            elif response.status_code == 404:
                self.log_test(f"DELETE /api/topics/{topic_id}/articles/{article_id}", "PASS", 
                            "Association not found (acceptable for cleanup)")
                return True
            else:
                self.log_test(f"DELETE /api/topics/{topic_id}/articles/{article_id}", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test(f"DELETE /api/topics/{topic_id}/articles/{article_id}", "FAIL", 
                        f"Request failed: {str(e)}")
            return False
    
    def test_topic_filtering(self):
        """Test topic filtering functionality"""
        try:
            # Test category filtering
            response = requests.get(f"{API_BASE}/topics?category=Movies", timeout=10)
            
            if response.status_code == 200:
                topics = response.json()
                
                # Verify all topics have Movies category
                if all(topic.get('category') == 'Movies' for topic in topics):
                    self.log_test("Topic Category Filtering", "PASS", 
                                f"Category filtering working - {len(topics)} Movies topics")
                else:
                    self.log_test("Topic Category Filtering", "FAIL", 
                                "Some topics don't match Movies category filter")
            else:
                self.log_test("Topic Category Filtering", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
            
            # Test language filtering
            response = requests.get(f"{API_BASE}/topics?language=en", timeout=10)
            
            if response.status_code == 200:
                topics = response.json()
                
                # Verify all topics have English language
                if all(topic.get('language') == 'en' for topic in topics):
                    self.log_test("Topic Language Filtering", "PASS", 
                                f"Language filtering working - {len(topics)} English topics")
                else:
                    self.log_test("Topic Language Filtering", "FAIL", 
                                "Some topics don't match English language filter")
            else:
                self.log_test("Topic Language Filtering", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Topic Filtering", "FAIL", f"Request failed: {str(e)}")
    
    def test_data_integrity(self):
        """Test data integrity - article counts, proper associations"""
        try:
            # Get all topics and verify article counts
            topics = self.test_get_topics_endpoint()
            
            if topics:
                for topic in topics[:3]:  # Test first 3 topics
                    topic_id = topic['id']
                    reported_count = topic.get('articles_count', 0)
                    
                    # Get actual articles for this topic
                    response = requests.get(f"{API_BASE}/topics/{topic_id}/articles", timeout=10)
                    
                    if response.status_code == 200:
                        actual_articles = response.json()
                        actual_count = len(actual_articles)
                        
                        if reported_count == actual_count:
                            self.log_test(f"Article Count Integrity (Topic {topic_id})", "PASS", 
                                        f"Reported count ({reported_count}) matches actual ({actual_count})")
                        else:
                            self.log_test(f"Article Count Integrity (Topic {topic_id})", "FAIL", 
                                        f"Count mismatch: reported {reported_count}, actual {actual_count}")
                    else:
                        self.log_test(f"Article Count Integrity (Topic {topic_id})", "FAIL", 
                                    f"Cannot get articles: HTTP {response.status_code}")
                        
        except Exception as e:
            self.log_test("Data Integrity", "FAIL", f"Test failed: {str(e)}")
    
    def test_search_functionality(self):
        """Test topic search functionality"""
        try:
            # Test search with a common term
            response = requests.get(f"{API_BASE}/topics?search=movie", timeout=10)
            
            if response.status_code == 200:
                topics = response.json()
                
                # Verify search results contain the search term
                search_matches = [topic for topic in topics 
                                if 'movie' in topic.get('title', '').lower() or 
                                   'movie' in topic.get('description', '').lower()]
                
                if len(search_matches) == len(topics):
                    self.log_test("Topic Search", "PASS", 
                                f"Search functionality working - {len(topics)} results for 'movie'")
                else:
                    self.log_test("Topic Search", "WARN", 
                                f"Some results don't match search term: {len(search_matches)}/{len(topics)}")
            else:
                self.log_test("Topic Search", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Topic Search", "FAIL", f"Request failed: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("\n🧹 Cleaning up test data...")
        
        # Remove test associations
        for assoc in self.test_data['test_associations']:
            try:
                requests.delete(f"{API_BASE}/topics/{assoc['topic_id']}/articles/{assoc['article_id']}", 
                              timeout=5)
            except:
                pass
        
        # Delete test topics
        for topic in self.test_data['created_topics']:
            try:
                requests.delete(f"{API_BASE}/topics/{topic['id']}", timeout=5)
                print(f"   Deleted test topic: {topic['title']}")
            except:
                pass
    
    def run_comprehensive_test(self):
        """Run all topic management tests"""
        print("🚀 Starting Topics Management Backend API Testing")
        print("=" * 60)
        
        # 1. Backend Health Check
        if not self.test_backend_health():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        print("\n📋 Testing Topics Management API Endpoints...")
        
        # 2. Test basic topic endpoints
        topics = self.test_get_topics_endpoint()
        categories = self.test_get_topic_categories()
        
        # 3. Test topic creation
        created_topic = self.test_create_topic()
        
        # 4. Test article endpoints
        articles = self.test_get_articles_endpoint()
        
        # 5. Test article-topic associations if we have both
        if created_topic and articles:
            print("\n🔗 Testing Article-Topic Association Flow...")
            
            article_id = articles[0]['id']
            topic_id = created_topic['id']
            
            # Test getting article topics (before association)
            initial_topics = self.test_get_article_topics(article_id)
            
            # Test association creation
            if self.test_associate_article_with_topic(topic_id, article_id):
                # Test getting article topics (after association)
                updated_topics = self.test_get_article_topics(article_id)
                
                if len(updated_topics) > len(initial_topics):
                    self.log_test("Association Verification", "PASS", 
                                "Article topics increased after association")
                
                # Test association removal
                self.test_remove_article_from_topic(topic_id, article_id)
                
                # Verify removal
                final_topics = self.test_get_article_topics(article_id)
                if len(final_topics) == len(initial_topics):
                    self.log_test("Removal Verification", "PASS", 
                                "Article topics returned to original count after removal")
        
        print("\n🔍 Testing Advanced Features...")
        
        # 6. Test filtering and search
        self.test_topic_filtering()
        self.test_search_functionality()
        
        # 7. Test data integrity
        self.test_data_integrity()
        
        # 8. Cleanup
        self.cleanup_test_data()
        
        return True
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        warning_tests = len([r for r in self.test_results if r['status'] == 'WARN'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️  Warnings: {warning_tests}")
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"   • {result['test']}: {result['message']}")
        
        if warning_tests > 0:
            print("\n⚠️  WARNINGS:")
            for result in self.test_results:
                if result['status'] == 'WARN':
                    print(f"   • {result['test']}: {result['message']}")
        
        print("\n🎯 KEY FINDINGS:")
        
        # Analyze critical endpoints
        critical_endpoints = [
            'GET /api/topics',
            'GET /api/articles/{id}/topics', 
            'POST /api/topics/{topicId}/articles/{articleId}',
            'DELETE /api/topics/{topicId}/articles/{articleId}'
        ]
        
        critical_results = [r for r in self.test_results 
                          if any(endpoint in r['test'] for endpoint in critical_endpoints)]
        
        critical_passed = len([r for r in critical_results if r['status'] == 'PASS'])
        critical_total = len(critical_results)
        
        if critical_total > 0:
            critical_rate = (critical_passed / critical_total * 100)
            print(f"   • Critical API Endpoints: {critical_passed}/{critical_total} working ({critical_rate:.1f}%)")
        
        # Check for data integrity
        integrity_tests = [r for r in self.test_results if 'Integrity' in r['test']]
        if integrity_tests:
            integrity_passed = len([r for r in integrity_tests if r['status'] == 'PASS'])
            print(f"   • Data Integrity: {integrity_passed}/{len(integrity_tests)} checks passed")
        
        # Overall assessment
        if failed_tests == 0:
            print(f"\n🎉 ALL TESTS PASSED! Topics management API is fully functional.")
        elif failed_tests <= 2:
            print(f"\n✅ MOSTLY WORKING: {failed_tests} minor issues found.")
        else:
            print(f"\n⚠️  ISSUES DETECTED: {failed_tests} tests failed. Review required.")
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'warnings': warning_tests,
            'success_rate': success_rate,
            'critical_endpoints_working': critical_passed == critical_total if critical_total > 0 else False
        }

def main():
    """Main test execution"""
    tester = TopicsAPITester()
    
    try:
        # Run comprehensive tests
        success = tester.run_comprehensive_test()
        
        # Generate summary
        summary = tester.generate_summary()
        
        # Exit with appropriate code
        if summary['failed'] == 0:
            sys.exit(0)  # All tests passed
        elif summary['failed'] <= 2:
            sys.exit(1)  # Minor issues
        else:
            sys.exit(2)  # Major issues
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Testing interrupted by user")
        tester.cleanup_test_data()
        sys.exit(3)
    except Exception as e:
        print(f"\n\n💥 Testing failed with error: {str(e)}")
        tester.cleanup_test_data()
        sys.exit(4)

if __name__ == "__main__":
    main()