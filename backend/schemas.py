from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Article Schemas
class ArticleBase(BaseModel):
    title: str
    short_title: Optional[str] = None
    content: str
    summary: str
    author: str
    language: str = "en"
    states: Optional[str] = None  # JSON string
    category: str
    content_type: Optional[str] = "post"  # New field for content type
    image: Optional[str] = None
    image_gallery: Optional[str] = None  # New field for image gallery (JSON string)
    gallery_id: Optional[int] = None  # New field for gallery reference
    youtube_url: Optional[str] = None
    tags: Optional[str] = None
    artists: Optional[str] = None  # JSON string for artist names
    movie_rating: Optional[str] = None  # New field for movie rating
    is_featured: bool = False
    is_published: bool = True
    is_scheduled: bool = False
    scheduled_publish_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    short_title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    states: Optional[str] = None
    category: Optional[str] = None
    content_type: Optional[str] = None  # New field for content type
    image: Optional[str] = None
    image_gallery: Optional[str] = None  # New field for image gallery (JSON string)
    gallery_id: Optional[int] = None  # New field for gallery reference
    youtube_url: Optional[str] = None
    tags: Optional[str] = None
    artists: Optional[str] = None  # JSON string for artist names
    movie_rating: Optional[str] = None  # New field for movie rating
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    is_scheduled: Optional[bool] = None
    scheduled_publish_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class ArticleResponse(ArticleBase):
    id: int
    slug: str
    view_count: int
    original_article_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    gallery: Optional[dict] = None  # Add gallery field for formatted response

    class Config:
        from_attributes = True

# Movie Review Schemas
class MovieReviewBase(BaseModel):
    title: str
    movie_name: str
    rating: float = Field(..., ge=0, le=5)
    review_content: str
    poster_image: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    genre: Optional[str] = None
    reviewer: str = "Admin"

class MovieReviewCreate(MovieReviewBase):
    pass

class MovieReview(MovieReviewBase):
    id: int
    view_count: int
    published_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Featured Image Schemas
class FeaturedImageBase(BaseModel):
    title: str
    image_url: str
    caption: Optional[str] = None
    photographer: Optional[str] = None
    location: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class FeaturedImageCreate(FeaturedImageBase):
    pass

class FeaturedImage(FeaturedImageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Theater Release Schemas
class TheaterReleaseBase(BaseModel):
    movie_name: str
    release_date: date
    movie_banner: Optional[str] = None  # Text field, not file path
    movie_image: Optional[str] = None
    language: str = "Hindi"

class TheaterReleaseCreate(TheaterReleaseBase):
    created_by: str

class TheaterReleaseUpdate(BaseModel):
    movie_name: Optional[str] = None
    release_date: Optional[date] = None
    movie_banner: Optional[str] = None  # Text field, not file path
    movie_image: Optional[str] = None
    language: Optional[str] = None

class TheaterReleaseResponse(TheaterReleaseBase):
    id: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# OTT Release Schemas
class OTTReleaseBase(BaseModel):
    movie_name: str
    ott_platform: str
    release_date: date
    movie_image: Optional[str] = None
    language: str = "Hindi"

class OTTReleaseCreate(OTTReleaseBase):
    created_by: str

class OTTReleaseUpdate(BaseModel):
    movie_name: Optional[str] = None
    ott_platform: Optional[str] = None
    release_date: Optional[date] = None
    movie_image: Optional[str] = None
    language: Optional[str] = None

class OTTReleaseResponse(OTTReleaseBase):
    id: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Gallery Schema for nested gallery information
class GalleryInfo(BaseModel):
    gallery_id: int
    gallery_title: str
    images: List[dict]
    first_image: Optional[dict] = None

# Response Schemas
class ArticleListResponse(BaseModel):
    id: int
    title: str
    short_title: Optional[str] = None
    summary: str
    image_url: Optional[str] = None
    youtube_url: Optional[str] = None  # Add youtube_url field
    author: str
    language: str
    category: str
    content_type: Optional[str] = "post"  # Add content_type field
    artists: Optional[str] = None  # Add artists field
    states: Optional[str] = None  # Add states field
    gallery: Optional[GalleryInfo] = None  # Add gallery field
    is_published: bool
    is_scheduled: bool = False
    scheduled_publish_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    view_count: int

    class Config:
        from_attributes = True

class MovieReviewListResponse(BaseModel):
    id: int
    title: str
    rating: float
    image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TranslationRequest(BaseModel):
    article_id: int
    target_language: str

# Language and State models for CMS
class LanguageOption(BaseModel):
    code: str
    name: str
    native_name: str

class StateOption(BaseModel):
    code: str
    name: str

class CMSResponse(BaseModel):
    languages: List[LanguageOption]
    states: List[StateOption]
    categories: List[dict]

# Scheduler Settings Schemas
class SchedulerSettingsBase(BaseModel):
    is_enabled: bool = False
    check_frequency_minutes: int = 5

class SchedulerSettingsCreate(SchedulerSettingsBase):
    pass

class SchedulerSettingsUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    check_frequency_minutes: Optional[int] = None

class SchedulerSettingsResponse(SchedulerSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Related Articles Configuration Schemas
class RelatedArticlesConfigBase(BaseModel):
    page: str
    categories: List[str]
    articleCount: int = 5

class RelatedArticlesConfigCreate(RelatedArticlesConfigBase):
    pass

class RelatedArticlesConfigUpdate(BaseModel):
    categories: Optional[List[str]] = None
    articleCount: Optional[int] = None

class RelatedArticlesConfigResponse(BaseModel):
    page_slug: str
    categories: List[str]
    article_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True