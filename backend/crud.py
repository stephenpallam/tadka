from sqlalchemy.orm import Session
import models, schemas
from typing import List, Optional
from sqlalchemy import desc, and_, or_
from datetime import datetime
import json

# Category CRUD operations
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_slug(db: Session, slug: str):
    return db.query(models.Category).filter(models.Category.slug == slug).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def get_all_categories(db: Session):
    """Get all categories for CMS dropdown"""
    return db.query(models.Category).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(
        name=category.name, 
        slug=category.slug,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Article CRUD operations
def get_article(db: Session, article_id: int):
    # Increment view count when getting a specific article
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if article:
        article.view_count += 1
        db.commit()
        db.refresh(article)
    return article

def get_articles(db: Session, skip: int = 0, limit: int = 100, is_featured: Optional[bool] = None):
    query = db.query(models.Article)
    if is_featured is not None:
        query = query.filter(models.Article.is_featured == is_featured)
    return query.order_by(desc(models.Article.published_at)).offset(skip).limit(limit).all()

def get_articles_by_category_slug(db: Session, category_slug: str, skip: int = 0, limit: int = 100):
    return db.query(models.Article).filter(
        models.Article.category == category_slug
    ).order_by(desc(models.Article.published_at)).offset(skip).limit(limit).all()

def get_articles_by_states(db: Session, category_slug: str, state_codes: List[str], skip: int = 0, limit: int = 100):
    """Get articles filtered by state codes - returns articles that match user's states OR are universal (states=null)
    
    Args:
        db: Database session
        category_slug: Category to filter by (e.g., "state-politics")
        state_codes: List of state codes to match (e.g., ["ap", "ts"])
        skip: Offset for pagination
        limit: Maximum number of articles to return
    
    Returns:
        List of articles that either:
        1. Have states=null (universal articles)
        2. Have states field containing any of the specified state codes
    """
    from sqlalchemy import or_, and_
    
    # Build query conditions
    conditions = []
    
    # Condition 1: Universal articles (states is null)
    conditions.append(models.Article.states.is_(None))
    
    # Condition 2: Articles with matching state codes
    for state_code in state_codes:
        # Check if states field contains the state code
        # Handle both JSON string format and direct matching
        conditions.append(models.Article.states.like(f'%"{state_code}"%'))
        conditions.append(models.Article.states.like(f'%{state_code}%'))
    
    return db.query(models.Article).filter(
        and_(
            models.Article.category == category_slug,
            or_(*conditions)
        )
    ).order_by(desc(models.Article.published_at)).offset(skip).limit(limit).all()

def get_most_read_articles(db: Session, limit: int = 100):
    return db.query(models.Article).order_by(desc(models.Article.view_count)).limit(limit).all()

def create_article(db: Session, article: schemas.ArticleCreate):
    db_article = models.Article(**article.dict())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

# Movie Review CRUD operations
def get_movie_review(db: Session, review_id: int):
    return db.query(models.MovieReview).filter(models.MovieReview.id == review_id).first()

def get_movie_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MovieReview).order_by(desc(models.MovieReview.published_at)).offset(skip).limit(limit).all()

def create_movie_review(db: Session, review: schemas.MovieReviewCreate):
    db_review = models.MovieReview(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# Featured Images CRUD operations
def get_featured_images(db: Session, limit: int = 100):
    return db.query(models.FeaturedImage).filter(
        models.FeaturedImage.is_active == True
    ).order_by(models.FeaturedImage.display_order).limit(limit).all()

def create_featured_image(db: Session, image: schemas.FeaturedImageCreate):
    db_image = models.FeaturedImage(**image.dict())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

# CMS-specific CRUD operations
def get_articles_for_cms(db: Session, language: str = "en", skip: int = 0, limit: int = 20, category: str = None, state: str = None):
    """Get articles for CMS dashboard with filtering"""
    query = db.query(models.Article).filter(models.Article.language == language)
    
    if category:
        query = query.filter(models.Article.category == category)
    
    if state:
        # Map display state names to database state codes (31 states - AP & Telangana split)
        state_code_map = {
            'Andhra Pradesh': 'ap',
            'Arunachal Pradesh': 'ar',
            'Assam': 'as',
            'Bihar': 'br',
            'Chhattisgarh': 'cg',
            'Delhi': 'dl',
            'Goa': 'ga',
            'Gujarat': 'gj',
            'Haryana': 'hr',
            'Himachal Pradesh': 'hp',
            'Jammu and Kashmir': 'jk',
            'Jharkhand': 'jh',
            'Karnataka': 'ka',
            'Kerala': 'kl',
            'Ladakh': 'ld',
            'Madhya Pradesh': 'mp',
            'Maharashtra': 'mh',
            'Manipur': 'mn',
            'Meghalaya': 'ml',
            'Mizoram': 'mz',
            'Nagaland': 'nl',
            'Odisha': 'or',
            'Punjab': 'pb',
            'Rajasthan': 'rj',
            'Sikkim': 'sk',
            'Tamil Nadu': 'tn',
            'Telangana': 'ts',
            'Tripura': 'tr',
            'Uttar Pradesh': 'up',
            'Uttarakhand': 'uk',
            'West Bengal': 'wb',
            # Legacy support for existing articles
            'AP & Telangana': 'ap_ts'
        }
        
        state_code = state_code_map.get(state, state.lower())
        
        # Filter articles where states field contains the state code
        query = query.filter(
            models.Article.states.like(f'%"{state_code}"%')
        )
    
    return query.order_by(desc(models.Article.created_at)).offset(skip).limit(limit).all()

def create_article_cms(db: Session, article: schemas.ArticleCreate, slug: str, seo_title: str, seo_description: str):
    """Create article via CMS"""
    # Handle scheduling logic
    published_at = None
    if article.is_scheduled and article.scheduled_publish_at:
        # Scheduled post - don't set published_at, keep is_published as False
        is_published = False
    elif article.is_published:
        # Regular published post
        published_at = datetime.utcnow()
        is_published = True
    else:
        # Draft post
        is_published = False
    
    db_article = models.Article(
        title=article.title,
        short_title=article.short_title,
        slug=slug,
        content=article.content,
        summary=article.summary,
        author=article.author,
        language=article.language,
        states=article.states,
        category=article.category,
        content_type=article.content_type,  # Add content_type field
        image=article.image,
        youtube_url=article.youtube_url,
        tags=article.tags,
        artists=article.artists,  # Add artists field
        movie_rating=article.movie_rating,  # Add movie_rating field
        is_featured=article.is_featured,
        is_published=is_published,
        is_scheduled=article.is_scheduled,
        scheduled_publish_at=article.scheduled_publish_at,
        seo_title=seo_title,
        seo_description=seo_description,
        seo_keywords=article.seo_keywords,
        published_at=published_at
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

def update_article_cms(db: Session, article_id: int, article_update: schemas.ArticleUpdate):
    """Update article via CMS"""
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    
    update_data = article_update.dict(exclude_unset=True)
    
    # Handle scheduling logic
    if 'is_scheduled' in update_data or 'scheduled_publish_at' in update_data or 'is_published' in update_data:
        if update_data.get('is_scheduled') and update_data.get('scheduled_publish_at'):
            # Setting up as scheduled post
            update_data['is_published'] = False
            update_data['published_at'] = None
        elif update_data.get('is_published') is True:
            # Publishing immediately - always set current timestamp
            update_data['is_scheduled'] = False
            update_data['published_at'] = datetime.utcnow()
    
    # Update updated_at
    update_data['updated_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_article, field, value)
    
    db.commit()
    db.refresh(db_article)
    return db_article

def delete_article(db: Session, article_id: int):
    """Delete article"""
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    db.delete(db_article)
    db.commit()
    return db_article

def create_translated_article(db: Session, original_article: models.Article, target_language: str):
    """Create translated version of article"""
    # Generate new slug with language suffix
    original_slug = original_article.slug
    new_slug = f"{original_slug}-{target_language}"
    
    translated_article = models.Article(
        title=f"[{target_language.upper()}] {original_article.title}",  # Placeholder for actual translation
        short_title=original_article.short_title,
        slug=new_slug,
        content=original_article.content,  # This would be translated by translation service
        summary=original_article.summary,  # This would be translated by translation service
        author=original_article.author,
        language=target_language,
        states=original_article.states,
        category=original_article.category,
        image=original_article.image,
        youtube_url=original_article.youtube_url,
        tags=original_article.tags,
        is_featured=original_article.is_featured,
        is_published=False,  # Set as draft initially
        original_article_id=original_article.id,
        seo_title=original_article.seo_title,
        seo_description=original_article.seo_description,
        seo_keywords=original_article.seo_keywords
    )
    
    db.add(translated_article)
    db.commit()
    db.refresh(translated_article)
    return translated_article

def get_article_by_id(db: Session, article_id: int):
    """Get article by ID for CMS"""
    return db.query(models.Article).filter(models.Article.id == article_id).first()

# Scheduler CRUD operations
def get_scheduler_settings(db: Session):
    """Get scheduler settings"""
    return db.query(models.SchedulerSettings).first()

def create_scheduler_settings(db: Session, settings: schemas.SchedulerSettingsCreate):
    """Create initial scheduler settings"""
    db_settings = models.SchedulerSettings(**settings.dict())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_scheduler_settings(db: Session, settings_update: schemas.SchedulerSettingsUpdate):
    """Update scheduler settings"""
    db_settings = db.query(models.SchedulerSettings).first()
    
    if not db_settings:
        # Create default settings if none exist
        db_settings = models.SchedulerSettings()
        db.add(db_settings)
    
    update_data = settings_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

def get_scheduled_articles_for_publishing(db: Session):
    """Get articles that are scheduled and ready to be published"""
    from pytz import timezone
    ist = timezone('Asia/Kolkata')
    current_time_ist = datetime.now(ist).replace(tzinfo=None)
    
    return db.query(models.Article).filter(
        and_(
            models.Article.is_scheduled == True,
            models.Article.is_published == False,
            models.Article.scheduled_publish_at <= current_time_ist
        )
    ).all()

def publish_scheduled_article(db: Session, article_id: int):
    """Publish a scheduled article"""
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        db_article.is_scheduled = False
        db_article.is_published = True
        db_article.published_at = datetime.utcnow()
        db.commit()
        db.refresh(db_article)
    return db_article

# Related Articles Configuration CRUD operations
def get_related_articles_config(db: Session, page_slug: str = None):
    """Get related articles configuration for a specific page or all pages"""
    if page_slug:
        return db.query(models.RelatedArticlesConfig).filter(
            models.RelatedArticlesConfig.page_slug == page_slug
        ).first()
    else:
        # Return all configurations as a dictionary
        configs = db.query(models.RelatedArticlesConfig).all()
        result = {}
        for config in configs:
            try:
                categories = json.loads(config.categories) if config.categories else []
            except json.JSONDecodeError:
                categories = []
            
            result[config.page_slug] = {
                'categories': categories,
                'articleCount': config.article_count
            }
        return result

def create_or_update_related_articles_config(db: Session, config_data: schemas.RelatedArticlesConfigCreate):
    """Create or update related articles configuration"""
    # Check if configuration already exists
    existing_config = db.query(models.RelatedArticlesConfig).filter(
        models.RelatedArticlesConfig.page_slug == config_data.page
    ).first()
    
    categories_json = json.dumps(config_data.categories)
    
    if existing_config:
        # Update existing configuration
        existing_config.categories = categories_json
        existing_config.article_count = config_data.articleCount
        existing_config.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_config)
        return existing_config
    else:
        # Create new configuration
        db_config = models.RelatedArticlesConfig(
            page_slug=config_data.page,
            categories=categories_json,
            article_count=config_data.articleCount
        )
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config

def delete_related_articles_config(db: Session, page_slug: str):
    """Delete related articles configuration for a page"""
    db_config = db.query(models.RelatedArticlesConfig).filter(
        models.RelatedArticlesConfig.page_slug == page_slug
    ).first()
    if db_config:
        db.delete(db_config)
        db.commit()
    return db_config

def get_related_articles_for_page(db: Session, page_slug: str, limit: int = None):
    """Get related articles for a specific page based on its configuration"""
    # Get the configuration for this page
    config = get_related_articles_config(db, page_slug)
    
    if not config:
        # Return empty list if no configuration found
        return []
    
    try:
        categories = json.loads(config.categories) if config.categories else []
    except json.JSONDecodeError:
        categories = []
    
    if not categories:
        return []
    
    # Use configured article count or provided limit (per category, not total)
    articles_per_category = limit if limit is not None else config.article_count
    
    # Get articles from each configured category (articles_per_category from each)
    all_articles = []
    for category in categories:
        category_articles = db.query(models.Article).filter(
            and_(
                models.Article.category == category,
                models.Article.is_published == True
            )
        ).order_by(desc(models.Article.published_at)).limit(articles_per_category).all()
        
        all_articles.extend(category_articles)
    
    # Sort all articles by published date and return
    all_articles.sort(key=lambda x: x.published_at or datetime.min, reverse=True)
    
    return all_articles

# Theater Release CRUD operations
def get_theater_releases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TheaterRelease).order_by(desc(models.TheaterRelease.release_date)).offset(skip).limit(limit).all()

def get_theater_release(db: Session, release_id: int):
    return db.query(models.TheaterRelease).filter(models.TheaterRelease.id == release_id).first()

def get_upcoming_theater_releases(db: Session, limit: int = 4):
    from datetime import date, timedelta
    today = date.today()
    week_start = today - timedelta(days=3)  # Same range as "this week"
    week_end = today + timedelta(days=7)
    
    # First, get releases that are more than 7 days away (true upcoming)
    upcoming = db.query(models.TheaterRelease).filter(
        models.TheaterRelease.release_date > week_end
    ).order_by(models.TheaterRelease.release_date).limit(limit).all()
    
    # If we don't have enough upcoming releases, pad with older releases (not in "this week" range)
    if len(upcoming) < limit:
        older_start = today - timedelta(days=14)  # Look back 2 weeks
        older_end = week_start  # Up to the start of "this week" range
        older = db.query(models.TheaterRelease).filter(
            and_(
                models.TheaterRelease.release_date >= older_start,
                models.TheaterRelease.release_date < older_end
            )
        ).order_by(models.TheaterRelease.release_date.desc()).limit(limit - len(upcoming)).all()
        upcoming.extend(older)
    
    return upcoming

def get_this_week_theater_releases(db: Session, limit: int = 4):
    from datetime import date, timedelta
    today = date.today()
    week_start = today - timedelta(days=3)  # Include releases from 3 days ago
    week_end = today + timedelta(days=7)
    # Get releases within the range (3 days ago to 7 days ahead)
    return db.query(models.TheaterRelease).filter(
        and_(
            models.TheaterRelease.release_date >= week_start,
            models.TheaterRelease.release_date <= week_end
        )
    ).order_by(models.TheaterRelease.release_date).limit(limit).all()

def create_theater_release(db: Session, release: schemas.TheaterReleaseCreate):
    db_release = models.TheaterRelease(**release.dict())
    db.add(db_release)
    db.commit()
    db.refresh(db_release)
    return db_release

def update_theater_release(db: Session, release_id: int, release_update: schemas.TheaterReleaseUpdate):
    db_release = db.query(models.TheaterRelease).filter(models.TheaterRelease.id == release_id).first()
    if db_release:
        update_data = release_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_release, key, value)
        db.commit()
        db.refresh(db_release)
    return db_release

def delete_theater_release(db: Session, release_id: int):
    db_release = db.query(models.TheaterRelease).filter(models.TheaterRelease.id == release_id).first()
    if db_release:
        db.delete(db_release)
        db.commit()
    return db_release

# OTT Release CRUD operations
def get_ott_releases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.OTTRelease).order_by(desc(models.OTTRelease.release_date)).offset(skip).limit(limit).all()

def get_ott_release(db: Session, release_id: int):
    return db.query(models.OTTRelease).filter(models.OTTRelease.id == release_id).first()

def get_upcoming_ott_releases(db: Session, limit: int = 4):
    from datetime import date, timedelta
    today = date.today()
    week_start = today - timedelta(days=3)  # Same range as "this week"
    week_end = today + timedelta(days=7)
    
    # First, get releases that are more than 7 days away (true upcoming)
    upcoming = db.query(models.OTTRelease).filter(
        models.OTTRelease.release_date > week_end
    ).order_by(models.OTTRelease.release_date).limit(limit).all()
    
    # If we don't have enough upcoming releases, pad with older releases (not in "this week" range)
    if len(upcoming) < limit:
        older_start = today - timedelta(days=14)  # Look back 2 weeks
        older_end = week_start  # Up to the start of "this week" range
        older = db.query(models.OTTRelease).filter(
            and_(
                models.OTTRelease.release_date >= older_start,
                models.OTTRelease.release_date < older_end
            )
        ).order_by(models.OTTRelease.release_date.desc()).limit(limit - len(upcoming)).all()
        upcoming.extend(older)
    
    return upcoming

def get_this_week_ott_releases(db: Session, limit: int = 4):
    from datetime import date, timedelta
    today = date.today()
    week_start = today - timedelta(days=3)  # Include releases from 3 days ago
    week_end = today + timedelta(days=7)
    # Get releases within the range (3 days ago to 7 days ahead)
    return db.query(models.OTTRelease).filter(
        and_(
            models.OTTRelease.release_date >= week_start,
            models.OTTRelease.release_date <= week_end
        )
    ).order_by(models.OTTRelease.release_date).limit(limit).all()

def create_ott_release(db: Session, release: schemas.OTTReleaseCreate):
    db_release = models.OTTRelease(**release.dict())
    db.add(db_release)
    db.commit()
    db.refresh(db_release)
    return db_release

def update_ott_release(db: Session, release_id: int, release_update: schemas.OTTReleaseUpdate):
    db_release = db.query(models.OTTRelease).filter(models.OTTRelease.id == release_id).first()
    if db_release:
        update_data = release_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_release, key, value)
        db.commit()
        db.refresh(db_release)
    return db_release

def delete_ott_release(db: Session, release_id: int):
    db_release = db.query(models.OTTRelease).filter(models.OTTRelease.id == release_id).first()
    if db_release:
        db.delete(db_release)
        db.commit()
    return db_release

# Get OTT platforms list
def get_ott_platforms():
    """Get predefined list of OTT platforms"""
    return [
        "Netflix",
        "Prime Video",
        "Disney+ Hotstar",
        "Zee5",
        "SonyLiv",
        "Voot",
        "ALTBalaji",
        "MX Player",
        "Eros Now",
        "Hoichoi",
        "Sun NXT",
        "Aha",
        "Apple TV+",
        "YouTube Premium",
        "Jio Cinema"
    ]