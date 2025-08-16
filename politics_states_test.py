#!/usr/bin/env python3
"""
Politics API States Field Testing
=================================

This test verifies that the Politics API now includes the 'states' field 
for state-specific filtering after the backend fix.

Focus Areas:
1. Test GET /api/articles/sections/politics includes states field
2. Verify specific articles have correct state assignments
3. Confirm states field format is usable for frontend filtering
"""

import requests
import json
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://indian-cms.preview.emergentagent.com/api"

def test_politics_api_states_field():
    """Test Politics API includes states field for state-specific filtering"""
    print("🔍 TESTING POLITICS API STATES FIELD IMPLEMENTATION")
    print("=" * 60)
    
    try:
        # Test Politics section endpoint
        print("\n1. Testing GET /api/articles/sections/politics")
        response = requests.get(f"{BACKEND_URL}/articles/sections/politics", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Politics API returned status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        data = response.json()
        print(f"✅ SUCCESS: Politics API returned status 200")
        
        # Verify response structure
        if not isinstance(data, dict) or 'state_politics' not in data:
            print(f"❌ FAILED: Invalid response structure. Expected dict with 'state_politics' key")
            print(f"Actual structure: {type(data)}, keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            return False
            
        print(f"✅ SUCCESS: Response has correct structure with keys: {list(data.keys())}")
        
        # Check state_politics articles
        state_articles = data.get('state_politics', [])
        print(f"\n2. Analyzing State Politics Articles ({len(state_articles)} found)")
        
        if not state_articles:
            print("❌ FAILED: No state politics articles found")
            return False
            
        # Look for specific articles and check states field
        singappa_found = False
        jagan_found = False
        states_field_present = True
        
        for i, article in enumerate(state_articles):
            print(f"\n   Article {i+1}: ID {article.get('id')} - {article.get('title', 'No title')}")
            
            # Check if states field is present
            if 'states' not in article:
                print(f"   ❌ MISSING: 'states' field not found in article {article.get('id')}")
                states_field_present = False
            else:
                states_value = article['states']
                print(f"   ✅ STATES FIELD: {states_value} (type: {type(states_value)})")
                
                # Check for specific articles
                title = article.get('title', '').lower()
                if 'singappa' in title and 'usa' in title:
                    singappa_found = True
                    print(f"   🎯 FOUND SINGAPPA ARTICLE: ID {article.get('id')}")
                    print(f"      Title: {article.get('title')}")
                    print(f"      States: {states_value}")
                    
                    # Verify Maharashtra state code
                    if isinstance(states_value, str):
                        try:
                            states_list = json.loads(states_value)
                            if 'mh' in states_list:
                                print(f"      ✅ CORRECT: Contains Maharashtra state code 'mh'")
                            else:
                                print(f"      ❌ INCORRECT: Expected 'mh' for Maharashtra, got {states_list}")
                        except json.JSONDecodeError:
                            print(f"      ❌ ERROR: States field is not valid JSON: {states_value}")
                    elif isinstance(states_value, list):
                        if 'mh' in states_value:
                            print(f"      ✅ CORRECT: Contains Maharashtra state code 'mh'")
                        else:
                            print(f"      ❌ INCORRECT: Expected 'mh' for Maharashtra, got {states_value}")
                
                elif 'jagan' in title and 'usa' in title:
                    jagan_found = True
                    print(f"   🎯 FOUND JAGAN ARTICLE: ID {article.get('id')}")
                    print(f"      Title: {article.get('title')}")
                    print(f"      States: {states_value}")
                    
                    # Verify AP & Telangana state code
                    if isinstance(states_value, str):
                        try:
                            states_list = json.loads(states_value)
                            if 'ap_ts' in states_list:
                                print(f"      ✅ CORRECT: Contains AP & Telangana state code 'ap_ts'")
                            else:
                                print(f"      ❌ INCORRECT: Expected 'ap_ts' for AP & Telangana, got {states_list}")
                        except json.JSONDecodeError:
                            print(f"      ❌ ERROR: States field is not valid JSON: {states_value}")
                    elif isinstance(states_value, list):
                        if 'ap_ts' in states_value:
                            print(f"      ✅ CORRECT: Contains AP & Telangana state code 'ap_ts'")
                        else:
                            print(f"      ❌ INCORRECT: Expected 'ap_ts' for AP & Telangana, got {states_value}")
        
        # Test individual article endpoints for specific IDs
        print(f"\n3. Testing Individual Article Endpoints")
        
        # Test Article 75 (Singappa)
        print(f"\n   Testing Article ID 75 (Expected: Singappa - USA Tour)")
        try:
            article_response = requests.get(f"{BACKEND_URL}/articles/75", timeout=10)
            if article_response.status_code == 200:
                article_data = article_response.json()
                print(f"   ✅ Article 75 found: {article_data.get('title')}")
                if 'states' in article_data:
                    print(f"   ✅ States field present: {article_data['states']}")
                else:
                    print(f"   ❌ States field missing in individual article endpoint")
            else:
                print(f"   ❌ Article 75 not found (status: {article_response.status_code})")
        except Exception as e:
            print(f"   ❌ Error testing Article 75: {e}")
        
        # Test Article 74 (Jagan)
        print(f"\n   Testing Article ID 74 (Expected: Jagan - USA Tour)")
        try:
            article_response = requests.get(f"{BACKEND_URL}/articles/74", timeout=10)
            if article_response.status_code == 200:
                article_data = article_response.json()
                print(f"   ✅ Article 74 found: {article_data.get('title')}")
                if 'states' in article_data:
                    print(f"   ✅ States field present: {article_data['states']}")
                else:
                    print(f"   ❌ States field missing in individual article endpoint")
            else:
                print(f"   ❌ Article 74 not found (status: {article_response.status_code})")
        except Exception as e:
            print(f"   ❌ Error testing Article 74: {e}")
        
        # Summary
        print(f"\n4. SUMMARY OF FINDINGS")
        print(f"   States field present in all articles: {'✅ YES' if states_field_present else '❌ NO'}")
        print(f"   Singappa USA tour article found: {'✅ YES' if singappa_found else '❌ NO'}")
        print(f"   Jagan USA tour article found: {'✅ YES' if jagan_found else '❌ NO'}")
        
        # Overall result
        if states_field_present:
            print(f"\n🎉 SUCCESS: Politics API now includes 'states' field for state-specific filtering!")
            print(f"   Frontend can now filter articles based on user's state preferences.")
            return True
        else:
            print(f"\n❌ FAILED: States field is missing from some articles")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {e}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        return False

def test_state_data_format():
    """Test that state data is properly formatted for frontend use"""
    print(f"\n🔍 TESTING STATE DATA FORMAT")
    print("=" * 40)
    
    try:
        # Get a sample of articles to check state data format
        response = requests.get(f"{BACKEND_URL}/articles/sections/politics", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Could not fetch politics articles")
            return False
            
        data = response.json()
        state_articles = data.get('state_politics', [])
        
        format_issues = []
        valid_formats = 0
        
        for article in state_articles:
            if 'states' in article:
                states_value = article['states']
                article_id = article.get('id', 'Unknown')
                
                # Check if it's a valid JSON string or list
                if isinstance(states_value, str):
                    try:
                        parsed_states = json.loads(states_value)
                        if isinstance(parsed_states, list):
                            valid_formats += 1
                            print(f"   ✅ Article {article_id}: Valid JSON string format - {parsed_states}")
                        else:
                            format_issues.append(f"Article {article_id}: JSON string but not a list - {parsed_states}")
                    except json.JSONDecodeError:
                        format_issues.append(f"Article {article_id}: Invalid JSON string - {states_value}")
                elif isinstance(states_value, list):
                    valid_formats += 1
                    print(f"   ✅ Article {article_id}: Valid list format - {states_value}")
                else:
                    format_issues.append(f"Article {article_id}: Invalid format (not string or list) - {states_value}")
        
        if format_issues:
            print(f"\n❌ FORMAT ISSUES FOUND:")
            for issue in format_issues:
                print(f"   - {issue}")
        
        print(f"\n📊 FORMAT SUMMARY:")
        print(f"   Valid formats: {valid_formats}")
        print(f"   Format issues: {len(format_issues)}")
        
        return len(format_issues) == 0
        
    except Exception as e:
        print(f"❌ ERROR testing state data format: {e}")
        return False

def main():
    """Main test execution"""
    print("🚀 POLITICS STATES FIELD VERIFICATION TEST")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    test1_passed = test_politics_api_states_field()
    test2_passed = test_state_data_format()
    
    # Final summary
    print(f"\n" + "=" * 50)
    print(f"FINAL TEST RESULTS:")
    print(f"Politics API States Field Test: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"State Data Format Test: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print(f"\n🎉 ALL TESTS PASSED!")
        print(f"The Politics API states field fix is working correctly.")
        print(f"Frontend can now implement state-specific filtering for user preferences.")
    else:
        print(f"\n❌ SOME TESTS FAILED!")
        print(f"The states field implementation needs further investigation.")
    
    return test1_passed and test2_passed

if __name__ == "__main__":
    main()