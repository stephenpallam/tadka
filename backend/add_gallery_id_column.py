#!/usr/bin/env python3
"""
Add gallery_id column to articles table
"""

from sqlalchemy import text
from database import get_db

def add_gallery_id_column():
    """Add gallery_id column to articles table"""
    db = next(get_db())
    
    try:
        # Check if column already exists
        result = db.execute(text("PRAGMA table_info(articles)")).fetchall()
        columns = [row[1] for row in result]  # row[1] is column name
        
        if 'gallery_id' not in columns:
            # Add the column
            db.execute(text("ALTER TABLE articles ADD COLUMN gallery_id INTEGER"))
            db.commit()
            print("✅ Successfully added gallery_id column to articles table")
        else:
            print("✅ gallery_id column already exists in articles table")
            
    except Exception as e:
        print(f"❌ Error adding gallery_id column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_gallery_id_column()