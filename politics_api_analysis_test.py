#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://indian-cms.preview.emergentagent.com"

def test_politics_api_structure():
    """
    Test Politics API response structure to analyze state-specific filtering capabilities
    """
    print("=" * 80)
    print("POLITICS API RESPONSE STRUCTURE ANALYSIS")
    print("=" * 80)
    
    try:
        # Test main Politics API endpoint
        print("\n1. TESTING POLITICS API ENDPOINT")
        print("-" * 50)
        
        url = f"{BACKEND_URL}/api/articles/sections/politics"
        print(f"Testing: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            print(f"Top-level Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dictionary'}")
            
            # Analyze state_politics array
            if 'state_politics' in data:
                state_articles = data['state_politics']
                print(f"\nSTATE POLITICS ARTICLES: {len(state_articles)} articles found")
                print("-" * 50)
                
                for i, article in enumerate(state_articles):
                    print(f"\n--- STATE POLITICS ARTICLE #{i+1} ---")
                    print(f"ID: {article.get('id')}")
                    print(f"Title: {article.get('title')}")
                    print(f"Category: {article.get('category')}")
                    print(f"Language: {article.get('language')}")
                    print(f"Author: {article.get('author')}")
                    print(f"Published At: {article.get('published_at')}")
                    
                    # Check for state-related fields
                    print(f"\n🔍 CHECKING FOR STATE-RELATED FIELDS:")
                    all_fields = list(article.keys())
                    print(f"All Available Fields: {all_fields}")
                    
                    # Look for potential state fields
                    state_related_fields = []
                    for field in all_fields:
                        if any(keyword in field.lower() for keyword in ['state', 'target', 'location', 'region', 'area']):
                            state_related_fields.append(field)
                            print(f"  ✅ Found potential state field: {field} = {article.get(field)}")
                    
                    if not state_related_fields:
                        print("  ❌ No obvious state-related fields found")
                    
                    # Check if this is the "Singappa USA tour" article
                    if "singappa" in article.get('title', '').lower() or "usa tour" in article.get('title', '').lower():
                        print(f"\n🎯 FOUND POTENTIAL 'SINGAPPA USA TOUR' ARTICLE!")
                        print(f"Full Article Data:")
                        print(json.dumps(article, indent=2, default=str))
                    
                    print("-" * 30)
            
            # Analyze national_politics array
            if 'national_politics' in data:
                national_articles = data['national_politics']
                print(f"\nNATIONAL POLITICS ARTICLES: {len(national_articles)} articles found")
                print("-" * 50)
                
                for i, article in enumerate(national_articles):
                    print(f"\n--- NATIONAL POLITICS ARTICLE #{i+1} ---")
                    print(f"ID: {article.get('id')}")
                    print(f"Title: {article.get('title')}")
                    print(f"Category: {article.get('category')}")
                    
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing Politics API: {str(e)}")

def test_individual_politics_categories():
    """
    Test individual politics category endpoints to understand data structure
    """
    print("\n" + "=" * 80)
    print("INDIVIDUAL POLITICS CATEGORY ANALYSIS")
    print("=" * 80)
    
    categories = ["state-politics", "national-politics"]
    
    for category in categories:
        try:
            print(f"\n2. TESTING CATEGORY: {category}")
            print("-" * 50)
            
            url = f"{BACKEND_URL}/api/articles/category/{category}"
            print(f"Testing: {url}")
            
            response = requests.get(url, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                articles = response.json()
                print(f"Articles Found: {len(articles)}")
                
                for i, article in enumerate(articles):
                    print(f"\n--- {category.upper()} ARTICLE #{i+1} ---")
                    print(f"ID: {article.get('id')}")
                    print(f"Title: {article.get('title')}")
                    print(f"Summary: {article.get('summary', '')[:100]}...")
                    
                    # Check for state information in title or summary
                    title = article.get('title', '').lower()
                    summary = article.get('summary', '').lower()
                    
                    states_mentioned = []
                    state_keywords = ['maharashtra', 'ap', 'andhra pradesh', 'telangana', 'tamil nadu', 'karnataka', 'kerala', 'gujarat']
                    
                    for state in state_keywords:
                        if state in title or state in summary:
                            states_mentioned.append(state)
                    
                    if states_mentioned:
                        print(f"🏛️ States Mentioned: {states_mentioned}")
                    
                    # Check if this might be the problematic article
                    if "singappa" in title or "usa tour" in title:
                        print(f"\n🚨 POTENTIAL PROBLEMATIC ARTICLE FOUND!")
                        print(f"Full Article Details:")
                        print(json.dumps(article, indent=2, default=str))
                    
            else:
                print(f"❌ Failed to fetch {category}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing {category}: {str(e)}")

def search_for_singappa_article():
    """
    Search for the specific "Singappa USA tour" article mentioned in the issue
    """
    print("\n" + "=" * 80)
    print("SEARCHING FOR 'SINGAPPA USA TOUR' ARTICLE")
    print("=" * 80)
    
    try:
        # Search in all articles
        print("\n3. SEARCHING ALL ARTICLES")
        print("-" * 50)
        
        url = f"{BACKEND_URL}/api/articles"
        print(f"Testing: {url}")
        
        response = requests.get(url, params={"limit": 100}, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            articles = response.json()
            print(f"Total Articles: {len(articles)}")
            
            found_articles = []
            for article in articles:
                title = article.get('title', '').lower()
                summary = article.get('summary', '').lower()
                
                # Search for Singappa or USA tour related content
                if any(keyword in title or keyword in summary for keyword in ['singappa', 'usa tour', 'maharashtra']):
                    found_articles.append(article)
                    print(f"\n🔍 FOUND MATCHING ARTICLE:")
                    print(f"ID: {article.get('id')}")
                    print(f"Title: {article.get('title')}")
                    print(f"Category: {article.get('category')}")
                    print(f"Language: {article.get('language')}")
                    print(f"Summary: {article.get('summary', '')[:200]}...")
                    
                    # Check all fields for state information
                    print(f"\n📋 ALL ARTICLE FIELDS:")
                    for key, value in article.items():
                        print(f"  {key}: {value}")
            
            if not found_articles:
                print("❌ No articles found matching 'Singappa', 'USA tour', or 'Maharashtra'")
            else:
                print(f"\n✅ Found {len(found_articles)} potentially matching articles")
                
        else:
            print(f"❌ Failed to fetch articles: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error searching for articles: {str(e)}")

def analyze_state_filtering_capability():
    """
    Analyze what fields are available for state-based filtering
    """
    print("\n" + "=" * 80)
    print("STATE FILTERING CAPABILITY ANALYSIS")
    print("=" * 80)
    
    print("\n4. ANALYSIS SUMMARY")
    print("-" * 50)
    
    print("Based on the API structure analysis:")
    print("1. Available article fields for filtering:")
    print("   - id, title, short_title, summary, image_url")
    print("   - author, language, category, content_type, artists")
    print("   - is_published, is_scheduled, scheduled_publish_at, published_at, view_count")
    
    print("\n2. State-specific filtering options:")
    print("   ❓ Need to check if there are hidden/additional fields")
    print("   ❓ Check if state information is embedded in title/summary")
    print("   ❓ Check if there's a separate state/target_state field")
    
    print("\n3. Recommendations for fixing state filtering:")
    print("   - If no dedicated state field exists, filtering may need to rely on:")
    print("     a) Content analysis of title/summary")
    print("     b) Category-based filtering")
    print("     c) Adding a new state field to the database")

def main():
    """
    Main function to run all Politics API analysis tests
    """
    print("POLITICS API STRUCTURE ANALYSIS FOR STATE FILTERING")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    
    # Run all analysis functions
    test_politics_api_structure()
    test_individual_politics_categories()
    search_for_singappa_article()
    analyze_state_filtering_capability()
    
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()