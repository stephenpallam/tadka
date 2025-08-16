#!/usr/bin/env python3
"""
Update Movies Categories Script
===============================

This script updates the category names:
- "Movies" -> "Movie News" 
- "Bollywood-Movies" -> "Movie News Bollywood"

And updates their slugs:
- "movies" -> "movie-news"
- "bollywood-movies" -> "movie-news-bollywood"
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models.database_models import Category

def update_movie_categories():
    """Update movie categories to new names and slugs"""
    db = SessionLocal()
    
    try:
        print("🔄 Updating movie categories...")
        
        # Update "Movies" category
        movies_category = db.query(Category).filter(Category.slug == "movies").first()
        if movies_category:
            old_name = movies_category.name
            old_slug = movies_category.slug
            
            movies_category.name = "Movie News"
            movies_category.slug = "movie-news"
            movies_category.description = "Movie news, updates and entertainment"
            
            print(f"✅ Updated: '{old_name}' (slug: '{old_slug}') -> '{movies_category.name}' (slug: '{movies_category.slug}')")
        else:
            print("❌ Movies category not found")
        
        # Update "Bollywood-Movies" category
        bollywood_category = db.query(Category).filter(Category.slug == "bollywood-movies").first()
        if bollywood_category:
            old_name = bollywood_category.name
            old_slug = bollywood_category.slug
            
            bollywood_category.name = "Movie News Bollywood"
            bollywood_category.slug = "movie-news-bollywood"
            bollywood_category.description = "Bollywood movie news and entertainment"
            
            print(f"✅ Updated: '{old_name}' (slug: '{old_slug}') -> '{bollywood_category.name}' (slug: '{bollywood_category.slug}')")
        else:
            print("❌ Bollywood-Movies category not found")
        
        # Update articles that use these categories
        print("\n🔄 Updating articles with new category names...")
        
        # Update articles in "movies" category
        movies_articles = db.query(Category).filter(Category.slug == "movies").first()
        if movies_articles:
            from models.database_models import Article
            articles_count = db.query(Article).filter(Article.category == "movies").count()
            if articles_count > 0:
                db.query(Article).filter(Article.category == "movies").update({"category": "movie-news"})
                print(f"✅ Updated {articles_count} articles from 'movies' to 'movie-news' category")
        
        # Update articles in "bollywood-movies" category  
        bollywood_articles = db.query(Category).filter(Category.slug == "bollywood-movies").first()
        if bollywood_articles:
            articles_count = db.query(Article).filter(Article.category == "bollywood-movies").count()
            if articles_count > 0:
                db.query(Article).filter(Article.category == "bollywood-movies").update({"category": "movie-news-bollywood"})
                print(f"✅ Updated {articles_count} articles from 'bollywood-movies' to 'movie-news-bollywood' category")
        
        # Commit all changes
        db.commit()
        print("\n🎉 Successfully updated movie categories!")
        
        # Verify the changes
        print("\n📋 Verification:")
        updated_movies = db.query(Category).filter(Category.slug == "movie-news").first()
        updated_bollywood = db.query(Category).filter(Category.slug == "movie-news-bollywood").first()
        
        if updated_movies:
            print(f"✅ Movie News: {updated_movies.name} (slug: {updated_movies.slug})")
        if updated_bollywood:
            print(f"✅ Movie News Bollywood: {updated_bollywood.name} (slug: {updated_bollywood.slug})")
            
    except Exception as e:
        print(f"❌ Error updating categories: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_movie_categories()