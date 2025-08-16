from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional
import shutil
import os
import uuid
from datetime import datetime
from pydantic import BaseModel
import re

from database import get_db
from models.database_models import Topic, TopicCategory, Article, article_topic_association, Gallery, gallery_topic_association

router = APIRouter()

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    language: Optional[str] = "en"

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None

class TopicResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    category: str
    image: Optional[str]
    language: str
    created_at: datetime
    updated_at: datetime
    articles_count: Optional[int] = 0

    class Config:
        from_attributes = True

class TopicCategoryCreate(BaseModel):
    name: str

class TopicCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True

def create_slug(title: str) -> str:
    """Create a URL-friendly slug from title"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title)
    slug = re.sub(r'\s+', '-', slug.strip())
    return slug.lower()

# Get all topics with filtering
@router.get("/topics", response_model=List[TopicResponse])
async def get_topics(
    category: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all topics with optional filtering"""
    query = db.query(Topic)
    
    # Apply filters
    if category:
        query = query.filter(Topic.category == category)
    
    if language:
        query = query.filter(Topic.language == language)
    
    if search:
        query = query.filter(
            or_(
                Topic.title.ilike(f"%{search}%"),
                Topic.description.ilike(f"%{search}%")
            )
        )
    
    # Order by created_at desc and apply pagination
    topics = query.order_by(desc(Topic.created_at)).offset(skip).limit(limit).all()
    
    # Add article count for each topic
    result = []
    for topic in topics:
        articles_count = db.query(article_topic_association).filter(
            article_topic_association.c.topic_id == topic.id
        ).count()
        
        topic_dict = {
            "id": topic.id,
            "title": topic.title,
            "slug": topic.slug,
            "description": topic.description,
            "category": topic.category,
            "image": topic.image,
            "language": topic.language,
            "created_at": topic.created_at,
            "updated_at": topic.updated_at,
            "articles_count": articles_count
        }
        result.append(TopicResponse(**topic_dict))
    
    return result

# Get single topic by ID
@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(topic_id: int, db: Session = Depends(get_db)):
    """Get single topic by ID"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get articles count
    articles_count = db.query(article_topic_association).filter(
        article_topic_association.c.topic_id == topic.id
    ).count()
    
    topic_dict = {
        "id": topic.id,
        "title": topic.title,
        "slug": topic.slug,
        "description": topic.description,
        "category": topic.category,
        "image": topic.image,
        "language": topic.language,
        "created_at": topic.created_at,
        "updated_at": topic.updated_at,
        "articles_count": articles_count
    }
    
    return TopicResponse(**topic_dict)

# Get topic by slug
@router.get("/topics/slug/{topic_slug}", response_model=TopicResponse)
async def get_topic_by_slug(topic_slug: str, db: Session = Depends(get_db)):
    """Get topic by slug"""
    topic = db.query(Topic).filter(Topic.slug == topic_slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get articles count
    articles_count = db.query(article_topic_association).filter(
        article_topic_association.c.topic_id == topic.id
    ).count()
    
    topic_dict = {
        "id": topic.id,
        "title": topic.title,
        "slug": topic.slug,
        "description": topic.description,
        "category": topic.category,
        "image": topic.image,
        "language": topic.language,
        "created_at": topic.created_at,
        "updated_at": topic.updated_at,
        "articles_count": articles_count
    }
    
    return TopicResponse(**topic_dict)

# Create new topic
@router.post("/topics", response_model=TopicResponse)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db)
):
    """Create a new topic"""
    
    # Create slug from title
    base_slug = create_slug(topic_data.title)
    slug = base_slug
    
    # Ensure unique slug
    counter = 1
    while db.query(Topic).filter(Topic.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Create topic
    db_topic = Topic(
        title=topic_data.title,
        slug=slug,
        description=topic_data.description,
        category=topic_data.category,
        language=topic_data.language
    )
    
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    
    topic_dict = {
        "id": db_topic.id,
        "title": db_topic.title,
        "slug": db_topic.slug,
        "description": db_topic.description,
        "category": db_topic.category,
        "image": db_topic.image,
        "language": db_topic.language,
        "created_at": db_topic.created_at,
        "updated_at": db_topic.updated_at,
        "articles_count": 0
    }
    
    return TopicResponse(**topic_dict)

# Update topic
@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing topic"""
    
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Update fields
    if topic_data.title is not None:
        db_topic.title = topic_data.title
        # Update slug if title changed
        new_slug = create_slug(topic_data.title)
        if new_slug != db_topic.slug:
            slug = new_slug
            counter = 1
            while db.query(Topic).filter(Topic.slug == slug, Topic.id != topic_id).first():
                slug = f"{new_slug}-{counter}"
                counter += 1
            db_topic.slug = slug
    
    if topic_data.description is not None:
        db_topic.description = topic_data.description
    
    if topic_data.category is not None:
        db_topic.category = topic_data.category
    
    if topic_data.language is not None:
        db_topic.language = topic_data.language
    
    db_topic.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_topic)
    
    # Get articles count
    articles_count = db.query(article_topic_association).filter(
        article_topic_association.c.topic_id == db_topic.id
    ).count()
    
    topic_dict = {
        "id": db_topic.id,
        "title": db_topic.title,
        "slug": db_topic.slug,
        "description": db_topic.description,
        "category": db_topic.category,
        "image": db_topic.image,
        "language": db_topic.language,
        "created_at": db_topic.created_at,
        "updated_at": db_topic.updated_at,
        "articles_count": articles_count
    }
    
    return TopicResponse(**topic_dict)

# Delete topic
@router.delete("/topics/{topic_id}")
async def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    """Delete a topic"""
    
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Remove all article associations
    db.execute(
        article_topic_association.delete().where(
            article_topic_association.c.topic_id == topic_id
        )
    )
    
    # Delete topic image if exists
    if db_topic.image:
        try:
            image_path = f"/app/backend/uploads/{db_topic.image}"
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            print(f"Warning: Could not delete topic image: {e}")
    
    # Delete topic
    db.delete(db_topic)
    db.commit()
    
    return {"message": "Topic deleted successfully"}

# Upload topic image
@router.post("/topics/{topic_id}/upload-image")
async def upload_topic_image(
    topic_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload image for a topic"""
    
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    os.makedirs("/app/backend/uploads", exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"topic_{topic_id}_{uuid.uuid4()}.{file_extension}"
    file_path = f"/app/backend/uploads/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    
    # Delete old image if exists
    if db_topic.image:
        try:
            old_image_path = f"/app/backend/uploads/{db_topic.image}"
            if os.path.exists(old_image_path):
                os.remove(old_image_path)
        except Exception as e:
            print(f"Warning: Could not delete old topic image: {e}")
    
    # Update topic with new image path
    db_topic.image = filename
    db_topic.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_topic)
    
    return {"message": "Image uploaded successfully", "image": filename}

# Get topic categories
@router.get("/topic-categories", response_model=List[TopicCategoryResponse])
async def get_topic_categories(db: Session = Depends(get_db)):
    """Get all topic categories"""
    categories = db.query(TopicCategory).order_by(TopicCategory.name).all()
    return categories

# Create topic category
@router.post("/topic-categories", response_model=TopicCategoryResponse)
async def create_topic_category(
    category_data: TopicCategoryCreate,
    db: Session = Depends(get_db)
):
    """Create a new topic category"""
    
    # Create slug from name
    slug = create_slug(category_data.name)
    
    # Check if category already exists
    existing = db.query(TopicCategory).filter(
        or_(
            TopicCategory.name == category_data.name,
            TopicCategory.slug == slug
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    # Create category
    db_category = TopicCategory(
        name=category_data.name,
        slug=slug
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

# Get articles for a topic
@router.get("/topics/{topic_id}/articles")
async def get_topic_articles(
    topic_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all articles associated with a topic"""
    
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get articles through association table
    articles = db.query(Article).join(
        article_topic_association,
        Article.id == article_topic_association.c.article_id
    ).filter(
        article_topic_association.c.topic_id == topic_id
    ).order_by(desc(Article.created_at)).offset(skip).limit(limit).all()
    
    return articles

# Associate article with topic
@router.post("/topics/{topic_id}/articles/{article_id}")
async def associate_article_with_topic(
    topic_id: int,
    article_id: int,
    db: Session = Depends(get_db)
):
    """Associate an article with a topic"""
    
    # Verify topic and article exist
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if association already exists
    existing = db.execute(
        article_topic_association.select().where(
            and_(
                article_topic_association.c.article_id == article_id,
                article_topic_association.c.topic_id == topic_id
            )
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Association already exists")
    
    # Create association
    db.execute(
        article_topic_association.insert().values(
            article_id=article_id,
            topic_id=topic_id
        )
    )
    
    db.commit()
    
    return {"message": "Article associated with topic successfully"}

# Remove article from topic
@router.delete("/topics/{topic_id}/articles/{article_id}")
async def remove_article_from_topic(
    topic_id: int,
    article_id: int,
    db: Session = Depends(get_db)
):
    """Remove association between article and topic"""
    
    # Remove association
    result = db.execute(
        article_topic_association.delete().where(
            and_(
                article_topic_association.c.article_id == article_id,
                article_topic_association.c.topic_id == topic_id
            )
        )
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Association not found")
    
    db.commit()
    
    return {"message": "Article removed from topic successfully"}

# Get topics for a specific article
@router.get("/articles/{article_id}/topics", response_model=List[TopicResponse])
async def get_article_topics(
    article_id: int,
    db: Session = Depends(get_db)
):
    """Get all topics associated with an article"""
    
    # Verify article exists
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get topics through association table
    topics = db.query(Topic).join(
        article_topic_association,
        Topic.id == article_topic_association.c.topic_id
    ).filter(
        article_topic_association.c.article_id == article_id
    ).order_by(Topic.title).all()
    
    # Format response with articles count for each topic
    result = []
    for topic in topics:
        articles_count = db.query(article_topic_association).filter(
            article_topic_association.c.topic_id == topic.id
        ).count()
        
        topic_dict = {
            "id": topic.id,
            "title": topic.title,
            "slug": topic.slug,
            "description": topic.description,
            "category": topic.category,
            "image": topic.image,
            "language": topic.language,
            "created_at": topic.created_at,
            "updated_at": topic.updated_at,
            "articles_count": articles_count
        }
        result.append(TopicResponse(**topic_dict))
    
    return result

# Gallery-Topic Association Endpoints

@router.post("/topics/{topic_id}/galleries/{gallery_id}")
async def associate_topic_with_gallery(
    topic_id: int,
    gallery_id: int,
    db: Session = Depends(get_db)
):
    """Associate a topic with a gallery"""
    
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Verify gallery exists
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Check if association already exists
    existing_association = db.query(gallery_topic_association).filter(
        and_(
            gallery_topic_association.c.gallery_id == gallery_id,
            gallery_topic_association.c.topic_id == topic_id
        )
    ).first()
    
    if existing_association:
        raise HTTPException(status_code=400, detail="Topic is already associated with this gallery")
    
    # Create association
    stmt = gallery_topic_association.insert().values(
        gallery_id=gallery_id,
        topic_id=topic_id
    )
    db.execute(stmt)
    db.commit()
    
    return {"message": "Topic successfully associated with gallery"}

@router.delete("/topics/{topic_id}/galleries/{gallery_id}")
async def disassociate_topic_from_gallery(
    topic_id: int,
    gallery_id: int,
    db: Session = Depends(get_db)
):
    """Remove association between a topic and a gallery"""
    
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Verify gallery exists
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Check if association exists
    existing_association = db.query(gallery_topic_association).filter(
        and_(
            gallery_topic_association.c.gallery_id == gallery_id,
            gallery_topic_association.c.topic_id == topic_id
        )
    ).first()
    
    if not existing_association:
        raise HTTPException(status_code=404, detail="Association not found")
    
    # Remove association
    stmt = gallery_topic_association.delete().where(
        and_(
            gallery_topic_association.c.gallery_id == gallery_id,
            gallery_topic_association.c.topic_id == topic_id
        )
    )
    db.execute(stmt)
    db.commit()
    
    return {"message": "Topic association removed from gallery"}

@router.get("/galleries/{gallery_id}/topics", response_model=List[TopicResponse])
async def get_gallery_topics(gallery_id: int, db: Session = Depends(get_db)):
    """Get all topics associated with a gallery"""
    
    # Verify gallery exists
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Get topics through association table
    topics = db.query(Topic).join(
        gallery_topic_association,
        Topic.id == gallery_topic_association.c.topic_id
    ).filter(
        gallery_topic_association.c.gallery_id == gallery_id
    ).order_by(Topic.title).all()
    
    # Format response with articles count for each topic
    result = []
    for topic in topics:
        articles_count = db.query(article_topic_association).filter(
            article_topic_association.c.topic_id == topic.id
        ).count()
        
        topic_dict = {
            "id": topic.id,
            "title": topic.title,
            "slug": topic.slug,
            "description": topic.description,
            "category": topic.category,
            "image": topic.image,
            "language": topic.language,
            "created_at": topic.created_at,
            "updated_at": topic.updated_at,
            "articles_count": articles_count
        }
        result.append(TopicResponse(**topic_dict))
    
    return result

@router.get("/topics/{topic_id}/galleries")
async def get_topic_galleries(topic_id: int, db: Session = Depends(get_db)):
    """Get all galleries associated with a topic"""
    
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get galleries through association table with JSON parsing
    galleries = db.query(Gallery).join(
        gallery_topic_association,
        Gallery.id == gallery_topic_association.c.gallery_id
    ).filter(
        gallery_topic_association.c.topic_id == topic_id
    ).order_by(Gallery.created_at.desc()).all()
    
    # Format response to match frontend expectations
    result = []
    for gallery in galleries:
        import json
        
        # Parse JSON fields
        artists = json.loads(gallery.artists) if gallery.artists else []
        images = json.loads(gallery.images) if gallery.images else []
        
        gallery_dict = {
            "id": gallery.id,
            "gallery_id": gallery.gallery_id,
            "title": gallery.title,
            "artists": artists,
            "images": images,
            "gallery_type": gallery.gallery_type,
            "created_at": gallery.created_at,
            "updated_at": gallery.updated_at
        }
        result.append(gallery_dict)
    
    return result