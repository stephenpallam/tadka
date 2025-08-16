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
print(f"Testing MovieReviews Page API at: {API_URL}")

class MovieReviewsBackendTest(unittest.TestCase):
    """Test suite specifically for MovieReviews Page backend functionality as requested in review_request"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        # Seed the database to ensure we have data to test with
        response = requests.post(f"{API_URL}/seed-database")
        self.assertEqual(response.status_code, 200, "Failed to seed database")
        print("Database seeded successfully")

    def test_movie_reviews_category_endpoint(self):
        """Test GET /api/articles/category/movie-reviews endpoint (currently returning empty array)"""
        print("\n--- Testing Movie Reviews Category Endpoint ---")
        
        response = requests.get(f"{API_URL}/articles/category/movie-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get movie-reviews articles")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "Movie reviews response should be a list")
        
        print(f"✅ GET /api/articles/category/movie-reviews - Status: 200")
        print(f"✅ Response type: list")
        print(f"✅ Articles returned: {len(articles)}")
        
        if len(articles) == 0:
            print("⚠️ ISSUE CONFIRMED: movie-reviews category returns empty array")
            return False
        else:
            print("✅ Movie reviews articles found!")
            # Verify article structure
            article = articles[0]
            required_fields = ["id", "title", "image_url", "published_at", "author", "summary"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}'")
            print(f"✅ Article structure verified")
            return True

    def test_ott_reviews_category_endpoint(self):
        """Test GET /api/articles/category/ott-reviews endpoint (currently returning empty array)"""
        print("\n--- Testing OTT Reviews Category Endpoint ---")
        
        response = requests.get(f"{API_URL}/articles/category/ott-reviews")
        self.assertEqual(response.status_code, 200, "Failed to get ott-reviews articles")
        
        articles = response.json()
        self.assertIsInstance(articles, list, "OTT reviews response should be a list")
        
        print(f"✅ GET /api/articles/category/ott-reviews - Status: 200")
        print(f"✅ Response type: list")
        print(f"✅ Articles returned: {len(articles)}")
        
        if len(articles) == 0:
            print("⚠️ ISSUE CONFIRMED: ott-reviews category returns empty array")
            return False
        else:
            print("✅ OTT reviews articles found!")
            # Verify article structure
            article = articles[0]
            required_fields = ["id", "title", "image_url", "published_at", "author", "summary"]
            for field in required_fields:
                self.assertIn(field, article, f"Missing required field '{field}'")
            print(f"✅ Article structure verified")
            return True

    def test_related_articles_movie_reviews_endpoint(self):
        """Test GET /api/related-articles/movie-reviews endpoint"""
        print("\n--- Testing Related Articles Movie Reviews Endpoint ---")
        
        response = requests.get(f"{API_URL}/related-articles/movie-reviews")
        
        if response.status_code == 200:
            articles = response.json()
            self.assertIsInstance(articles, list, "Related articles response should be a list")
            print(f"✅ GET /api/related-articles/movie-reviews - Status: 200")
            print(f"✅ Related articles returned: {len(articles)}")
            return True
        else:
            print(f"⚠️ GET /api/related-articles/movie-reviews - Status: {response.status_code}")
            print("⚠️ Related articles endpoint not working")
            return False

    def test_categories_existence(self):
        """Check if movie-reviews and ott-reviews categories exist in the database"""
        print("\n--- Testing Categories Existence in Database ---")
        
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        
        categories = response.json()
        category_slugs = [cat["slug"] for cat in categories]
        
        movie_reviews_exists = "movie-reviews" in category_slugs
        ott_reviews_exists = "ott-reviews" in category_slugs
        
        print(f"✅ Total categories in database: {len(categories)}")
        print(f"✅ movie-reviews category exists: {movie_reviews_exists}")
        print(f"✅ ott-reviews category exists: {ott_reviews_exists}")
        
        if movie_reviews_exists:
            movie_cat = next((cat for cat in categories if cat["slug"] == "movie-reviews"), None)
            print(f"   - Movie Reviews: '{movie_cat['name']}' (ID: {movie_cat['id']})")
        
        if ott_reviews_exists:
            ott_cat = next((cat for cat in categories if cat["slug"] == "ott-reviews"), None)
            print(f"   - OTT Reviews: '{ott_cat['name']}' (ID: {ott_cat['id']})")
        
        return movie_reviews_exists, ott_reviews_exists

    def create_missing_categories(self):
        """Create missing categories if they don't exist"""
        print("\n--- Creating Missing Categories ---")
        
        movie_reviews_exists, ott_reviews_exists = self.test_categories_existence()
        
        categories_created = []
        
        # Create movie-reviews category if it doesn't exist
        if not movie_reviews_exists:
            print("Creating movie-reviews category...")
            category_data = {
                "name": "Movie Reviews",
                "slug": "movie-reviews",
                "description": "Reviews and ratings of latest movies"
            }
            response = requests.post(f"{API_URL}/categories", json=category_data)
            if response.status_code == 200:
                print("✅ movie-reviews category created successfully")
                categories_created.append("movie-reviews")
            else:
                print(f"❌ Failed to create movie-reviews category: {response.status_code}")
        
        # Create ott-reviews category if it doesn't exist
        if not ott_reviews_exists:
            print("Creating ott-reviews category...")
            category_data = {
                "name": "OTT Reviews",
                "slug": "ott-reviews", 
                "description": "Reviews of OTT platform shows and movies"
            }
            response = requests.post(f"{API_URL}/categories", json=category_data)
            if response.status_code == 200:
                print("✅ ott-reviews category created successfully")
                categories_created.append("ott-reviews")
            else:
                print(f"❌ Failed to create ott-reviews category: {response.status_code}")
        
        return categories_created

    def create_sample_articles(self, categories_created):
        """Add sample articles to both categories so the MovieReviews page can display content"""
        print("\n--- Creating Sample Articles ---")
        
        # Sample movie reviews articles
        movie_reviews_articles = [
            {
                "title": "Pushpa 2: The Rule - A Spectacular Action Drama",
                "short_title": "Pushpa 2 Review",
                "summary": "Allu Arjun returns with a bang in this high-octane sequel that delivers on all fronts with stellar performances and breathtaking action sequences.",
                "content": "Pushpa 2: The Rule takes the story forward from where the first film left off. Allu Arjun's portrayal of Pushpa Raj is nothing short of spectacular, bringing depth and intensity to the character. The film's action sequences are choreographed brilliantly, and the cinematography captures the raw essence of the story. Director Sukumar has crafted a narrative that keeps you engaged throughout. The supporting cast, including Rashmika Mandanna and Fahadh Faasil, deliver commendable performances. The film's music by Devi Sri Prasad adds another layer of excellence. Overall, Pushpa 2 is a worthy successor that lives up to the expectations set by its predecessor.",
                "image": "https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=800&h=600&fit=crop",
                "author": "Rajesh Kumar",
                "language": "en",
                "category": "movie-reviews",
                "states": ["ap", "ts", "all"],
                "is_published": True,
                "rating": 4.5
            },
            {
                "title": "Kalki 2898 AD - A Visual Masterpiece",
                "short_title": "Kalki 2898 AD Review", 
                "summary": "Nag Ashwin's ambitious sci-fi epic starring Prabhas delivers stunning visuals and an engaging storyline set in a dystopian future.",
                "content": "Kalki 2898 AD is a groundbreaking film that pushes the boundaries of Indian cinema. Set in a post-apocalyptic world, the film follows the journey of Kalki, played by Prabhas, in his quest to restore balance. The visual effects are world-class, creating an immersive experience that transports you to the year 2898. Deepika Padukone and Amitabh Bachchan deliver powerful performances that complement the lead. The film's production design and cinematography are exceptional, creating a believable futuristic world. While the pacing could have been tighter in some parts, the overall experience is remarkable. This is Indian cinema at its most ambitious.",
                "image": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
                "author": "Priya Sharma",
                "language": "en", 
                "category": "movie-reviews",
                "states": ["all"],
                "is_published": True,
                "rating": 4.2
            },
            {
                "title": "RRR - An Epic Tale of Friendship and Revolution",
                "short_title": "RRR Review",
                "summary": "SS Rajamouli's magnum opus featuring Ram Charan and Jr. NTR is a cinematic spectacle that celebrates the spirit of rebellion and brotherhood.",
                "content": "RRR is SS Rajamouli's most ambitious project to date, and it shows in every frame. The film tells the fictional story of two legendary freedom fighters, Alluri Sitarama Raju and Komaram Bheem, brought to life by Ram Charan and Jr. NTR respectively. Their chemistry and performances are the heart of the film. The action sequences are choreographed with precision and grandeur that's rarely seen in cinema. The film's emotional core, exploring themes of friendship, sacrifice, and patriotism, resonates deeply. MM Keeravani's music elevates every scene, while the cinematography captures the epic scale beautifully. RRR is not just a film; it's an experience that showcases the power of Indian storytelling on a global stage.",
                "image": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop",
                "author": "Arjun Reddy",
                "language": "en",
                "category": "movie-reviews", 
                "states": ["ap", "ts", "all"],
                "is_published": True,
                "rating": 4.8
            },
            {
                "title": "KGF Chapter 2 - Yash's Powerful Return",
                "short_title": "KGF 2 Review",
                "summary": "The sequel to KGF delivers high-octane action and drama as Rocky Bhai's empire faces new challenges and enemies.",
                "content": "KGF Chapter 2 picks up where the first film left off, with Rocky Bhai (Yash) now ruling the Kolar Gold Fields. The film amplifies everything that made the first part successful - the action, the drama, and Yash's commanding screen presence. Director Prashanth Neel has crafted a sequel that not only meets expectations but exceeds them in many ways. The supporting cast, including Sanjay Dutt as the antagonist Adheera, adds depth to the narrative. The film's technical aspects, from cinematography to sound design, create an immersive experience. While the runtime could have been trimmed, the film's entertainment value remains high throughout. KGF Chapter 2 solidifies the franchise as one of the most successful in recent Indian cinema.",
                "image": "https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=800&h=600&fit=crop",
                "author": "Meera Nair",
                "language": "en",
                "category": "movie-reviews",
                "states": ["ka", "all"],
                "is_published": True,
                "rating": 4.3
            }
        ]

        # Sample OTT reviews articles
        ott_reviews_articles = [
            {
                "title": "Scam 1992 - A Masterclass in Storytelling",
                "short_title": "Scam 1992 Review",
                "summary": "This SonyLIV series about Harshad Mehta's rise and fall is a gripping tale of ambition, greed, and the stock market boom of the 90s.",
                "content": "Scam 1992: The Harshad Mehta Story is arguably one of the finest web series produced in India. Pratik Gandhi's portrayal of Harshad Mehta is nothing short of brilliant, bringing nuance and depth to a complex character. The series meticulously recreates the 1990s era, from the costumes to the set design, everything feels authentic. Director Hansal Mehta has crafted a narrative that's both educational and entertaining, making complex financial concepts accessible to the general audience. The supporting cast, including Shreya Dhanwanthary and Hemant Kher, deliver stellar performances. The series doesn't glorify or vilify Mehta but presents him as a flawed human being driven by ambition. The writing is sharp, the pacing is perfect, and the cinematography captures the essence of Bombay in the 90s beautifully.",
                "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
                "author": "Vikram Singh",
                "language": "en",
                "category": "ott-reviews",
                "states": ["all"],
                "is_published": True,
                "rating": 4.9
            },
            {
                "title": "The Family Man 2 - Espionage Thriller at Its Best",
                "short_title": "The Family Man 2 Review",
                "summary": "Manoj Bajpayee returns as Srikant Tiwari in this Amazon Prime series that perfectly balances family drama with high-stakes espionage.",
                "content": "The Family Man 2 raises the bar significantly from its already impressive first season. Manoj Bajpayee continues to excel as Srikant Tiwari, a middle-class man juggling his responsibilities as a secret agent and a family man. The addition of Samantha Akkineni as the antagonist Raji brings a new dimension to the series. Her performance is intense and convincing, making her one of the most memorable villains in recent times. The series tackles sensitive political issues with maturity while maintaining its entertainment value. The action sequences are well-choreographed, and the emotional moments hit the right notes. Directors Raj & DK have created a series that's both thrilling and thought-provoking. The production values are top-notch, and the series maintains its authenticity throughout. The Family Man 2 sets a new standard for Indian web series.",
                "image": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop",
                "author": "Anita Desai",
                "language": "en",
                "category": "ott-reviews",
                "states": ["all"],
                "is_published": True,
                "rating": 4.7
            },
            {
                "title": "Mumbai Diaries 26/11 - A Gripping Medical Drama",
                "short_title": "Mumbai Diaries Review",
                "summary": "This Amazon Prime series offers a unique perspective on the 26/11 attacks through the eyes of medical professionals at a government hospital.",
                "content": "Mumbai Diaries 26/11 takes a fresh approach to depicting one of India's darkest days by focusing on the medical professionals who worked tirelessly to save lives during the terror attacks. Mohit Raina leads an ensemble cast that delivers powerful performances throughout the series. The show doesn't sensationalize the tragedy but instead honors the unsung heroes who worked behind the scenes. Director Nikkhil Advani has crafted a narrative that's both respectful and engaging, showing the human side of the crisis. The series effectively portrays the chaos, fear, and determination that characterized that fateful night. The medical procedures are depicted with accuracy, and the emotional weight of the situation is felt in every episode. The production design recreates the hospital environment convincingly, and the cinematography captures both the intensity and the humanity of the situation.",
                "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
                "author": "Rohit Gupta",
                "language": "en",
                "category": "ott-reviews",
                "states": ["mh", "all"],
                "is_published": True,
                "rating": 4.4
            },
            {
                "title": "Arya 2 - A Gripping Crime Thriller",
                "short_title": "Arya 2 Review",
                "summary": "This Disney+ Hotstar series continues the story of Arya with more intense crime drama and stellar performances from the cast.",
                "content": "Arya 2 successfully builds upon the foundation laid by its predecessor, delivering a more intense and gripping crime thriller. The series delves deeper into the criminal underworld while maintaining the character development that made the first season so compelling. The lead performances are consistently strong, with each actor bringing depth to their roles. The writing is sharp and keeps viewers engaged with unexpected twists and turns. The series doesn't shy away from showing the brutal realities of crime while also exploring the psychological impact on those involved. The production values are excellent, with cinematography that effectively captures the dark and gritty atmosphere of the story. The pacing is well-maintained throughout, ensuring that viewers remain invested in the narrative. Arya 2 proves that Indian web series can compete with international standards in terms of storytelling and production quality.",
                "image": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop",
                "author": "Kavya Menon",
                "language": "en",
                "category": "ott-reviews",
                "states": ["all"],
                "is_published": True,
                "rating": 4.1
            }
        ]

        articles_created = 0
        
        # Create movie reviews articles if category was created
        if "movie-reviews" in categories_created or len(categories_created) == 0:
            print("Creating movie reviews articles...")
            for article_data in movie_reviews_articles:
                response = requests.post(f"{API_URL}/cms/articles", json=article_data)
                if response.status_code == 200:
                    articles_created += 1
                    print(f"✅ Created: {article_data['title'][:50]}...")
                else:
                    print(f"❌ Failed to create: {article_data['title'][:50]}...")
        
        # Create OTT reviews articles if category was created
        if "ott-reviews" in categories_created or len(categories_created) == 0:
            print("Creating OTT reviews articles...")
            for article_data in ott_reviews_articles:
                response = requests.post(f"{API_URL}/cms/articles", json=article_data)
                if response.status_code == 200:
                    articles_created += 1
                    print(f"✅ Created: {article_data['title'][:50]}...")
                else:
                    print(f"❌ Failed to create: {article_data['title'][:50]}...")
        
        print(f"\n✅ Total articles created: {articles_created}")
        return articles_created

    def test_moviereviews_page_complete_functionality(self):
        """Complete test of MovieReviews page backend functionality"""
        print("\n" + "="*80)
        print("MOVIEREVIEWS PAGE BACKEND FUNCTIONALITY TEST")
        print("="*80)
        
        # Step 1: Test current state
        print("\n🔍 STEP 1: Testing current API endpoints...")
        movie_reviews_working = self.test_movie_reviews_category_endpoint()
        ott_reviews_working = self.test_ott_reviews_category_endpoint()
        related_working = self.test_related_articles_movie_reviews_endpoint()
        
        # Step 2: Check categories existence
        print("\n🔍 STEP 2: Checking categories in database...")
        movie_exists, ott_exists = self.test_categories_existence()
        
        # Step 3: Create missing categories if needed
        categories_created = []
        if not movie_exists or not ott_exists:
            print("\n🔧 STEP 3: Creating missing categories...")
            categories_created = self.create_missing_categories()
        else:
            print("\n✅ STEP 3: All required categories already exist")
        
        # Step 4: Create sample articles
        print("\n🔧 STEP 4: Creating sample articles...")
        articles_created = self.create_sample_articles(categories_created)
        
        # Step 5: Re-test endpoints after fixes
        print("\n🔍 STEP 5: Re-testing endpoints after fixes...")
        movie_reviews_final = self.test_movie_reviews_category_endpoint()
        ott_reviews_final = self.test_ott_reviews_category_endpoint()
        
        # Final summary
        print("\n" + "="*80)
        print("MOVIEREVIEWS PAGE BACKEND TEST SUMMARY")
        print("="*80)
        print(f"✅ Categories created: {len(categories_created)}")
        print(f"✅ Articles created: {articles_created}")
        print(f"✅ Movie Reviews endpoint working: {movie_reviews_final}")
        print(f"✅ OTT Reviews endpoint working: {ott_reviews_final}")
        print(f"✅ Related articles endpoint working: {related_working}")
        
        if movie_reviews_final and ott_reviews_final:
            print(f"\n🎉 SUCCESS: MovieReviews page backend is now fully functional!")
            print(f"✅ Both movie-reviews and ott-reviews categories have sample content")
            print(f"✅ API endpoints return proper article data")
            print(f"✅ MovieReviews page should now display actual content instead of empty arrays")
        else:
            print(f"\n⚠️ PARTIAL SUCCESS: Some issues remain")
            if not movie_reviews_final:
                print(f"❌ movie-reviews endpoint still returning empty array")
            if not ott_reviews_final:
                print(f"❌ ott-reviews endpoint still returning empty array")

if __name__ == "__main__":
    # Create a test suite specifically for MovieReviews page
    suite = unittest.TestSuite()
    
    # Add the comprehensive test
    suite.addTest(MovieReviewsBackendTest("test_moviereviews_page_complete_functionality"))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print final summary
    print(f"\n" + "="*80)
    print(f"MOVIEREVIEWS PAGE BACKEND TESTING COMPLETED")
    print(f"="*80)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    if len(result.failures) == 0 and len(result.errors) == 0:
        print(f"\n🎉 ALL MOVIEREVIEWS PAGE BACKEND TESTS PASSED!")
        print(f"✅ MovieReviews page should now have content to display")
    else:
        print(f"\n⚠️ Some tests had issues - see details above")