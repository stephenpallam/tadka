from sqlalchemy.orm import Session
import models
from datetime import datetime, timedelta
import random

def seed_database(db: Session):
    """Seed the database with sample data"""
    
    # Clear existing data (optional - remove in production)
    # This is commented out to preserve existing data
    
    # Seed Categories - Updated to match frontend structure
    categories_data = [
        # Core sections
        {"name": "Latest News", "slug": "latest-news", "description": "Breaking news and current affairs"},
        {"name": "Politics", "slug": "politics", "description": "Political news and government updates"},
        {"name": "National Top Stories", "slug": "national-top-stories", "description": "National news and top stories"},
        {"name": "Movies", "slug": "movies", "description": "Movie news, updates and entertainment"},
        {"name": "AI", "slug": "ai", "description": "Artificial Intelligence and technology news"},
        {"name": "Stock Market", "slug": "stock-market", "description": "Stock market and financial news"},
        {"name": "Sports", "slug": "sports", "description": "Sports news and updates"},
        {"name": "Trending Videos", "slug": "trending-videos", "description": "Trending video content"},

        {"name": "Travel Pics", "slug": "travel-pics", "description": "Travel photography and destinations"},
        {"name": "Fashion", "slug": "fashion", "description": "Fashion trends and style updates"},
        
        # Movie Reviews Section (with unique categories)
        {"name": "Movie Reviews", "slug": "movie-reviews", "description": "General movie reviews and critiques"},
        {"name": "Movie Reviews Bollywood", "slug": "movie-reviews-bollywood", "description": "Bollywood movie reviews and critiques"},
        
        # Row4 - Trailers & Teasers, Box Office, Theater Releases
        {"name": "Trailers Teasers", "slug": "trailers-teasers", "description": "Movie trailers and teasers"},
        {"name": "Trailers Teasers Bollywood", "slug": "trailers-teasers-bollywood", "description": "Bollywood trailers and teasers"},
        {"name": "Box Office", "slug": "box-office", "description": "Box office collections and reports"},
        {"name": "Box Office Bollywood", "slug": "box-office-bollywood", "description": "Bollywood box office collections"},
        {"name": "Theater Releases", "slug": "theater-releases", "description": "Theater movie releases"},
        {"name": "Theater Releases Bollywood", "slug": "theater-releases-bollywood", "description": "Bollywood theater releases"},
        
        # OTT Reviews Section  
        {"name": "OTT Reviews", "slug": "ott-reviews", "description": "OTT platform content reviews"},
        {"name": "OTT Reviews Bollywood", "slug": "ott-reviews-bollywood", "description": "Bollywood OTT platform content reviews"},
        
        # Row5 - New Video Songs, TV Shows, OTT Releases
        {"name": "New Video Songs", "slug": "new-video-songs", "description": "New video songs and music videos"},
        {"name": "New Video Songs Bollywood", "slug": "new-video-songs-bollywood", "description": "New Bollywood video songs and music videos"},
        {"name": "TV Shows", "slug": "tv-shows", "description": "Television shows and TV content"},
        {"name": "TV Shows Bollywood", "slug": "tv-shows-bollywood", "description": "Bollywood television content"},
        {"name": "OTT Releases", "slug": "ott-releases", "description": "OTT platform releases"},
        {"name": "OTT Releases Bollywood", "slug": "ott-releases-bollywood", "description": "Bollywood OTT platform releases"},
        
        # Events & Interviews Section
        {"name": "Events Interviews", "slug": "events-interviews", "description": "Celebrity events and interviews"},
        {"name": "Events Interviews Bollywood", "slug": "events-interviews-bollywood", "description": "Bollywood celebrity events and interviews"},
        
        # Sports sections (Row3)
        {"name": "Sports Schedules", "slug": "sports-schedules", "description": "Sports schedules and fixtures"},
        
        # NRI and World News sections
        {"name": "NRI News", "slug": "nri-news", "description": "News and updates relevant to Non-Resident Indians"},
        {"name": "World News", "slug": "world-news", "description": "International news and global affairs"}
    ]
    
    for cat_data in categories_data:
        # Check if category already exists
        existing_category = db.query(models.Category).filter(models.Category.slug == cat_data["slug"]).first()
        if not existing_category:
            category = models.Category(**cat_data)
            db.add(category)
    
    db.commit()
    
    # Seed Articles with proper date distribution for filtering
    base_date = datetime(2026, 6, 30, 23, 59, 59)  # June 30, 2026 as reference
    
    articles_data = [
        # Latest News / Top Stories
        {
            "title": "Breaking: Major Policy Changes Announced Today",
            "slug": "major-policy-changes-today",
            "content": "Comprehensive policy reforms have been announced today, affecting multiple sectors...",
            "summary": "Government announces sweeping policy reforms across healthcare, education, and infrastructure sectors.",
            "author": "Political Correspondent",
            "published_at": base_date,
            "category": "latest-news",
            "image": "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=200",
            "is_featured": True,
            "tags": "politics,policy,government"
        },
        
        # Movies Section - Bollywood-Movies Tab
        {
            "title": "Bollywood Box Office Collections This Week",
            "slug": "bollywood-box-office-week",
            "content": "This week's Bollywood releases have performed exceptionally well...",
            "summary": "Weekly roundup of Bollywood movie box office collections and performance analysis.",
            "author": "Entertainment Reporter",
            "published_at": base_date,
            "category": "bollywood-movies",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,movies,box-office"
        },
        {
            "title": "Latest Movie Releases and Reviews",
            "slug": "latest-movie-releases-reviews",
            "content": "Today's entertainment news covers major developments in the film industry...",
            "summary": "Major film studios announce new release schedules and production updates for upcoming blockbusters.",
            "author": "Film Critic",
            "published_at": base_date,
            "category": "movies",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "movies,entertainment,industry"
        },
        
        # Politics - State Politics Tab
        {
            "title": "State Assembly Passes New Infrastructure Bill",
            "slug": "state-assembly-infrastructure-bill",
            "content": "State legislature approves major infrastructure development project...",
            "summary": "State government approves multi-billion dollar infrastructure development initiative.",
            "author": "State Political Reporter",
            "published_at": base_date,
            "category": "state-politics",
            "image": "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=300&h=200",
            "tags": "state-politics,infrastructure,government"
        },
        
        # Politics - National Politics Tab  
        {
            "title": "National Budget Session Concludes Successfully",
            "slug": "national-budget-session-concludes",
            "content": "The national budget session concluded yesterday with significant outcomes...",
            "summary": "Key legislative measures passed in national budget session include budget allocations and regulatory changes.",
            "author": "National Political Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "national-politics",
            "image": "https://images.unsplash.com/photo-1586339949216-35c890863684?w=300&h=200",
            "tags": "national-politics,budget,government"
        },
        
        # Sports - Cricket Tab
        {
            "title": "Cricket World Cup Qualifiers Begin This Month",
            "slug": "cricket-world-cup-qualifiers",
            "content": "The cricket world cup qualification matches are set to begin...",
            "summary": "Major cricket teams prepare for world cup qualifier tournaments starting this month.",
            "author": "Sports Correspondent",
            "published_at": base_date,
            "category": "cricket",
            "image": "https://images.unsplash.com/photo-1540747913346-19e63482ceaa?w=300&h=200",
            "tags": "cricket,sports,world-cup"
        },
        
        # Health/Food Tab
        {
            "title": "New Nutritional Guidelines Released by Health Ministry",
            "slug": "new-nutritional-guidelines-health",
            "content": "Health ministry releases comprehensive nutritional guidelines...",
            "summary": "Updated dietary recommendations focus on balanced nutrition and healthy eating habits.",
            "author": "Health Reporter",
            "published_at": base_date,
            "category": "health",
            "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200",
            "tags": "health,nutrition,wellness"
        },
        {
            "title": "Traditional Food Recipes Gain Modern Popularity",
            "slug": "traditional-food-recipes-modern",
            "content": "Traditional cooking methods and recipes are experiencing a revival...",
            "summary": "Modern food enthusiasts rediscover traditional recipes with contemporary cooking techniques.",
            "author": "Food Writer",
            "published_at": base_date,
            "category": "food",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200",
            "tags": "food,cooking,traditional"
        },
        
        # AI Section
        {
            "title": "Latest AI Tools Revolutionize Content Creation",
            "slug": "ai-tools-content-creation",
            "content": "New artificial intelligence tools are transforming how content is created...",
            "summary": "Revolutionary AI tools enable faster and more efficient content creation across industries.",
            "author": "Tech Reporter",
            "published_at": base_date,
            "category": "ai",
            "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200",
            "tags": "ai,technology,innovation"
        },
        
        # Stock Market/Fashion Tab
        {
            "title": "Fashion Industry Shows Strong Market Performance",
            "slug": "fashion-industry-market-performance",
            "content": "Fashion stocks demonstrate robust performance in current market conditions...",
            "summary": "Fashion industry stocks outperform market expectations with strong quarterly results.",
            "author": "Fashion Business Reporter",
            "published_at": base_date,
            "category": "fashion",
            "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200",
            "tags": "fashion,business,stocks"
        },
        
        # Travel Tab
        {
            "title": "Exotic Travel Destinations Gain Tourist Interest",
            "slug": "exotic-travel-destinations-interest",
            "content": "Lesser-known travel destinations are becoming increasingly popular...",
            "summary": "Travelers seek unique experiences in off-the-beaten-path destinations around the world.",
            "author": "Travel Correspondent",
            "published_at": base_date,
            "category": "travel",
            "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200",
            "tags": "travel,tourism,destinations"
        },
        
        
        # Box Office
        {
            "title": "Weekend Box Office Collections Show Strong Growth",
            "slug": "weekend-box-office-collections",
            "content": "This weekend's box office numbers indicate strong movie industry performance...",
            "summary": "Movie theaters report impressive box office collections with diverse film offerings.",
            "author": "Box Office Analyst",
            "published_at": base_date,
            "category": "box-office",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "box-office,movies,entertainment"
        },
        
        # Trailers
        {
            "title": "Highly Anticipated Movie Trailers Released This Week",
            "slug": "anticipated-movie-trailers-week",
            "content": "This week brings exciting new movie trailers for upcoming blockbuster releases...",
            "summary": "Major film studios release trailers for highly anticipated movies scheduled for next quarter.",
            "author": "Entertainment Reporter",
            "published_at": base_date,
            "category": "trailers",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "trailers,movies,entertainment"
        },
        
        # Hot Topics
        {
            "title": "Social Issues Spark Nationwide Discussions",
            "slug": "social-issues-nationwide-discussions",
            "content": "Current social issues have generated widespread public discourse and debate...",
            "summary": "Important social topics dominate public conversation and policy discussions.",
            "author": "Social Affairs Reporter",
            "published_at": base_date,
            "category": "hot-topics",
            "image": "https://images.unsplash.com/photo-1573166364524-d9dbfd8d4c90?w=300&h=200",
            "tags": "social-issues,topics,discussion"
        },
        
        # Gossip
        {
            "title": "Celebrity News and Entertainment Updates",
            "slug": "celebrity-news-entertainment-updates",
            "content": "Latest celebrity news brings exciting updates from the entertainment world...",
            "summary": "Entertainment industry buzzes with celebrity announcements and exclusive updates.",
            "author": "Celebrity Reporter",
            "published_at": base_date,
            "category": "gossip",
            "image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200",
            "tags": "celebrity,gossip,entertainment"
        },
        
        # OTT Reviews
        {
            "title": "Latest OTT Platform Releases Reviewed",
            "slug": "ott-platform-releases-reviewed",
            "content": "This week's OTT platform releases offer diverse content across genres...",
            "summary": "Comprehensive reviews of new shows and movies launched on popular OTT platforms.",
            "author": "OTT Content Reviewer",
            "published_at": base_date,
            "category": "ott-reviews",
            "image": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200",
            "tags": "ott,streaming,reviews"
        },
        {
            "title": "Netflix Original Movies This Month",
            "slug": "netflix-original-movies-month",
            "content": "Netflix's original movie lineup this month features several standout productions...",
            "summary": "Review of Netflix's exclusive movie releases featuring diverse storytelling.",
            "author": "Streaming Content Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "ott-reviews",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "netflix,ott,movies"
        },
        
        # Movie Reviews
        {
            "title": "Latest Hollywood Blockbuster Review",
            "slug": "latest-hollywood-blockbuster-review",
            "content": "The latest Hollywood blockbuster delivers spectacular action sequences...",
            "summary": "Comprehensive review of the latest Hollywood blockbuster featuring stunning visuals and compelling storyline.",
            "author": "Movie Critic",
            "published_at": base_date,
            "category": "movie-reviews",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "hollywood,movie-review,blockbuster"
        },
        {
            "title": "Independent Film Festival Winner Review",
            "slug": "independent-film-festival-winner-review", 
            "content": "This independent film festival winner showcases exceptional storytelling...",
            "summary": "Review of the award-winning independent film that captivated festival audiences worldwide.",
            "author": "Independent Film Critic",
            "published_at": base_date - timedelta(days=1),
            "category": "movie-reviews",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "independent,film-festival,award-winner"
        },
        
        # Movie Reviews Bollywood
        {
            "title": "Pathaan Movie Review: SRK's Grand Comeback",
            "slug": "pathaan-movie-review-srk-comeback",
            "content": "Shah Rukh Khan makes a triumphant return to the big screen with Pathaan...",
            "summary": "Detailed review of Pathaan showcasing SRK's powerful comeback with high-octane action sequences.",
            "author": "Bollywood Movie Critic",
            "published_at": base_date,
            "category": "movie-reviews-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,pathaan,srk,movie-review"
        },
        {
            "title": "Jawan Review: Action-Packed Entertainment",
            "slug": "jawan-review-action-packed-entertainment",
            "content": "Jawan delivers on its promise of mass entertainment with stellar performances...",
            "summary": "Comprehensive review of Jawan highlighting its entertainment value and stellar cast performances.",
            "author": "Bollywood Reviewer",
            "published_at": base_date - timedelta(days=1),
            "category": "movie-reviews-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,jawan,action,entertainment"
        },
        
        # Trailers Teasers
        {
            "title": "Upcoming Superhero Movie Trailer Breaks Records",
            "slug": "superhero-movie-trailer-breaks-records",
            "content": "The latest superhero movie trailer has shattered YouTube view records...",
            "summary": "New superhero trailer achieves record-breaking views within first 24 hours of release.",
            "author": "Entertainment Reporter",
            "published_at": base_date,
            "category": "trailers-teasers",
            "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200",
            "tags": "superhero,trailer,records,hollywood"
        },
        {
            "title": "Horror Film Teaser Creates Buzz Among Fans",
            "slug": "horror-film-teaser-creates-buzz",
            "content": "The new horror film teaser has created massive excitement among horror fans...",
            "summary": "Latest horror film teaser generates significant buzz with spine-chilling visuals and atmosphere.",
            "author": "Horror Film Specialist",
            "published_at": base_date - timedelta(days=1),
            "category": "trailers-teasers",
            "image": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200",
            "tags": "horror,teaser,scary,thriller"
        },
        
        # Box Office
        {
            "title": "Weekend Box Office: Action Film Dominates",
            "slug": "weekend-box-office-action-film-dominates",
            "content": "This weekend's box office numbers show clear dominance by the new action film...",
            "summary": "Weekend box office report reveals action film's commanding performance across theaters.",
            "author": "Box Office Analyst",
            "published_at": base_date,
            "category": "box-office",
            "image": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200",
            "tags": "box-office,weekend,action-film,collections"
        },
        {
            "title": "International Box Office Trends This Month",
            "slug": "international-box-office-trends-month",
            "content": "International markets show interesting trends in box office performance this month...",
            "summary": "Analysis of international box office trends revealing shifting audience preferences globally.",
            "author": "International Film Analyst",
            "published_at": base_date - timedelta(days=2),
            "category": "box-office",
            "image": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200",
            "tags": "international,box-office,trends,global"
        },
        
        # Box Office Bollywood
        {
            "title": "Bollywood Box Office: Record-Breaking Collections",
            "slug": "bollywood-box-office-record-breaking",
            "content": "Bollywood films achieve record-breaking collections this quarter...",
            "summary": "Bollywood box office report showing exceptional performance and record-breaking collections.",
            "author": "Bollywood Trade Analyst",
            "published_at": base_date,
            "category": "box-office-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,box-office,records,collections"
        },
        {
            "title": "South vs North: Box Office Comparison",
            "slug": "south-vs-north-box-office-comparison",
            "content": "Comparative analysis of South Indian and Bollywood box office performance...",
            "summary": "Detailed comparison between South Indian and Bollywood film collections and market trends.",
            "author": "Regional Cinema Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "box-office-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,south-indian,comparison,regional"
        },
        
        # Events Interviews Bollywood
        {
            "title": "Exclusive Interview with Bollywood Superstar",
            "slug": "exclusive-interview-bollywood-superstar",
            "content": "In an exclusive interview, the Bollywood superstar shares insights about upcoming projects...",
            "summary": "Exclusive conversation with leading Bollywood actor discussing career milestones and future plans.",
            "author": "Celebrity Interviewer",
            "published_at": base_date,
            "category": "events-interviews-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,interview,exclusive,celebrity"
        },
        {
            "title": "Red Carpet Event: Bollywood Stars Shine",
            "slug": "red-carpet-event-bollywood-stars-shine",
            "content": "The red carpet event witnessed Bollywood's biggest stars in their glamorous avatars...",
            "summary": "Coverage of the star-studded red carpet event featuring Bollywood's finest in stunning outfits.",
            "author": "Event Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "events-interviews-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,red-carpet,glamour,event"
        },
        
        # Additional Bollywood content for different sections
        {
            "title": "Bollywood Trending Video Content Goes Viral",
            "slug": "bollywood-trending-video-viral",
            "content": "Latest Bollywood video content trends are gaining massive popularity on social platforms...",
            "summary": "Bollywood video content dominates trending charts across social media platforms.",
            "author": "Social Media Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "bollywood-trending-videos",
            "image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200",
            "tags": "bollywood,trending,social-media"
        },
        {
            "title": "Bollywood Box Office Records Broken This Weekend",
            "slug": "bollywood-box-office-records",
            "content": "This weekend's Bollywood box office collections have set new industry records...",
            "summary": "Record-breaking box office performance by Bollywood films this weekend across theaters.",
            "author": "Box Office Analyst",
            "published_at": base_date - timedelta(days=2),
            "category": "bollywood-box-office",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,box-office,records"
        },
        {
            "title": "Bollywood Celebrity Interviews at Film Festival",
            "slug": "bollywood-celebrity-interviews-festival",
            "content": "Exclusive interviews with Bollywood celebrities at the recent film festival...",
            "summary": "Major Bollywood stars share insights in exclusive interviews during film festival events.",
            "author": "Entertainment Correspondent",
            "published_at": base_date - timedelta(days=3),
            "category": "bollywood-events-interviews",
            "image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200",
            "tags": "bollywood,interviews,events"
        },
        
        # Top Stories
        {
            "title": "Breaking: Major Economic Policy Changes Announced",
            "slug": "major-economic-policy-changes",
            "content": "Government announces significant changes to economic policy affecting multiple sectors...",
            "summary": "New economic policies set to impact businesses and consumers across the country.",
            "author": "Economic Reporter",
            "published_at": base_date,
            "category": "top-stories",
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200",
            "tags": "economics,policy,government"
        },
        {
            "title": "Technology Breakthrough Changes Industry Standards",
            "slug": "technology-breakthrough-industry-standards",
            "content": "Revolutionary technology development sets new standards for the industry...",
            "summary": "Groundbreaking technological advancement promises to reshape industry practices.",
            "author": "Tech Reporter",
            "published_at": base_date - timedelta(hours=2),
            "category": "top-stories",
            "image": "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=300&h=200",
            "tags": "technology,innovation,industry"
        },
        {
            "title": "International Sports Championship Underway",
            "slug": "international-sports-championship-underway",
            "content": "Major international sports championship brings together athletes from around the world...",
            "summary": "Athletes compete in prestigious international championship with record viewership.",
            "author": "Sports Correspondent",
            "published_at": base_date - timedelta(hours=4),
            "category": "top-stories",
            "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200",
            "tags": "sports,international,championship"
        },
        {
            "title": "Entertainment Industry Awards Season Begins",
            "slug": "entertainment-awards-season-begins",
            "content": "The entertainment industry's most prestigious awards season officially kicks off...",
            "summary": "Major entertainment awards ceremonies commence with star-studded nominations.",
            "author": "Entertainment Reporter",
            "published_at": base_date - timedelta(hours=6),
            "category": "top-stories",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "entertainment,awards,celebrities"
        },
        
        # National Top Stories
        {
            "title": "Parliament Passes Landmark Legislation",
            "slug": "parliament-landmark-legislation",
            "content": "National parliament approves significant legislation after extensive debate...",
            "summary": "Historic legislative session results in the passage of groundbreaking national laws.",
            "author": "Political Correspondent",
            "published_at": base_date,
            "category": "national-top-stories",
            "image": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=300&h=200",
            "tags": "parliament,legislation,politics"
        },
        {
            "title": "National Infrastructure Development Project Launched",
            "slug": "national-infrastructure-development-launched",
            "content": "Government launches massive infrastructure development project spanning multiple states...",
            "summary": "Multi-billion dollar infrastructure initiative aims to modernize national transportation networks.",
            "author": "Infrastructure Reporter",
            "published_at": base_date - timedelta(hours=1),
            "category": "national-top-stories",
            "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200",
            "tags": "infrastructure,development,national"
        },
        {
            "title": "Supreme Court Delivers Historic Judgment",
            "slug": "supreme-court-historic-judgment",
            "content": "The nation's highest court delivers a landmark judgment on constitutional matters...",
            "summary": "Supreme Court's historic ruling sets important precedent for future legal cases.",
            "author": "Legal Affairs Reporter",
            "published_at": base_date - timedelta(hours=3),
            "category": "national-top-stories",
            "image": "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=300&h=200",
            "tags": "supreme-court,legal,judgment"
        },
        {
            "title": "National Education Reform Initiative Announced",
            "slug": "national-education-reform-initiative",
            "content": "Comprehensive education reform initiative announced to modernize national curriculum...",
            "summary": "Government unveils ambitious education reform plans affecting millions of students nationwide.",
            "author": "Education Reporter",
            "published_at": base_date - timedelta(hours=5),
            "category": "national-top-stories",
            "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200",
            "tags": "education,reform,national"
        },
        
        # Theater Releases Bollywood
        {
            "title": "Pathaan Box Office Collection Day 1",
            "slug": "pathaan-box-office-collection-day-1",
            "content": "Shah Rukh Khan's comeback film Pathaan has taken the box office by storm...",
            "summary": "Pathaan sets new records on opening day with massive box office collections across India.",
            "author": "Box Office Reporter",
            "published_at": base_date,
            "category": "theater-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,pathaan,box-office"
        },
        {
            "title": "Jawan Creates History in Theaters",
            "slug": "jawan-creates-history-theaters",
            "content": "Shah Rukh Khan's Jawan has broken multiple box office records...",
            "summary": "Jawan becomes the highest-grossing Bollywood film of the year with unprecedented collections.",
            "author": "Entertainment Correspondent",
            "published_at": base_date - timedelta(days=1),
            "category": "theater-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,jawan,theater-release"
        },
        {
            "title": "Tiger 3 Advance Booking Opens",
            "slug": "tiger-3-advance-booking-opens",
            "content": "Advance booking for Salman Khan's Tiger 3 has opened to massive response...",
            "summary": "Tiger 3 advance bookings indicate strong opening weekend performance for the action thriller.",
            "author": "Trade Analyst",
            "published_at": base_date - timedelta(days=2),
            "category": "theater-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200",
            "tags": "bollywood,tiger-3,advance-booking"
        },
        {
            "title": "Dunki Theater Response Overwhelms Fans",
            "slug": "dunki-theater-response-overwhelms-fans",
            "content": "Shah Rukh Khan's Dunki receives exceptional response from theater audiences...",
            "summary": "Dunki's unique storytelling and emotional depth create strong word-of-mouth in theaters.",
            "author": "Film Critic",
            "published_at": base_date - timedelta(days=3),
            "category": "theater-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200",
            "tags": "bollywood,dunki,theater-response"
        },
        
        # Trailers Teasers Bollywood
        {
            "title": "Pathaan Trailer Sets Internet on Fire",
            "slug": "pathaan-trailer-sets-internet-on-fire",
            "content": "Shah Rukh Khan's comeback trailer for Pathaan has broken multiple records...",
            "summary": "Pathaan trailer becomes most-watched Bollywood trailer with record-breaking views in first 24 hours.",
            "author": "Entertainment Reporter",
            "published_at": base_date,
            "category": "trailers-teasers-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,pathaan,trailer"
        },
        {
            "title": "Jawan Teaser Creates Mass Hysteria",
            "slug": "jawan-teaser-creates-mass-hysteria",
            "content": "The first teaser of Shah Rukh Khan's Jawan has created massive buzz...",
            "summary": "Jawan teaser trends worldwide as fans celebrate SRK's dynamic avatar and high-octane action sequences.",
            "author": "Film Correspondent",
            "published_at": base_date - timedelta(days=1),
            "category": "trailers-teasers-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,jawan,teaser"
        },
        {
            "title": "Tiger 3 Action Trailer Breaks Records",
            "slug": "tiger-3-action-trailer-breaks-records",
            "content": "Salman Khan's Tiger 3 trailer showcases spectacular action sequences...",
            "summary": "Tiger 3 trailer sets new benchmarks for Bollywood action films with stunning visuals and intense sequences.",
            "author": "Action Film Critic",
            "published_at": base_date - timedelta(days=2),
            "category": "trailers-teasers-bollywood",
            "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200",
            "tags": "bollywood,tiger-3,action-trailer"
        },
        {
            "title": "Dunki Emotional Trailer Wins Hearts",
            "slug": "dunki-emotional-trailer-wins-hearts",
            "content": "Rajkumar Hirani's Dunki trailer touches emotional chords with audiences...",
            "summary": "Dunki trailer showcases SRK's emotional journey with Hirani's signature storytelling and heartfelt moments.",
            "author": "Film Reviewer",
            "published_at": base_date - timedelta(days=3),
            "category": "trailers-teasers-bollywood",
            "image": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200",
            "tags": "bollywood,dunki,emotional-trailer"
        },
        
        # New Video Songs
        {
            "title": "Latest Punjabi Music Video Goes Viral",
            "slug": "latest-punjabi-music-video-goes-viral",
            "content": "The latest Punjabi music video has taken social media by storm...",
            "summary": "New Punjabi music video achieves record-breaking views and becomes trending topic on social platforms.",
            "author": "Music Reporter",
            "published_at": base_date,
            "category": "new-video-songs",
            "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200",
            "tags": "music,video-songs,punjabi"
        },
        {
            "title": "Independent Artist's Music Video Breaks Internet",
            "slug": "independent-artist-music-video-breaks-internet",
            "content": "An independent artist's creative music video has gone viral across platforms...",
            "summary": "Independent music video showcases innovative storytelling and gains millions of views within days.",
            "author": "Independent Music Critic",
            "published_at": base_date - timedelta(days=1),
            "category": "new-video-songs",
            "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200",
            "tags": "music,independent,viral-video"
        },
        
        # New Video Songs Bollywood
        {
            "title": "Pathaan Title Track Creates Dance Craze",
            "slug": "pathaan-title-track-creates-dance-craze",
            "content": "The Pathaan title track has become a massive hit with fans creating dance reels...",
            "summary": "Pathaan's title track becomes viral sensation as fans recreate dance moves across social media.",
            "author": "Bollywood Music Correspondent",
            "published_at": base_date,
            "category": "new-video-songs-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,pathaan,music-video"
        },
        {
            "title": "Jawan's 'Zinda Banda' Breaks Music Records",
            "slug": "jawan-zinda-banda-breaks-music-records",
            "content": "The song 'Zinda Banda' from Jawan has set new records for music video views...",
            "summary": "Jawan's 'Zinda Banda' achieves fastest 100 million views for a Bollywood music video.",
            "author": "Music Industry Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "new-video-songs-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,jawan,music-record"
        },
        
        # TV
        {
            "title": "New Crime Thriller Series Captivates Audiences",
            "slug": "new-crime-thriller-series-captivates-audiences",
            "content": "The latest crime thriller series has become viewers' favorite with its gripping storyline...",
            "summary": "New crime thriller series achieves highest TRP ratings with compelling narrative and stellar performances.",
            "author": "TV Critic",
            "published_at": base_date,
            "category": "tv",
            "image": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200",
            "tags": "television,crime-thriller,series"
        },
        {
            "title": "Reality Show Creates Nationwide Buzz",
            "slug": "reality-show-creates-nationwide-buzz",
            "content": "The new reality show format has captured audience attention across the country...",
            "summary": "Innovative reality show concept becomes talking point with unique format and engaging content.",
            "author": "Reality TV Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "tv",
            "image": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200",
            "tags": "television,reality-show,entertainment"
        },
        
        # TV Bollywood
        {
            "title": "Bollywood Stars Grace Prime Time Show",
            "slug": "bollywood-stars-grace-prime-time-show",
            "content": "Top Bollywood celebrities appeared on the popular prime time television show...",
            "summary": "Major Bollywood stars create television magic with their appearances on prime time shows.",
            "author": "TV Entertainment Reporter",
            "published_at": base_date,
            "category": "tv-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,television,prime-time"
        },
        {
            "title": "Celebrity Talk Show Breaks TRP Records",
            "slug": "celebrity-talk-show-breaks-trp-records",
            "content": "The celebrity talk show featuring Bollywood stars has achieved record TRP ratings...",
            "summary": "Bollywood celebrity talk show sets new television viewership records with star-studded episodes.",
            "author": "Television Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "tv-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,talk-show,trp-record"
        },
        
        # OTT Releases Bollywood
        {
            "title": "Bollywood Film Premieres Exclusively on OTT",
            "slug": "bollywood-film-premieres-exclusively-ott",
            "content": "Major Bollywood film skips theatrical release and premieres directly on OTT platform...",
            "summary": "High-budget Bollywood film creates buzz with direct OTT premiere breaking traditional release patterns.",
            "author": "OTT Platform Reporter",
            "published_at": base_date,
            "category": "ott-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=200",
            "tags": "bollywood,ott-release,premiere"
        },
        {
            "title": "Star-Studded Web Series Announced for OTT",
            "slug": "star-studded-web-series-announced-ott",
            "content": "A new web series featuring top Bollywood actors has been announced for OTT release...",
            "summary": "Major OTT platform announces web series with ensemble cast of leading Bollywood celebrities.",
            "author": "Streaming Content Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "ott-releases-bollywood",
            "image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200",
            "tags": "bollywood,web-series,ott-announcement"
        }
    ]
    
    # Add some additional articles for other categories
    articles_data.extend([
        {
            "title": "Weekly Sports Roundup: Cricket Highlights",
            "slug": "weekly-sports-cricket-highlights",
            "content": "This week's cricket matches delivered exceptional performances...",
            "summary": "Comprehensive coverage of this week's cricket matches and player performances.",
            "author": "Sports Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "cricket",
            "image": "https://images.unsplash.com/photo-1540747913346-19e63482ceaa?w=300&h=200",
            "tags": "cricket,sports,weekly"
        },
        {
            "title": "Healthy Cooking Tips for Modern Lifestyle",
            "slug": "healthy-cooking-tips-modern",
            "content": "Expert nutritionists share practical cooking tips for busy professionals...",
            "summary": "Learn how to maintain healthy eating habits with simple and effective cooking techniques.",
            "author": "Nutrition Expert",
            "published_at": base_date - timedelta(days=2),
            "category": "food",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200",
            "tags": "food,health,cooking"
        },
        {
            "title": "AI Technology Trends Shaping the Future",
            "slug": "ai-technology-trends-future",
            "content": "Emerging AI trends are revolutionizing various industries...",
            "summary": "Explore the latest AI developments and their impact on future technology landscape.",
            "author": "AI Researcher",
            "published_at": base_date - timedelta(days=3),
            "category": "ai",
            "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200",
            "tags": "ai,technology,future"
        },
        
        # NRI News articles
        {
            "title": "Indian Diaspora Celebrates Festival of Lights Globally",
            "slug": "indian-diaspora-diwali-celebrations-global",
            "content": "Indian communities across the world come together to celebrate Diwali with traditional fervor...",
            "summary": "NRI communities in USA, UK, Canada and Australia organize grand Diwali celebrations showcasing Indian culture.",
            "author": "NRI Correspondent",
            "published_at": base_date,
            "category": "nri-news",
            "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=300&h=200",
            "tags": "nri,diwali,festivals,diaspora"
        },
        {
            "title": "Indian Students Excel in International Universities",
            "slug": "indian-students-excel-international-universities",
            "content": "Indian students continue to achieve remarkable success in top universities worldwide...",
            "summary": "Record number of Indian students receive scholarships and recognition at prestigious international institutions.",
            "author": "Education Reporter",
            "published_at": base_date - timedelta(days=1),
            "category": "nri-news",
            "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200",
            "tags": "nri,education,students,international"
        },
        {
            "title": "Indian IT Professionals Leading Tech Innovation Abroad",
            "slug": "indian-it-professionals-tech-innovation-abroad",
            "content": "Indian IT professionals are at the forefront of technological innovations in Silicon Valley and beyond...",
            "summary": "Success stories of Indian technocrats who are driving innovation in major tech companies worldwide.",
            "author": "Tech Correspondent",
            "published_at": base_date - timedelta(days=2),
            "category": "nri-news",
            "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200",
            "tags": "nri,technology,innovation,professionals"
        },
        {
            "title": "Indian Restaurants Gain Recognition in World Food Scene",
            "slug": "indian-restaurants-world-food-scene-recognition",
            "content": "Indian restaurants and chefs are receiving international acclaim for authentic cuisine...",
            "summary": "Michelin stars and international awards highlight the growing recognition of Indian culinary excellence globally.",
            "author": "Food Critic",
            "published_at": base_date - timedelta(days=3),
            "category": "nri-news",
            "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200",
            "tags": "nri,food,restaurants,culinary"
        },
        
        # World News articles
        {
            "title": "Global Climate Summit Reaches Historic Agreement",
            "slug": "global-climate-summit-historic-agreement",
            "content": "World leaders unite at the climate summit to address urgent environmental challenges...",
            "summary": "194 nations commit to ambitious carbon reduction targets and renewable energy transition plans.",
            "author": "International Correspondent",
            "published_at": base_date,
            "category": "world-news",
            "image": "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e4?w=300&h=200",
            "tags": "world,climate,environment,summit"
        },
        {
            "title": "International Trade Relations Show Positive Trends",
            "slug": "international-trade-relations-positive-trends",
            "content": "Global trade partnerships strengthen as countries rebuild post-pandemic economies...",
            "summary": "Trade volumes reach pre-pandemic levels with new bilateral agreements boosting economic cooperation.",
            "author": "Economic Analyst",
            "published_at": base_date - timedelta(days=1),
            "category": "world-news",
            "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&h=200",
            "tags": "world,trade,economy,international"
        },
        {
            "title": "Space Exploration Achievements Mark New Era",
            "slug": "space-exploration-achievements-new-era",
            "content": "International space agencies collaborate on groundbreaking missions to Mars and beyond...",
            "summary": "Joint space missions demonstrate unprecedented international cooperation in scientific exploration.",
            "author": "Science Reporter",
            "published_at": base_date - timedelta(days=2),
            "category": "world-news",
            "image": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=200",
            "tags": "world,space,exploration,science"
        },
        {
            "title": "Global Education Initiatives Transform Learning",
            "slug": "global-education-initiatives-transform-learning",
            "content": "UNESCO and partner organizations launch innovative education programs worldwide...",
            "summary": "Digital learning platforms and international exchange programs revolutionize global education access.",
            "author": "Education Correspondent",
            "published_at": base_date - timedelta(days=3),
            "category": "world-news",
            "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200",
            "tags": "world,education,unesco,learning"
        }
    ])
    
    for article_data in articles_data:
        # Check if article already exists
        existing_article = db.query(models.Article).filter(models.Article.slug == article_data["slug"]).first()
        if not existing_article:
            article = models.Article(**article_data)
            db.add(article)
    
    db.commit()
    
    # Seed Movie Reviews
    movie_reviews_data = [
        {
            "title": "Spectacular Superhero Adventure",
            "movie_name": "The Cosmic Guardian",
            "director": "Alex Rodriguez",
            "cast": "Emma Stone, Chris Evans, Michael Shannon",
            "genre": "Action/Adventure",
            "rating": 8.5,
            "review_content": "A visually stunning superhero film that delivers on both action and emotional depth...",
            "reviewer": "James Wilson",
            "published_at": base_date - timedelta(days=2),
            "poster_image": "https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=300&h=450"
        },
        {
            "title": "Intimate Drama That Captivates",
            "movie_name": "Whispers in the Wind",
            "director": "Sarah Chen",
            "cast": "Viola Davis, Oscar Isaac, Lupita Nyong'o",
            "genre": "Drama",
            "rating": 9.2,
            "review_content": "A masterpiece of storytelling that explores the depths of human relationships...",
            "reviewer": "Maria Lopez",
            "published_at": base_date - timedelta(days=5),
            "poster_image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=450"
        },
        {
            "title": "Comedy Gold with Heart",
            "movie_name": "Late Night Laughs",
            "director": "Mike Johnson",
            "cast": "Tina Fey, Steve Carell, Mindy Kaling",
            "genre": "Comedy",
            "rating": 7.8,
            "review_content": "A hilarious comedy that doesn't forget to have a heart at its center...",
            "reviewer": "David Kim",
            "published_at": base_date - timedelta(days=10),
            "poster_image": "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=450"
        }
    ]
    
    for review_data in movie_reviews_data:
        # Check if review already exists
        existing_review = db.query(models.MovieReview).filter(models.MovieReview.movie_name == review_data["movie_name"]).first()
        if not existing_review:
            review = models.MovieReview(**review_data)
            db.add(review)
    
    db.commit()
    
    # Seed Featured Images
    featured_images_data = [
        {
            "title": "City Skyline at Sunset",
            "image_url": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600",
            "caption": "Beautiful city skyline captured during golden hour",
            "photographer": "John Smith",
            "location": "New York City",
            "display_order": 1
        },
        {
            "title": "Mountain Landscape",
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
            "caption": "Breathtaking mountain vista with morning mist",
            "photographer": "Jane Doe",
            "location": "Rocky Mountains",
            "display_order": 2
        },
        {
            "title": "Ocean Waves",
            "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600",
            "caption": "Powerful ocean waves crashing against the shore",
            "photographer": "Mike Wilson",
            "location": "Pacific Coast",
            "display_order": 3
        },
        {
            "title": "Forest Path",
            "image_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600",
            "caption": "Serene forest path surrounded by ancient trees",
            "photographer": "Sarah Johnson",
            "location": "Olympic National Park",
            "display_order": 4
        },
        {
            "title": "Desert Sunset",
            "image_url": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600",
            "caption": "Stunning sunset over the desert landscape",
            "photographer": "Carlos Rodriguez",
            "location": "Mojave Desert",
            "display_order": 5
        }
    ]
    
    for image_data in featured_images_data:
        # Check if image already exists
        existing_image = db.query(models.FeaturedImage).filter(models.FeaturedImage.title == image_data["title"]).first()
        if not existing_image:
            image = models.FeaturedImage(**image_data)
            db.add(image)
    
    db.commit()
    
    print(f"Database seeded successfully!")
    print(f"Categories: {len(categories_data)}")
    print(f"Articles: {len(articles_data)}")
    print(f"Movie Reviews: {len(movie_reviews_data)}")
    print(f"Featured Images: {len(featured_images_data)}")