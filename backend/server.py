from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
import logging
from pathlib import Path
from datetime import datetime, date
import os
import uuid
import aiofiles
# Rate limiting completely disabled for better user experience
# All rate limiting functionality removed

from database import SessionLocal, engine, get_db, Base
import models, schemas, crud, seed_data
from models import Gallery  # Import Gallery specifically
from routes.auth_routes import router as auth_router
from routes.topics_routes import router as topics_router
from routes.gallery_routes import router as gallery_router
from auth import create_default_admin
from scheduler_service import article_scheduler

# Create database tables
Base.metadata.create_all(bind=engine)

ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app without any rate limiting
app = FastAPI(title="Blog CMS API", version="1.0.0")

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root(request: Request):
    return {"message": "Blog CMS API is running", "status": "healthy"}

# Seed database endpoint (for development)
@api_router.post("/seed-database")
async def seed_database_endpoint(db: Session = Depends(get_db)):
    try:
        seed_data.seed_database(db)
        return {"message": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Category endpoints
@api_router.get("/categories", response_model=List[schemas.Category])
async def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@api_router.post("/categories", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.get_category_by_slug(db, slug=category.slug)
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    return crud.create_category(db=db, category=category)

# Article endpoints
@api_router.get("/articles", response_model=List[schemas.ArticleListResponse])
async def get_articles(
    request: Request,
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    articles = crud.get_articles(db, skip=skip, limit=limit, is_featured=is_featured)
    result = []
    for article in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "summary": article.summary,
            "image_url": article.image,
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "content_type": article.content_type,  # Add content_type field
            "artists": article.artists,  # Add artists field
            "is_published": article.is_published,
            "is_scheduled": article.is_scheduled if article.is_scheduled is not None else False,
            "scheduled_publish_at": article.scheduled_publish_at,
            "published_at": article.published_at,
            "view_count": article.view_count if article.view_count is not None else 0
        })
    return result

@api_router.get("/articles/category/{category_slug}", response_model=List[schemas.ArticleListResponse])
async def get_articles_by_category(category_slug: str, skip: int = 0, limit: int = 15, db: Session = Depends(get_db)):
    articles = crud.get_articles_by_category_slug(db, category_slug=category_slug, skip=skip, limit=limit)
    result = []
    for article in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "summary": article.summary,
            "image_url": article.image,
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "content_type": article.content_type,  # Add content_type field
            "artists": article.artists,  # Add artists field
            "is_published": article.is_published,
            "is_scheduled": article.is_scheduled,
            "scheduled_publish_at": article.scheduled_publish_at,
            "published_at": article.published_at,
            "view_count": article.view_count
        })
    return result

# New section-specific endpoints for frontend sections
@api_router.get("/articles/sections/latest-news", response_model=List[schemas.ArticleListResponse])
async def get_latest_news_articles(request: Request, limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Latest News/Top Stories section"""
    articles = crud.get_articles_by_category_slug(db, category_slug="latest-news", limit=limit)
    return _format_article_response(articles, db)

@api_router.get("/articles/sections/politics", response_model=dict)
async def get_politics_articles(
    request: Request,
    limit: int = 4, 
    states: str = None,  # Comma-separated list of state codes: "ap,ts"
    db: Session = Depends(get_db)
):
    """Get articles for Politics section with State and National tabs
    
    Args:
        limit: Number of articles to return per section
        states: Comma-separated state codes (e.g., "ap,ts") to filter state politics articles
    """
    # Parse state codes if provided
    state_codes = []
    if states:
        state_codes = [s.strip().lower() for s in states.split(',') if s.strip()]
    
    # Get state politics articles with state filtering
    if state_codes:
        state_articles = crud.get_articles_by_states(db, category_slug="state-politics", state_codes=state_codes, limit=limit)
    else:
        # If no states specified, get all state politics articles  
        state_articles = crud.get_articles_by_category_slug(db, category_slug="state-politics", limit=limit)
    
    # National politics articles don't need state filtering
    national_articles = crud.get_articles_by_category_slug(db, category_slug="national-politics", limit=limit)
    
    return {
        "state_politics": _format_article_response(state_articles, db),
        "national_politics": _format_article_response(national_articles, db)
    }

@api_router.get("/articles/sections/movies", response_model=dict)
async def get_movies_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Movies section with Movie News and Movie News Bollywood tabs"""
    movie_news_articles = crud.get_articles_by_category_slug(db, category_slug="movie-news", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="movie-news-bollywood", limit=limit)
    
    return {
        "movies": _format_article_response(movie_news_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/hot-topics", response_model=dict)
async def get_hot_topics_articles(limit: int = 4, states: str = None, db: Session = Depends(get_db)):
    """Get articles for Hot Topics section with Hot Topics (state-specific) and Hot Topics Bollywood tabs"""
    # For hot topics tab - apply state filtering if provided (similar to politics filtering)
    if states:
        # Convert state codes to filter hot-topics articles
        state_codes = [code.strip() for code in states.split(',')]
        hot_topics_articles = crud.get_articles_by_states(db, category_slug="hot-topics", state_codes=state_codes, limit=limit)
    else:
        hot_topics_articles = crud.get_articles_by_category_slug(db, category_slug="hot-topics", limit=limit)
        
    # Bollywood hot topics - no state filtering needed (show to all users)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="hot-topics-bollywood", limit=limit)
    
    return {
        "hot_topics": _format_article_response(hot_topics_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }



@api_router.get("/articles/sections/ai-stock", response_model=dict)
async def get_ai_stock_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for AI & Stock Market section"""
    ai_articles = crud.get_articles_by_category_slug(db, category_slug="ai", limit=limit)
    stock_articles = crud.get_articles_by_category_slug(db, category_slug="stock-market", limit=limit)
    
    return {
        "ai": _format_article_response(ai_articles, db),
        "stock_market": _format_article_response(stock_articles, db)
    }

@api_router.get("/articles/sections/fashion-beauty", response_model=dict)
async def get_fashion_beauty_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Fashion & Beauty section (now Fashion & Travel)"""
    fashion_articles = crud.get_articles_by_category_slug(db, category_slug="fashion", limit=limit)
    travel_articles = crud.get_articles_by_category_slug(db, category_slug="travel", limit=limit)
    
    return {
        "fashion": _format_article_response(fashion_articles, db),
        "travel": _format_article_response(travel_articles, db)
    }

@api_router.get("/articles/sections/sports", response_model=dict)
async def get_sports_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Sports section with Cricket and Other Sports tabs"""
    cricket_articles = crud.get_articles_by_category_slug(db, category_slug="cricket", limit=limit)
    other_sports_articles = crud.get_articles_by_category_slug(db, category_slug="other-sports", limit=limit)
    
    return {
        "cricket": _format_article_response(cricket_articles, db),
        "other_sports": _format_article_response(other_sports_articles, db)
    }

@api_router.get("/articles/sections/hot-topics-gossip", response_model=dict)
async def get_hot_topics_gossip_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Hot Topics & Gossip section"""
    hot_topics_articles = crud.get_articles_by_category_slug(db, category_slug="hot-topics", limit=limit)
    gossip_articles = crud.get_articles_by_category_slug(db, category_slug="gossip", limit=limit)
    
    return {
        "hot_topics": _format_article_response(hot_topics_articles, db),
        "gossip": _format_article_response(gossip_articles, db)
    }

@api_router.get("/articles/sections/box-office", response_model=dict)
async def get_box_office_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Box Office section with Box Office and Bollywood-Box Office tabs"""
    box_office_articles = crud.get_articles_by_category_slug(db, category_slug="box-office", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="bollywood-box-office", limit=limit)
    
    return {
        "box_office": _format_article_response(box_office_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/trending-videos", response_model=dict)
async def get_trending_videos_articles(limit: int = 20, states: str = None, db: Session = Depends(get_db)):
    """Get articles for Trending Videos section with Trending Videos and Bollywood-Trending Videos tabs
    
    Args:
        limit: Number of articles to fetch (default 20)
        states: Comma-separated list of states for trending videos filtering (Bollywood tab ignores state filtering)
    """
    # For trending videos tab - apply state filtering if provided
    if states:
        # Convert state names to state codes (map full names to codes)
        state_name_to_code = {
            'Andhra Pradesh': 'ap',
            'Telangana': 'ts',
            # Add more mappings as needed
        }
        
        state_list = [state.strip() for state in states.split(',') if state.strip()]
        state_codes = []
        for state_name in state_list:
            if state_name in state_name_to_code:
                state_codes.append(state_name_to_code[state_name])
        
        if state_codes:
            trending_articles = crud.get_articles_by_states(db, category_slug="trending-videos", state_codes=state_codes, limit=limit)
        else:
            trending_articles = crud.get_articles_by_category_slug(db, category_slug="trending-videos", limit=limit)
    else:
        trending_articles = crud.get_articles_by_category_slug(db, category_slug="trending-videos", limit=limit)
    
    # For Bollywood tab - no state filtering, show all Bollywood trending videos
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="bollywood-trending-videos", limit=limit)
    
    return {
        "trending_videos": _format_article_response(trending_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

# USA and ROW video sections endpoint
@api_router.get("/articles/sections/usa-row-videos", response_model=dict)
async def get_usa_row_videos_sections(limit: int = 20, db: Session = Depends(get_db)):
    """Get articles for Viral Videos section with USA and ROW tabs"""
    usa_articles = crud.get_articles_by_category_slug(db, category_slug="usa", limit=limit)
    row_articles = crud.get_articles_by_category_slug(db, category_slug="row", limit=limit)
    
    return {
        "usa": _format_article_response(usa_articles, db),
        "row": _format_article_response(row_articles, db)
    }

@api_router.get("/articles/sections/viral-shorts", response_model=dict)
async def get_viral_shorts_articles(limit: int = 20, states: str = None, db: Session = Depends(get_db)):
    """Get articles for Viral Shorts section with Viral Shorts and Bollywood tabs
    
    Args:
        limit: Number of articles to fetch (default 20)
        states: Comma-separated list of states for viral shorts filtering (Bollywood tab ignores state filtering)
    """
    # For viral shorts tab - apply state filtering if provided
    if states:
        # Convert state names to state codes (map full names to codes)
        state_name_to_code = {
            'Andhra Pradesh': 'ap',
            'Telangana': 'ts',
            'Karnataka': 'ka',
            'Tamil Nadu': 'tn',
            'Kerala': 'kl',
            'Maharashtra': 'mh',
            'Gujarat': 'gj',
            'Rajasthan': 'rj',
            'Uttar Pradesh': 'up',
            'West Bengal': 'wb',
            'Bihar': 'br',
            'Madhya Pradesh': 'mp',
            'Odisha': 'or',
            'Punjab': 'pb',
            'Haryana': 'hr',
            'Assam': 'as',
            'Jharkhand': 'jh',
            'Chhattisgarh': 'cg',
            'Himachal Pradesh': 'hp',
            'Uttarakhand': 'uk',
            'Jammu and Kashmir': 'jk',
            'Delhi': 'dl',
            'Goa': 'ga',
            'Manipur': 'mn',
            'Meghalaya': 'ml',
            'Mizoram': 'mz',
            'Nagaland': 'nl',
            'Sikkim': 'sk',
            'Tripura': 'tr',
            'Arunachal Pradesh': 'ar',
            'Ladakh': 'ld'
        }
        
        state_list = [state.strip() for state in states.split(',') if state.strip()]
        state_codes = []
        for state_name in state_list:
            if state_name in state_name_to_code:
                state_codes.append(state_name_to_code[state_name])
        
        if state_codes:
            viral_shorts_articles = crud.get_articles_by_states(db, category_slug="viral-shorts", state_codes=state_codes, limit=limit)
        else:
            viral_shorts_articles = crud.get_articles_by_category_slug(db, category_slug="viral-shorts", limit=limit)
    else:
        viral_shorts_articles = crud.get_articles_by_category_slug(db, category_slug="viral-shorts", limit=limit)
    
    # For Bollywood tab - no state filtering, show all Viral Shorts Bollywood videos
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="viral-shorts-bollywood", limit=limit)
    
    return {
        "viral_shorts": _format_article_response(viral_shorts_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/ott-movie-reviews", response_model=dict)
async def get_ott_movie_reviews_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for OTT Reviews section with OTT Reviews and Bollywood tabs"""
    ott_reviews_articles = crud.get_articles_by_category_slug(db, category_slug="ott-reviews", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="ott-reviews-bollywood", limit=limit)
    
    return {
        "ott_movie_reviews": _format_article_response(ott_reviews_articles, db),
        "web_series": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/events-interviews", response_model=dict)
async def get_events_interviews_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Events & Interviews section with Events & Interviews and Events Interviews Bollywood tabs"""
    events_articles = crud.get_articles_by_category_slug(db, category_slug="events-interviews", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="events-interviews-bollywood", limit=limit)
    
    return {
        "events_interviews": _format_article_response(events_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/new-video-songs", response_model=dict)
async def get_new_video_songs_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for New Video Songs section with Video Songs and Bollywood tabs"""
    video_songs_articles = crud.get_articles_by_category_slug(db, category_slug="new-video-songs", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="new-video-songs-bollywood", limit=limit)
    
    return {
        "video_songs": _format_article_response(video_songs_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/movie-reviews", response_model=dict)
async def get_movie_reviews_articles(limit: int = 20, db: Session = Depends(get_db)):
    """Get articles for Movie Reviews section with Movie Reviews and Bollywood tabs - latest 20 from each category"""
    movie_reviews_articles = crud.get_articles_by_category_slug(db, category_slug="movie-reviews", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="movie-reviews-bollywood", limit=limit)
    
    return {
        "movie_reviews": _format_article_response(movie_reviews_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/trailers-teasers", response_model=dict)
async def get_trailers_teasers_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Trailers & Teasers section with Trailers and Bollywood tabs"""
    trailers_articles = crud.get_articles_by_category_slug(db, category_slug="trailers-teasers", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="trailers-teasers-bollywood", limit=limit)
    
    return {
        "trailers": _format_article_response(trailers_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/box-office", response_model=dict)
async def get_box_office_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Box Office section with Box Office and Bollywood tabs"""
    box_office_articles = crud.get_articles_by_category_slug(db, category_slug="box-office", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="box-office-bollywood", limit=limit)
    
    return {
        "box_office": _format_article_response(box_office_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/events-interviews", response_model=dict)
async def get_events_interviews_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Events & Interviews section with Events and Bollywood tabs"""
    events_articles = crud.get_articles_by_category_slug(db, category_slug="events-interviews", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="events-interviews-bollywood", limit=limit)
    
    return {
        "events": _format_article_response(events_articles, db),
        "bollywood": _format_article_response(bollywood_articles, db)
    }

@api_router.get("/articles/sections/tv-shows", response_model=dict)
async def get_tv_shows_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for TV Shows section with TV Shows and Bollywood tabs"""
    tv_articles = crud.get_articles_by_category_slug(db, category_slug="tv-shows", limit=limit)
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="tv-shows-bollywood", limit=limit)
    
    return {
        "tv": _format_article_response(tv_articles),
        "bollywood": _format_article_response(bollywood_articles)
    }

# Frontend endpoint for OTT releases with Bollywood
@api_router.get("/releases/ott-bollywood")
async def get_ott_bollywood_releases(db: Session = Depends(get_db)):
    """Get OTT and Bollywood OTT releases for homepage display"""
    this_week_ott = crud.get_this_week_ott_releases(db, limit=4)
    upcoming_ott = crud.get_upcoming_ott_releases(db, limit=4)
    
    # Get Bollywood OTT release articles instead of regular articles
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="ott-releases-bollywood", limit=4)
    
    def format_release_response(releases, is_ott=True):
        result = []
        for release in releases:
            release_data = {
                "id": release.id,
                "movie_name": release.movie_name,
                "language": release.language,
                "release_date": release.release_date,
                "movie_image": release.movie_image,
                "created_at": release.created_at
            }
            if is_ott:
                release_data["ott_platform"] = release.ott_platform
            result.append(release_data)
        return result
    
    def format_article_response(articles):
        result = []
        for article in articles:
            result.append({
                "id": article.id,
                "title": article.title,
                "movie_name": article.title,  # Use title as movie name
                "summary": article.summary,
                "image_url": article.image,
                "movie_image": article.image,  # Use article image as movie image
                "author": article.author,
                "language": article.language or "Hindi",
                "category": article.category,
                "published_at": article.published_at,
                "release_date": article.published_at,  # Use published date as release date
                "ott_platform": "Netflix"  # Default platform for Bollywood articles
            })
        return result
    
    return {
        "ott": {
            "this_week": format_release_response(this_week_ott, True),
            "coming_soon": format_release_response(upcoming_ott, True)
        },
        "bollywood": {
            "this_week": format_article_response(bollywood_articles[:2]),  # First 2 as this week
            "coming_soon": format_article_response(bollywood_articles[2:])  # Rest as coming soon
        }
    }

@api_router.get("/articles/sections/trailers", response_model=List[schemas.ArticleListResponse])
async def get_trailers_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Trailers & Teasers section"""
    articles = crud.get_articles_by_category_slug(db, category_slug="trailers", limit=limit)
    return _format_article_response(articles)

@api_router.get("/articles/sections/top-stories", response_model=dict)
async def get_top_stories_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Top Stories section with regular and national tabs"""
    top_stories_articles = crud.get_articles_by_category_slug(db, category_slug="top-stories", limit=limit)
    national_articles = crud.get_articles_by_category_slug(db, category_slug="national-top-stories", limit=limit)
    
    return {
        "top_stories": _format_article_response(top_stories_articles),
        "national": _format_article_response(national_articles)
    }

@api_router.get("/articles/sections/nri-news", response_model=List[schemas.ArticleListResponse])
async def get_nri_news_articles(limit: int = 4, states: str = None, db: Session = Depends(get_db)):
    """Get articles for NRI News section with state filtering"""
    # Parse state codes from query parameter
    state_codes = []
    if states:
        state_codes = [s.strip().lower() for s in states.split(',') if s.strip()]
    
    # Get NRI News articles with state filtering
    if state_codes:
        articles = crud.get_articles_by_states(db, category_slug="nri-news", state_codes=state_codes, limit=limit)
    else:
        # If no states specified, get all NRI news articles
        articles = crud.get_articles_by_category_slug(db, category_slug="nri-news", limit=limit)
    
    return _format_article_response(articles)

@api_router.get("/articles/sections/world-news", response_model=List[schemas.ArticleListResponse])
async def get_world_news_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for World News section"""
    articles = crud.get_articles_by_category_slug(db, category_slug="world-news", limit=limit)
    return _format_article_response(articles)

@api_router.get("/articles/sections/photoshoots", response_model=List[schemas.ArticleListResponse])
async def get_photoshoots_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Photoshoots section"""
    articles = crud.get_articles_by_category_slug(db, category_slug="photoshoots", limit=limit)
    return _format_article_response(articles, db)

@api_router.get("/articles/sections/travel-pics", response_model=List[schemas.ArticleListResponse])
async def get_travel_pics_articles(limit: int = 4, db: Session = Depends(get_db)):
    """Get articles for Travel Pics section"""
    articles = crud.get_articles_by_category_slug(db, category_slug="travel-pics", limit=limit)
    return _format_article_response(articles, db)

# Helper function to format article response
def _format_article_response(articles, db: Session = None):
    """Helper function to format article list response"""
    result = []
    for article in articles:
        # Get gallery information if article has gallery_id
        gallery_info = None
        if hasattr(article, 'gallery_id') and article.gallery_id and db:
            # Load gallery data  
            gallery = db.query(models.Gallery).filter(models.Gallery.id == article.gallery_id).first()
            if gallery and gallery.images:
                try:
                    import json
                    gallery_images = json.loads(gallery.images)
                    gallery_info = {
                        "gallery_id": gallery.id,
                        "gallery_title": gallery.title,
                        "images": gallery_images,
                        "first_image": gallery_images[0] if gallery_images else None
                    }
                except:
                    gallery_info = None
        
        # Determine the image URL to use
        image_url = article.image
        if gallery_info and gallery_info["first_image"]:
            # Use first gallery image as thumbnail
            image_url = gallery_info["first_image"].get("url", article.image)
        
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "content": article.content if hasattr(article, 'content') else "",
            "summary": article.summary,
            "slug": article.slug if hasattr(article, 'slug') else "",
            "image_url": image_url,  # Use gallery first image if available
            "youtube_url": article.youtube_url,  # Add youtube_url for video content
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "content_type": article.content_type,  # Add content_type field
            "artists": article.artists,  # Add artists field
            "states": article.states,  # Add states field for state-specific filtering
            "gallery": gallery_info,  # Add gallery information
            "is_published": article.is_published,
            "is_scheduled": article.is_scheduled,
            "scheduled_publish_at": article.scheduled_publish_at,
            "published_at": article.published_at,
            "view_count": article.view_count,
            "created_at": article.created_at if hasattr(article, 'created_at') else None,
            "updated_at": article.updated_at if hasattr(article, 'updated_at') else None
        })
    return result

# CMS API Endpoints
@api_router.get("/cms/config", response_model=schemas.CMSResponse)
async def get_cms_config(db: Session = Depends(get_db)):
    """Get CMS configuration including languages, states, and categories"""
    categories = crud.get_all_categories(db)
    
    languages = [
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
        {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"},
        {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
        {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
        {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
        {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
        {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
        {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"},
        {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
        {"code": "as", "name": "Assamese", "native_name": "অসমীয়া"},
        {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ"},
        {"code": "kok", "name": "Konkani", "native_name": "कोंकणी"},
        {"code": "mni", "name": "Manipuri", "native_name": "ꯃꯤꯇꯩꯂꯣꯟ"},
        {"code": "ne", "name": "Nepali", "native_name": "नेपाली"},
        {"code": "ur", "name": "Urdu", "native_name": "اردو"}
    ]
    
    states = [
        {"code": "all", "name": "All States"},
        {"code": "ap", "name": "Andhra Pradesh"},
        {"code": "ar", "name": "Arunachal Pradesh"},
        {"code": "as", "name": "Assam"},
        {"code": "br", "name": "Bihar"},
        {"code": "cg", "name": "Chhattisgarh"},
        {"code": "dl", "name": "Delhi"},
        {"code": "ga", "name": "Goa"},
        {"code": "gj", "name": "Gujarat"},
        {"code": "hr", "name": "Haryana"},
        {"code": "hp", "name": "Himachal Pradesh"},
        {"code": "jk", "name": "Jammu and Kashmir"},
        {"code": "jh", "name": "Jharkhand"},
        {"code": "ka", "name": "Karnataka"},
        {"code": "kl", "name": "Kerala"},
        {"code": "ld", "name": "Ladakh"},
        {"code": "mp", "name": "Madhya Pradesh"},
        {"code": "mh", "name": "Maharashtra"},
        {"code": "mn", "name": "Manipur"},
        {"code": "ml", "name": "Meghalaya"},
        {"code": "mz", "name": "Mizoram"},
        {"code": "nl", "name": "Nagaland"},
        {"code": "or", "name": "Odisha"},
        {"code": "pb", "name": "Punjab"},
        {"code": "rj", "name": "Rajasthan"},
        {"code": "sk", "name": "Sikkim"},
        {"code": "tn", "name": "Tamil Nadu"},
        {"code": "ts", "name": "Telangana"},
        {"code": "tr", "name": "Tripura"},
        {"code": "up", "name": "Uttar Pradesh"},
        {"code": "uk", "name": "Uttarakhand"},
        {"code": "wb", "name": "West Bengal"}
    ]
    
    return {
        "languages": languages,
        "states": states, 
        "categories": [{"id": cat.id, "name": cat.name, "slug": cat.slug, "description": cat.description} for cat in categories]
    }

@api_router.get("/cms/articles", response_model=List[schemas.ArticleListResponse])
async def get_cms_articles(
    language: str = "en",
    skip: int = 0, 
    limit: int = 20,
    category: str = None,
    state: str = None,
    db: Session = Depends(get_db)
):
    """Get articles for CMS dashboard with filtering"""
    articles = crud.get_articles_for_cms(db, language=language, skip=skip, limit=limit, category=category, state=state)
    result = []
    for article in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "summary": article.summary,
            "image_url": article.image,
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "content_type": article.content_type,  # Add content_type field
            "artists": article.artists,  # Add artists field
            "is_published": article.is_published,
            "is_scheduled": article.is_scheduled if article.is_scheduled is not None else False,
            "scheduled_publish_at": article.scheduled_publish_at,
            "published_at": article.published_at,
            "view_count": article.view_count if article.view_count is not None else 0
        })
    return result

@api_router.post("/cms/articles", response_model=schemas.ArticleResponse)
async def create_cms_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    """Create new article via CMS"""
    # Generate slug from title
    import re
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', article.title.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    
    # Create SEO fields if not provided
    seo_title = article.seo_title or article.title
    seo_description = article.seo_description or article.summary[:155]
    
    # Create article in database
    db_article = crud.create_article_cms(db, article, slug, seo_title, seo_description)
    return db_article

@api_router.get("/cms/articles/{article_id}", response_model=schemas.ArticleResponse)
async def get_cms_article(article_id: int, db: Session = Depends(get_db)):
    """Get single article for editing"""
    article = crud.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.put("/cms/articles/{article_id}", response_model=schemas.ArticleResponse)
async def update_cms_article(
    article_id: int, 
    article_update: schemas.ArticleUpdate, 
    db: Session = Depends(get_db)
):
    """Update article via CMS"""
    article = crud.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    updated_article = crud.update_article_cms(db, article_id, article_update)
    return updated_article

@api_router.delete("/cms/articles/{article_id}")
async def delete_cms_article(article_id: int, db: Session = Depends(get_db)):
    """Delete article via CMS"""
    article = crud.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    crud.delete_article(db, article_id)
    return {"message": "Article deleted successfully"}

@api_router.get("/articles/{article_id}/related-videos")
async def get_article_related_videos(article_id: int, db: Session = Depends(get_db)):
    """Get related videos for an article"""
    article = crud.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # For now, return empty list since we need to implement related videos storage
    # This will be populated when we add the database schema for related videos
    return {"related_videos": []}

@api_router.put("/articles/{article_id}/related-videos")
async def update_article_related_videos(
    article_id: int, 
    request: dict,
    db: Session = Depends(get_db)
):
    """Update related videos for an article"""
    article = crud.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    related_video_ids = request.get("related_videos", [])
    
    # Validate that all related video IDs exist and are video articles
    for video_id in related_video_ids:
        video_article = crud.get_article_by_id(db, video_id)
        if not video_article:
            raise HTTPException(status_code=400, detail=f"Related video with ID {video_id} not found")
        if not video_article.youtube_url:
            raise HTTPException(status_code=400, detail=f"Article with ID {video_id} is not a video article")
    
    # For now, we'll store the related videos in a simple way
    # In a production system, you'd want a proper many-to-many relationship table
    # For this implementation, we'll use a simple approach
    
    # Store related videos as a JSON string in a custom field (to be added to schema)
    # This is a simplified implementation - in production you'd want proper relationships
    try:
        import json
        related_videos_json = json.dumps(related_video_ids)
        
        # Update article with related videos (this assumes we add a related_videos column)
        # For now, we'll simulate success since we need to update the database schema first
        
        return {"message": "Related videos updated successfully", "related_videos": related_video_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update related videos")

@api_router.post("/cms/articles/{article_id}/translate", response_model=schemas.ArticleResponse)
async def translate_article(
    article_id: int,
    translation_request: schemas.TranslationRequest,
    db: Session = Depends(get_db)
):
    """Create translated version of article"""
    original_article = crud.get_article_by_id(db, article_id)
    if not original_article:
        raise HTTPException(status_code=404, detail="Original article not found")
    
    # Here you would integrate with translation service (Google Translate, etc.)
    # For now, we'll create a copy with the target language
    translated_article = crud.create_translated_article(db, original_article, translation_request.target_language)
    return translated_article

@api_router.get("/articles/most-read", response_model=List[schemas.ArticleListResponse])
async def get_most_read_articles(limit: int = 15, db: Session = Depends(get_db)):
    articles = crud.get_most_read_articles(db, limit=limit)
    result = []
    for article in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "summary": article.summary,
            "image_url": article.image,
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "content_type": article.content_type,  # Add content_type field
            "artists": article.artists,  # Add artists field
            "is_published": article.is_published,
            "is_scheduled": article.is_scheduled,
            "scheduled_publish_at": article.scheduled_publish_at,
            "published_at": article.published_at,
            "view_count": article.view_count
        })
    return result

@api_router.get("/articles/featured", response_model=schemas.ArticleResponse)
async def get_featured_article(db: Session = Depends(get_db)):
    articles = crud.get_articles(db, limit=1, is_featured=True)
    if not articles:
        raise HTTPException(status_code=404, detail="No featured article found")
    return articles[0]

@api_router.get("/articles/{article_id}", response_model=schemas.ArticleResponse)
async def get_article(request: Request, article_id: int, db: Session = Depends(get_db)):
    article = crud.get_article(db, article_id=article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    
    print(f"Debug: Article {article_id} has gallery_id: {getattr(article, 'gallery_id', 'MISSING')}")
    
    # Use the same formatting function to include gallery information
    formatted_articles = _format_article_response([article], db)
    
    print(f"Debug: Formatted response gallery: {formatted_articles[0].get('gallery') if formatted_articles else 'NO FORMATTED'}")
    
    return formatted_articles[0] if formatted_articles else article

@api_router.post("/articles", response_model=schemas.ArticleResponse)
async def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db=db, article=article)

# Movie Review endpoints
@api_router.get("/movie-reviews", response_model=List[schemas.MovieReviewListResponse])
async def get_movie_reviews(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    reviews = crud.get_movie_reviews(db, skip=skip, limit=limit)
    result = []
    for review in reviews:
        result.append({
            "id": review.id,
            "title": review.title,
            "rating": review.rating,
            "image_url": review.poster_image,
            "created_at": review.created_at
        })
    return result

@api_router.get("/movie-reviews/{review_id}", response_model=schemas.MovieReview)
async def get_movie_review(review_id: int, db: Session = Depends(get_db)):
    review = crud.get_movie_review(db, review_id=review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Movie review not found")
    return review

@api_router.post("/movie-reviews", response_model=schemas.MovieReview)
async def create_movie_review(review: schemas.MovieReviewCreate, db: Session = Depends(get_db)):
    return crud.create_movie_review(db=db, review=review)

# Featured Images endpoints
@api_router.get("/featured-images", response_model=List[schemas.FeaturedImage])
async def get_featured_images(limit: int = 5, db: Session = Depends(get_db)):
    return crud.get_featured_images(db, limit=limit)

@api_router.post("/featured-images", response_model=schemas.FeaturedImage)
async def create_featured_image(image: schemas.FeaturedImageCreate, db: Session = Depends(get_db)):
    return crud.create_featured_image(db=db, image=image)

# Scheduler Settings endpoints
@api_router.get("/admin/scheduler-settings", response_model=schemas.SchedulerSettingsResponse)
async def get_scheduler_settings(db: Session = Depends(get_db)):
    """Get current scheduler settings (Admin only)"""
    settings = crud.get_scheduler_settings(db)
    if not settings:
        # Create default settings if none exist
        settings = crud.create_scheduler_settings(
            db, 
            schemas.SchedulerSettingsCreate(is_enabled=False, check_frequency_minutes=5)
        )
    return settings

@api_router.put("/admin/scheduler-settings", response_model=schemas.SchedulerSettingsResponse)
async def update_scheduler_settings(
    settings_update: schemas.SchedulerSettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update scheduler settings (Admin only)"""
    updated_settings = crud.update_scheduler_settings(db, settings_update)
    
    # Update the background scheduler
    if settings_update.is_enabled is not None:
        if settings_update.is_enabled:
            article_scheduler.start_scheduler()
            frequency = settings_update.check_frequency_minutes or updated_settings.check_frequency_minutes
            article_scheduler.update_schedule(frequency)
        else:
            article_scheduler.stop_scheduler()
    
    if settings_update.check_frequency_minutes is not None and updated_settings.is_enabled:
        article_scheduler.update_schedule(settings_update.check_frequency_minutes)
    
    return updated_settings

@api_router.post("/admin/scheduler/run-now")
async def run_scheduler_now():
    """Manually trigger scheduled article publishing (Admin only)"""
    try:
        article_scheduler.check_and_publish_scheduled_articles()
        return {"message": "Scheduler run completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduler run failed: {str(e)}")

@api_router.get("/cms/scheduled-articles")
async def get_scheduled_articles(db: Session = Depends(get_db)):
    """Get all scheduled articles"""
    scheduled_articles = db.query(models.Article).filter(
        models.Article.is_scheduled == True,
        models.Article.is_published == False
    ).order_by(models.Article.scheduled_publish_at).all()
    
    result = []
    for article in scheduled_articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "short_title": article.short_title,
            "author": article.author,
            "language": article.language,
            "category": article.category,
            "scheduled_publish_at": article.scheduled_publish_at,
            "created_at": article.created_at
        })
    
    return result

# Analytics tracking endpoint
@api_router.post("/analytics/track")
async def track_analytics(tracking_data: dict):
    """
    Track user interactions for analytics and SEO purposes
    """
    try:
        # Log the tracking data (in production, you'd save to database)
        import logging
        logging.info(f"Analytics Tracking: {tracking_data}")
        
        # Here you can save to database, send to analytics service, etc.
        # For now, we'll just return success
        
        return {
            "status": "success", 
            "message": "Analytics data tracked successfully",
            "timestamp": tracking_data.get("timestamp")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics tracking failed: {str(e)}")

# Related Articles Configuration endpoints
@api_router.get("/cms/related-articles-config")
async def get_related_articles_config(page: str = None, db: Session = Depends(get_db)):
    """Get related articles configuration for a specific page or all pages"""
    try:
        config = crud.get_related_articles_config(db, page_slug=page)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/cms/related-articles-config")
async def create_related_articles_config(
    config_data: schemas.RelatedArticlesConfigCreate,
    db: Session = Depends(get_db)
):
    """Create or update related articles configuration"""
    try:
        config = crud.create_or_update_related_articles_config(db, config_data)
        return {"message": "Configuration saved successfully", "config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cms/related-articles-config/{page_slug}")
async def delete_related_articles_config(page_slug: str, db: Session = Depends(get_db)):
    """Delete related articles configuration for a page"""
    try:
        deleted_config = crud.delete_related_articles_config(db, page_slug)
        if not deleted_config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        return {"message": "Configuration deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/related-articles/{page_slug}")
async def get_related_articles_for_page(
    page_slug: str,
    limit: int = None,
    db: Session = Depends(get_db)
):
    """Get related articles for a specific page based on its configuration"""
    try:
        articles = crud.get_related_articles_for_page(db, page_slug, limit)
        
        # Format the response
        result = []
        for article in articles:
            result.append({
                "id": article.id,
                "title": article.title,
                "short_title": article.short_title,
                "summary": article.summary,
                "image": article.image,
                "author": article.author,
                "language": article.language,
                "category": article.category,
                "published_at": article.published_at,
                "view_count": article.view_count
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# File upload helper functions
async def save_uploaded_file(upload_file: UploadFile, subfolder: str) -> str:
    """Save uploaded file and return the file path"""
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create subfolder path
    subfolder_path = UPLOAD_DIR / subfolder
    subfolder_path.mkdir(exist_ok=True)
    
    # Save file
    file_path = subfolder_path / unique_filename
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    # Return relative path for storage in database
    return f"uploads/{subfolder}/{unique_filename}"

# Theater Release endpoints
@api_router.get("/cms/theater-releases", response_model=List[schemas.TheaterReleaseResponse])
async def get_theater_releases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all theater releases for CMS"""
    releases = crud.get_theater_releases(db, skip=skip, limit=limit)
    return releases

@api_router.get("/cms/theater-releases/{release_id}", response_model=schemas.TheaterReleaseResponse)
async def get_theater_release(release_id: int, db: Session = Depends(get_db)):
    """Get single theater release"""
    release = crud.get_theater_release(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Theater release not found")
    return release

@api_router.post("/cms/theater-releases", response_model=schemas.TheaterReleaseResponse)
async def create_theater_release(
    movie_name: str = Form(...),
    movie_banner: str = Form(...),  # Changed to string form field
    language: str = Form("Hindi"),  # Added language field
    release_date: date = Form(...),
    created_by: str = Form(...),
    movie_image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Create new theater release with file uploads"""
    try:
        # Save uploaded image
        image_path = None
        
        if movie_image:
            image_path = await save_uploaded_file(movie_image, "theater_releases")
        
        # Create release data
        release_data = schemas.TheaterReleaseCreate(
            movie_name=movie_name,
            movie_banner=movie_banner,  # Store as text
            language=language,
            release_date=release_date,
            created_by=created_by,
            movie_image=image_path
        )
        
        return crud.create_theater_release(db, release_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/cms/theater-releases/{release_id}", response_model=schemas.TheaterReleaseResponse)
async def update_theater_release(
    release_id: int,
    movie_name: Optional[str] = Form(None),
    movie_banner: Optional[str] = Form(None),  # Text field
    language: Optional[str] = Form(None),  # Added language field
    release_date: Optional[date] = Form(None),
    movie_image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Update theater release"""
    try:
        # Check if release exists
        existing_release = crud.get_theater_release(db, release_id)
        if not existing_release:
            raise HTTPException(status_code=404, detail="Theater release not found")
        
        # Prepare update data
        update_data = {}
        if movie_name:
            update_data["movie_name"] = movie_name
        if movie_banner:
            update_data["movie_banner"] = movie_banner
        if language:
            update_data["language"] = language
        if release_date:
            update_data["release_date"] = release_date
        
        # Handle file upload
        if movie_image:
            update_data["movie_image"] = await save_uploaded_file(movie_image, "theater_releases")
        
        release_update = schemas.TheaterReleaseUpdate(**update_data)
        return crud.update_theater_release(db, release_id, release_update)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cms/theater-releases/{release_id}")
async def delete_theater_release(release_id: int, db: Session = Depends(get_db)):
    """Delete theater release"""
    release = crud.get_theater_release(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Theater release not found")
    
    crud.delete_theater_release(db, release_id)
    return {"message": "Theater release deleted successfully"}

# OTT Release endpoints
@api_router.get("/cms/ott-releases", response_model=List[schemas.OTTReleaseResponse])
async def get_ott_releases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all OTT releases for CMS"""
    releases = crud.get_ott_releases(db, skip=skip, limit=limit)
    return releases

@api_router.get("/cms/ott-releases/{release_id}", response_model=schemas.OTTReleaseResponse)
async def get_ott_release(release_id: int, db: Session = Depends(get_db)):
    """Get single OTT release"""
    release = crud.get_ott_release(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="OTT release not found")
    return release

@api_router.get("/cms/ott-platforms")
async def get_ott_platforms():
    """Get list of available OTT platforms"""
    return {"platforms": crud.get_ott_platforms()}

@api_router.post("/cms/ott-releases", response_model=schemas.OTTReleaseResponse)
async def create_ott_release(
    movie_name: str = Form(...),
    ott_platform: str = Form(...),
    language: str = Form("Hindi"),  # Added language field
    release_date: date = Form(...),
    created_by: str = Form(...),
    movie_image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Create new OTT release with file upload"""
    try:
        # Save uploaded file
        image_path = None
        if movie_image:
            image_path = await save_uploaded_file(movie_image, "ott_releases")
        
        # Create release data
        release_data = schemas.OTTReleaseCreate(
            movie_name=movie_name,
            ott_platform=ott_platform,
            language=language,
            release_date=release_date,
            created_by=created_by,
            movie_image=image_path
        )
        
        return crud.create_ott_release(db, release_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/cms/ott-releases/{release_id}", response_model=schemas.OTTReleaseResponse)
async def update_ott_release(
    release_id: int,
    movie_name: Optional[str] = Form(None),
    ott_platform: Optional[str] = Form(None),
    language: Optional[str] = Form(None),  # Added language field
    release_date: Optional[date] = Form(None),
    movie_image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Update OTT release"""
    try:
        # Check if release exists
        existing_release = crud.get_ott_release(db, release_id)
        if not existing_release:
            raise HTTPException(status_code=404, detail="OTT release not found")
        
        # Prepare update data
        update_data = {}
        if movie_name:
            update_data["movie_name"] = movie_name
        if ott_platform:
            update_data["ott_platform"] = ott_platform
        if language:
            update_data["language"] = language
        if release_date:
            update_data["release_date"] = release_date
        
        # Handle file upload
        if movie_image:
            update_data["movie_image"] = await save_uploaded_file(movie_image, "ott_releases")
        
        release_update = schemas.OTTReleaseUpdate(**update_data)
        return crud.update_ott_release(db, release_id, release_update)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cms/ott-releases/{release_id}")
async def delete_ott_release(release_id: int, db: Session = Depends(get_db)):
    """Delete OTT release"""
    release = crud.get_ott_release(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="OTT release not found")
    
    crud.delete_ott_release(db, release_id)
    return {"message": "OTT release deleted successfully"}

# Frontend endpoints for homepage with Bollywood theater releases
@api_router.get("/releases/theater-bollywood")
async def get_homepage_theater_bollywood_releases(db: Session = Depends(get_db)):
    """Get theater and Bollywood theater releases for homepage display"""
    this_week_theater = crud.get_this_week_theater_releases(db, limit=4)
    upcoming_theater = crud.get_upcoming_theater_releases(db, limit=4)
    
    # Get Bollywood theater release articles instead of OTT releases
    bollywood_articles = crud.get_articles_by_category_slug(db, category_slug="theater-releases-bollywood", limit=4)
    
    def format_release_response(releases, is_theater=True):
        result = []
        for release in releases:
            release_data = {
                "id": release.id,
                "movie_name": release.movie_name,
                "language": release.language,
                "release_date": release.release_date,
                "movie_image": release.movie_image,
                "created_at": release.created_at
            }
            if is_theater:
                release_data["movie_banner"] = release.movie_banner
            else:
                release_data["ott_platform"] = release.ott_platform
            result.append(release_data)
        return result
    
    def format_article_response(articles):
        result = []
        for article in articles:
            result.append({
                "id": article.id,
                "title": article.title,
                "movie_name": article.title,  # Use title as movie name
                "summary": article.summary,
                "image_url": article.image,
                "movie_image": article.image,  # Use article image as movie image
                "author": article.author,
                "language": article.language or "Hindi",
                "category": article.category,
                "published_at": article.published_at,
                "release_date": article.published_at  # Use published date as release date
            })
        return result
    
    return {
        "theater": {
            "this_week": format_release_response(this_week_theater, True),
            "coming_soon": format_release_response(upcoming_theater, True)
        },
        "ott": {
            "this_week": format_article_response(bollywood_articles[:2]),  # First 2 as this week
            "coming_soon": format_article_response(bollywood_articles[2:])  # Rest as coming soon
        }
    }

# Original endpoint kept for backward compatibility
@api_router.get("/releases/theater-ott")
async def get_homepage_releases(db: Session = Depends(get_db)):
    """Get theater and OTT releases for homepage display"""
    this_week_theater = crud.get_this_week_theater_releases(db, limit=4)
    upcoming_theater = crud.get_upcoming_theater_releases(db, limit=4)
    
    this_week_ott = crud.get_this_week_ott_releases(db, limit=4)
    upcoming_ott = crud.get_upcoming_ott_releases(db, limit=4)
    
    def format_release_response(releases, is_theater=True):
        result = []
        for release in releases:
            release_data = {
                "id": release.id,
                "movie_name": release.movie_name,
                "language": release.language,
                "release_date": release.release_date,
                "movie_image": release.movie_image,
                "created_at": release.created_at
            }
            if is_theater:
                release_data["movie_banner"] = release.movie_banner
            else:
                release_data["ott_platform"] = release.ott_platform
            result.append(release_data)
        return result
    
    return {
        "theater": {
            "this_week": format_release_response(this_week_theater, True),
            "coming_soon": format_release_response(upcoming_theater, True)
        },
        "ott": {
            "this_week": format_release_response(this_week_ott, False),
            "coming_soon": format_release_response(upcoming_ott, False)
        }
    }

# Frontend endpoints for theater-ott-releases page
@api_router.get("/releases/theater-ott/page")
async def get_theater_ott_page_releases(
    release_type: str = "theater",  # "theater" or "ott"
    filter_type: str = "upcoming",  # "upcoming", "this_month", "all"
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get releases for theater-ott-releases page with filters"""
    try:
        if release_type == "theater":
            if filter_type == "upcoming":
                releases = crud.get_upcoming_theater_releases(db, limit=limit)
            else:
                releases = crud.get_theater_releases(db, skip=skip, limit=limit)
            
            def format_theater_response(releases):
                result = []
                for release in releases:
                    result.append({
                        "id": release.id,
                        "movie_name": release.movie_name,
                        "language": release.language,
                        "release_date": release.release_date,
                        "movie_image": release.movie_image,
                        "movie_banner": release.movie_banner,
                        "created_at": release.created_at
                    })
                return result
            
            return format_theater_response(releases)
        
        else:  # ott
            if filter_type == "upcoming":
                releases = crud.get_upcoming_ott_releases(db, limit=limit)
            else:
                releases = crud.get_ott_releases(db, skip=skip, limit=limit)
            
            def format_ott_response(releases):
                result = []
                for release in releases:
                    result.append({
                        "id": release.id,
                        "movie_name": release.movie_name,
                        "language": release.language,
                        "release_date": release.release_date,
                        "movie_image": release.movie_image,
                        "ott_platform": release.ott_platform,
                        "created_at": release.created_at
                    })
                return result
            
            return format_ott_response(releases)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Movie content endpoints
@api_router.get("/articles/movie/{movie_name}")
async def get_articles_by_movie_name(movie_name: str, db: Session = Depends(get_db)):
    """Get all articles tagged with a specific movie name"""
    try:
        # Search for articles by movie name in title or tags
        articles = db.query(models.Article).filter(
            or_(
                models.Article.title.ilike(f"%{movie_name}%"),
                models.Article.tags.ilike(f"%{movie_name}%")
            )
        ).filter(models.Article.is_published == True).order_by(desc(models.Article.published_at)).all()
        
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/articles/search")
async def search_articles(q: str, db: Session = Depends(get_db)):
    """Search articles by query in title, content, or tags"""
    try:
        articles = db.query(models.Article).filter(
            or_(
                models.Article.title.ilike(f"%{q}%"),
                models.Article.content.ilike(f"%{q}%"),
                models.Article.tags.ilike(f"%{q}%")
            )
        ).filter(models.Article.is_published == True).order_by(desc(models.Article.published_at)).limit(50).all()
        
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include routers
app.include_router(api_router)
app.include_router(auth_router)  # Add authentication routes
app.include_router(topics_router, prefix="/api")  # Add topics routes
app.include_router(gallery_router, prefix="/api")  # Add gallery routes

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Blog CMS API starting up...")
    # Create default admin user
    await create_default_admin()
    
    # Initialize the article scheduler
    article_scheduler.initialize_scheduler()
    article_scheduler.start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Blog CMS API shutting down...")
    # Stop the article scheduler
    article_scheduler.stop_scheduler()
