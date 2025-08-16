#!/usr/bin/env python3

import sys
import os
from sqlalchemy import create_engine, text
from database import DATABASE_URL
from models.database_models import Base, Topic, TopicCategory, article_topic_association

def create_topics_tables():
    """Create topics and topic_categories tables"""
    
    print("🗄️  Creating Topics tables...")
    
    # Create engine
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    try:
        with engine.connect() as connection:
            # Create topics table
            print("📝 Creating topics table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS topics (
                    id INTEGER PRIMARY KEY,
                    title VARCHAR NOT NULL,
                    slug VARCHAR UNIQUE NOT NULL,
                    description TEXT,
                    category VARCHAR NOT NULL,
                    image VARCHAR,
                    language VARCHAR DEFAULT 'en',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create topic_categories table
            print("📝 Creating topic_categories table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS topic_categories (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR UNIQUE NOT NULL,
                    slug VARCHAR UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create article_topics association table
            print("📝 Creating article_topics association table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS article_topics (
                    article_id INTEGER,
                    topic_id INTEGER,
                    PRIMARY KEY (article_id, topic_id),
                    FOREIGN KEY (article_id) REFERENCES articles(id),
                    FOREIGN KEY (topic_id) REFERENCES topics(id)
                )
            """))
            
            # Insert default topic categories
            print("📝 Inserting default topic categories...")
            connection.execute(text("""
                INSERT OR IGNORE INTO topic_categories (name, slug) VALUES
                ('Movies', 'movies'),
                ('Politics', 'politics'),
                ('Sports', 'sports'),
                ('TV', 'tv'),
                ('Travel', 'travel')
            """))
            
            connection.commit()
        
        print("✅ Topics tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating topics tables: {e}")
        sys.exit(1)
    
    finally:
        engine.dispose()

if __name__ == "__main__":
    create_topics_tables()