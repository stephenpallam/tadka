#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import DATABASE_URL

def add_movie_rating_column():
    """Add movie_rating column to articles table"""
    
    # Create engine
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Check if column already exists (SQLite specific)
        result = session.execute(text("""
            PRAGMA table_info(articles)
        """))
        
        columns = [row[1] for row in result.fetchall()]
        
        if 'movie_rating' in columns:
            print("movie_rating column already exists in articles table")
            return
        
        # Add movie_rating column (SQLite specific)
        session.execute(text("""
            ALTER TABLE articles 
            ADD COLUMN movie_rating TEXT DEFAULT NULL
        """))
        
        session.commit()
        print("Successfully added movie_rating column to articles table")
        
    except Exception as e:
        session.rollback()
        print(f"Error adding movie_rating column: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    add_movie_rating_column()