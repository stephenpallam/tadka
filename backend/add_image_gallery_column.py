#!/usr/bin/env python3
"""
Add image_gallery column to articles table
"""

from sqlalchemy import text
from database import get_db

def add_image_gallery_column():
    """Add image_gallery column to articles table"""
    db = next(get_db())
    
    try:
        # Check if column already exists
        result = db.execute(text("PRAGMA table_info(articles)")).fetchall()
        columns = [row[1] for row in result]  # row[1] is column name
        
        if 'image_gallery' not in columns:
            # Add the column
            db.execute(text("ALTER TABLE articles ADD COLUMN image_gallery TEXT"))
            db.commit()
            print("✅ Successfully added image_gallery column to articles table")
        else:
            print("✅ image_gallery column already exists in articles table")
            
    except Exception as e:
        print(f"❌ Error adding image_gallery column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_image_gallery_column()