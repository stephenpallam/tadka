#!/usr/bin/env python3
"""
Migration script to add content_type column to articles table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import engine, SessionLocal

def add_content_type_column():
    """Add content_type column to articles table"""
    db = SessionLocal()
    
    try:
        print("Adding content_type column to articles table...")
        
        # Check if column already exists
        result = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM pragma_table_info('articles') 
            WHERE name = 'content_type'
        """)).fetchone()
        
        if result.count > 0:
            print("✓ content_type column already exists!")
            return
        
        # Add the content_type column with default value 'post'
        db.execute(text("""
            ALTER TABLE articles 
            ADD COLUMN content_type VARCHAR DEFAULT 'post'
        """))
        
        # Update existing articles to have 'post' as default content_type
        db.execute(text("""
            UPDATE articles 
            SET content_type = 'post' 
            WHERE content_type IS NULL
        """))
        
        db.commit()
        print("✓ Successfully added content_type column to articles table")
        print("✓ All existing articles set to content_type='post'")
        
        # Verify the column was added
        result = db.execute(text("SELECT COUNT(*) as count FROM articles WHERE content_type = 'post'")).fetchone()
        print(f"✓ Verified: {result.count} articles now have content_type='post'")
        
    except Exception as e:
        print(f"✗ Error adding content_type column: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_content_type_column()
    print("Migration completed successfully!")