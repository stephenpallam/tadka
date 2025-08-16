#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db
import models

def create_viral_categories():
    db: Session = next(get_db())
    
    try:
        # Check if categories already exist
        existing_usa = db.query(models.Category).filter(models.Category.slug == 'usa').first()
        existing_row = db.query(models.Category).filter(models.Category.slug == 'row').first()
        existing_viral_shorts = db.query(models.Category).filter(models.Category.slug == 'viral-shorts').first()
        
        categories_to_create = []
        
        # Create USA category
        if not existing_usa:
            categories_to_create.append(models.Category(
                name='USA',
                slug='usa',
                description='Videos and content related to USA'
            ))
        
        # Create ROW (Rest of World) category  
        if not existing_row:
            categories_to_create.append(models.Category(
                name='ROW',
                slug='row',
                description='Videos and content from Rest of World'
            ))
            
        # Create Viral Shorts category
        if not existing_viral_shorts:
            categories_to_create.append(models.Category(
                name='Viral Shorts',
                slug='viral-shorts',
                description='Viral short format videos - state specific content'
            ))
        
        if categories_to_create:
            for category in categories_to_create:
                db.add(category)
                print(f"Creating category: {category.name} (slug: {category.slug})")
            
            db.commit()
            print(f"Successfully created {len(categories_to_create)} categories")
        else:
            print("All categories already exist")
            
    except Exception as e:
        print(f"Error creating categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_viral_categories()