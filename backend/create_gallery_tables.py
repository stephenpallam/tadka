#!/usr/bin/env python3

import sys
import os
sys.path.append('/app/backend')

from sqlalchemy import create_engine, text
from database import DATABASE_URL

def create_gallery_tables():
    """Create galleries table and gallery_topics association table"""
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        print("🔄 Creating gallery tables...")
        
        with engine.connect() as connection:
            # Check if galleries table already exists
            result = connection.execute(text("""
                SELECT name FROM sqlite_master WHERE type='table' AND name='galleries'
            """))
            
            if result.fetchone():
                print("✅ Galleries table already exists")
            else:
                # Create galleries table
                connection.execute(text("""
                    CREATE TABLE galleries (
                        id INTEGER PRIMARY KEY,
                        gallery_id VARCHAR UNIQUE NOT NULL,
                        title VARCHAR NOT NULL,
                        artists TEXT,
                        images TEXT NOT NULL,
                        gallery_type VARCHAR DEFAULT 'vertical',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                # Create index on gallery_id
                connection.execute(text("""
                    CREATE INDEX ix_galleries_gallery_id ON galleries (gallery_id)
                """))
                
                # Create index on title
                connection.execute(text("""
                    CREATE INDEX ix_galleries_title ON galleries (title)
                """))
                
                print("✅ Created galleries table")
            
            # Check if gallery_topics table already exists
            result = connection.execute(text("""
                SELECT name FROM sqlite_master WHERE type='table' AND name='gallery_topics'
            """))
            
            if result.fetchone():
                print("✅ Gallery_topics association table already exists")
            else:
                # Create gallery_topics association table
                connection.execute(text("""
                    CREATE TABLE gallery_topics (
                        gallery_id INTEGER NOT NULL,
                        topic_id INTEGER NOT NULL,
                        PRIMARY KEY (gallery_id, topic_id),
                        FOREIGN KEY (gallery_id) REFERENCES galleries (id),
                        FOREIGN KEY (topic_id) REFERENCES topics (id)
                    )
                """))
                
                print("✅ Created gallery_topics association table")
            
            connection.commit()
            
        print("✅ Successfully created all gallery tables")
        
    except Exception as e:
        print(f"❌ Error creating gallery tables: {str(e)}")
        raise

if __name__ == "__main__":
    create_gallery_tables()