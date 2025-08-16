from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, Date, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Association table for many-to-many relationship between articles and topics
article_topic_association = Table(
    'article_topics',
    Base.metadata,
    Column('article_id', Integer, ForeignKey('articles.id'), primary_key=True),
    Column('topic_id', Integer, ForeignKey('topics.id'), primary_key=True)
)

# Association table for many-to-many relationship between galleries and topics
gallery_topic_association = Table(
    'gallery_topics',
    Base.metadata,
    Column('gallery_id', Integer, ForeignKey('galleries.id'), primary_key=True),
    Column('topic_id', Integer, ForeignKey('topics.id'), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    short_title = Column(String)  # New field for short title
    slug = Column(String, unique=True, index=True)
    content = Column(Text)
    summary = Column(String)
    author = Column(String)
    language = Column(String, default="en")  # New field for language support
    states = Column(Text)  # JSON string for supported states
    category = Column(String, index=True)
    content_type = Column(String, default='post')  # New field for content type (post, photo, video, movie_review)
    image = Column(String)
    image_gallery = Column(Text)  # New field for image gallery (JSON string array)
    gallery_id = Column(Integer, ForeignKey('galleries.id'))  # Reference to Gallery table
    youtube_url = Column(String)  # New field for YouTube links
    tags = Column(String)
    artists = Column(Text)  # New field for artists (JSON string array)
    movie_rating = Column(String)  # New field for movie rating (0-5 with 0.25 increments)
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)  # New field for draft/published status
    is_scheduled = Column(Boolean, default=False)  # New field for scheduled posts
    scheduled_publish_at = Column(DateTime)  # New field for scheduled publish date/time (IST)
    original_article_id = Column(Integer)  # For linking translated articles
    seo_title = Column(String)  # New field for SEO optimization
    seo_description = Column(String)  # New field for SEO meta description
    seo_keywords = Column(String)  # New field for SEO keywords
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)
    
    # Many-to-many relationship with topics
    topics = relationship("Topic", secondary=article_topic_association, back_populates="articles")
    
    # Relationship with Gallery
    gallery = relationship("Gallery", foreign_keys=[gallery_id])

class SchedulerSettings(Base):
    __tablename__ = "scheduler_settings"

    id = Column(Integer, primary_key=True, index=True)
    is_enabled = Column(Boolean, default=False)  # Admin can enable/disable scheduler
    check_frequency_minutes = Column(Integer, default=5)  # Check every 5 minutes by default
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RelatedArticlesConfig(Base):
    __tablename__ = "related_articles_config"

    id = Column(Integer, primary_key=True, index=True)
    page_slug = Column(String, unique=True, index=True)  # e.g., 'latest-news', 'politics', etc.
    categories = Column(Text)  # JSON string array of category slugs
    article_count = Column(Integer, default=5)  # Number of articles to show
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MovieReview(Base):
    __tablename__ = "movie_reviews"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    movie_name = Column(String, index=True)
    director = Column(String)
    cast = Column(Text)
    genre = Column(String)
    rating = Column(Float)
    review_content = Column(Text)
    reviewer = Column(String)
    published_at = Column(DateTime, default=datetime.utcnow)
    poster_image = Column(String)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeaturedImage(Base):
    __tablename__ = "featured_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    image_url = Column(String)
    caption = Column(Text)
    photographer = Column(String)
    location = Column(String)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class TheaterRelease(Base):
    __tablename__ = "theater_releases"

    id = Column(Integer, primary_key=True, index=True)
    movie_name = Column(String, index=True, nullable=False)
    movie_banner = Column(String)  # Text field, not file path
    movie_image = Column(String)   # Path to uploaded movie image
    language = Column(String, default="Hindi")  # Movie language
    release_date = Column(Date, nullable=False)
    created_by = Column(String)    # User who created this entry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OTTRelease(Base):
    __tablename__ = "ott_releases"

    id = Column(Integer, primary_key=True, index=True)
    movie_name = Column(String, index=True, nullable=False)
    ott_platform = Column(String, nullable=False)  # Netflix, Prime Video, etc.
    movie_image = Column(String)   # Path to uploaded movie image
    language = Column(String, default="Hindi")  # Movie language
    release_date = Column(Date, nullable=False)
    created_by = Column(String)    # User who created this entry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    category = Column(String, index=True, nullable=False)  # Movies, Politics, Sports, TV, Travel
    image = Column(String)  # Path to uploaded topic image
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Many-to-many relationship with articles
    articles = relationship("Article", secondary=article_topic_association, back_populates="topics")
    
    # Many-to-many relationship with galleries
    galleries = relationship("Gallery", secondary=gallery_topic_association, back_populates="topics")

class TopicCategory(Base):
    __tablename__ = "topic_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Gallery(Base):
    __tablename__ = "galleries"

    id = Column(Integer, primary_key=True, index=True)
    gallery_id = Column(String, unique=True, index=True, nullable=False)  # Custom ID like VIG-timestamp-suffix
    title = Column(String, index=True, nullable=False)
    artists = Column(Text)  # JSON string array of artist names
    images = Column(Text, nullable=False)  # JSON string array of image data
    gallery_type = Column(String, default="vertical")  # vertical or horizontal
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Many-to-many relationship with topics
    topics = relationship("Topic", secondary=gallery_topic_association, back_populates="galleries")