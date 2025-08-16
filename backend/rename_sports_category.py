#!/usr/bin/env python3
"""Script to rename 'Sports' category to 'Other Sports' in the database"""

import os
import sys
sys.path.append('/app/backend')

from database import SessionLocal
import models

def rename_sports_category():
    """Rename the Sports category to Other Sports"""
    db = SessionLocal()
    try:
        # Find the Sports category (ID 4, slug: "sports")
        sports_category = db.query(models.Category).filter(models.Category.slug == "sports").first()
        
        if sports_category:
            print(f"Found Sports category: {sports_category.name} (ID: {sports_category.id}, slug: {sports_category.slug})")
            
            # Update the category name and slug
            sports_category.name = "Other Sports"
            sports_category.slug = "other-sports" 
            sports_category.description = "Other sports news and updates beyond cricket"
            
            db.commit()
            print(f"✅ Successfully updated category to: {sports_category.name} (slug: {sports_category.slug})")
            
            # Also update any articles that use this category
            articles_updated = db.query(models.Article).filter(models.Article.category == "sports").update(
                {"category": "other-sports"}
            )
            db.commit()
            print(f"✅ Updated {articles_updated} articles to use 'other-sports' category slug")
            
        else:
            print("❌ Sports category not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    rename_sports_category()