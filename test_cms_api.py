#!/usr/bin/env python3
import sys
import os
sys.path.append('/app/backend')

from sqlalchemy.orm import Session
from database import get_db
from models import database_models as models
import crud

def test_cms_articles():
    try:
        # Get database session
        db = next(get_db())
        print("✅ Database connection successful")
        
        # Test the exact function that CMS endpoint uses
        articles = crud.get_articles_for_cms(db, language="en", skip=0, limit=5)
        print(f"✅ Found {len(articles)} articles")
        
        for article in articles[:3]:
            print(f"  - Article {article.id}: {article.title}")
            print(f"    Category: {article.category}")
            print(f"    Content Type: {article.content_type}")
            print(f"    Published: {article.is_published}")
            print()
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_cms_articles()