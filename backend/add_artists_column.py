#!/usr/bin/env python3

import sys
import os
sys.path.append('/app/backend')

from sqlalchemy import create_engine, text
from database import DATABASE_URL

def add_artists_column():
    """Add artists column to articles table"""
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        print("🔄 Adding artists column to articles table...")
        
        # Add artists column (TEXT to store JSON array)
        with engine.connect() as connection:
            # Check if column already exists
            result = connection.execute(text("""
                PRAGMA table_info(articles)
            """))
            
            columns = [row[1] for row in result.fetchall()]
            
            if 'artists' in columns:
                print("✅ Artists column already exists in articles table")
                return
            
            # Add the column
            connection.execute(text("""
                ALTER TABLE articles 
                ADD COLUMN artists TEXT
            """))
            
            connection.commit()
            
        print("✅ Successfully added artists column to articles table")
        
    except Exception as e:
        print(f"❌ Error adding artists column: {str(e)}")
        raise

if __name__ == "__main__":
    add_artists_column()