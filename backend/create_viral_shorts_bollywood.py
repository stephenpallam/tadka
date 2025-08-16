#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db
import models

def create_viral_shorts_bollywood_category():
    db: Session = next(get_db())
    
    try:
        # Check if category already exists
        existing_category = db.query(models.Category).filter(models.Category.slug == 'viral-shorts-bollywood').first()
        
        if not existing_category:
            # Create Viral Shorts Bollywood category
            new_category = models.Category(
                name='Viral Shorts Bollywood',
                slug='viral-shorts-bollywood',
                description='Bollywood short format viral videos - vertical content'
            )
            
            db.add(new_category)
            db.commit()
            print(f"Successfully created category: {new_category.name} (slug: {new_category.slug})")
        else:
            print("Viral Shorts Bollywood category already exists")
            
    except Exception as e:
        print(f"Error creating category: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_viral_shorts_bollywood_category()