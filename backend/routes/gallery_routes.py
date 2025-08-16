from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import json

from database import get_db
from models.database_models import Gallery

router = APIRouter()

class GalleryCreate(BaseModel):
    gallery_id: str
    title: str
    artists: List[str]
    images: List[dict]  # List of image objects with id, name, data, size
    gallery_type: Optional[str] = "vertical"

class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    artists: Optional[List[str]] = None
    images: Optional[List[dict]] = None
    gallery_type: Optional[str] = None

class GalleryResponse(BaseModel):
    id: int
    gallery_id: str
    title: str
    artists: List[str]
    images: List[dict]
    gallery_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/galleries", response_model=GalleryResponse)
async def create_gallery(gallery: GalleryCreate, db: Session = Depends(get_db)):
    """Create a new gallery"""
    
    # Check if gallery_id already exists
    existing_gallery = db.query(Gallery).filter(Gallery.gallery_id == gallery.gallery_id).first()
    if existing_gallery:
        raise HTTPException(status_code=400, detail="Gallery ID already exists")
    
    # Create new gallery
    db_gallery = Gallery(
        gallery_id=gallery.gallery_id,
        title=gallery.title,
        artists=json.dumps(gallery.artists),
        images=json.dumps(gallery.images),
        gallery_type=gallery.gallery_type
    )
    
    db.add(db_gallery)
    db.commit()
    db.refresh(db_gallery)
    
    # Format response
    return GalleryResponse(
        id=db_gallery.id,
        gallery_id=db_gallery.gallery_id,
        title=db_gallery.title,
        artists=json.loads(db_gallery.artists),
        images=json.loads(db_gallery.images),
        gallery_type=db_gallery.gallery_type,
        created_at=db_gallery.created_at,
        updated_at=db_gallery.updated_at
    )

@router.get("/galleries", response_model=List[GalleryResponse])
async def get_galleries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all galleries"""
    
    galleries = db.query(Gallery).order_by(desc(Gallery.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for gallery in galleries:
        result.append(GalleryResponse(
            id=gallery.id,
            gallery_id=gallery.gallery_id,
            title=gallery.title,
            artists=json.loads(gallery.artists) if gallery.artists else [],
            images=json.loads(gallery.images) if gallery.images else [],
            gallery_type=gallery.gallery_type,
            created_at=gallery.created_at,
            updated_at=gallery.updated_at
        ))
    
    return result

@router.get("/galleries/{gallery_id}", response_model=GalleryResponse)
async def get_gallery(gallery_id: str, db: Session = Depends(get_db)):
    """Get a specific gallery by gallery_id"""
    
    gallery = db.query(Gallery).filter(Gallery.gallery_id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    return GalleryResponse(
        id=gallery.id,
        gallery_id=gallery.gallery_id,
        title=gallery.title,
        artists=json.loads(gallery.artists) if gallery.artists else [],
        images=json.loads(gallery.images) if gallery.images else [],
        gallery_type=gallery.gallery_type,
        created_at=gallery.created_at,
        updated_at=gallery.updated_at
    )

@router.get("/galleries/by-id/{id}", response_model=GalleryResponse)
async def get_gallery_by_id(id: int, db: Session = Depends(get_db)):
    """Get a specific gallery by numeric ID"""
    
    gallery = db.query(Gallery).filter(Gallery.id == id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    return GalleryResponse(
        id=gallery.id,
        gallery_id=gallery.gallery_id,
        title=gallery.title,
        artists=json.loads(gallery.artists) if gallery.artists else [],
        images=json.loads(gallery.images) if gallery.images else [],
        gallery_type=gallery.gallery_type,
        created_at=gallery.created_at,
        updated_at=gallery.updated_at
    )

@router.put("/galleries/{gallery_id}", response_model=GalleryResponse)
async def update_gallery(gallery_id: str, gallery_update: GalleryUpdate, db: Session = Depends(get_db)):
    """Update a gallery"""
    
    gallery = db.query(Gallery).filter(Gallery.gallery_id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    # Update fields if provided
    if gallery_update.title is not None:
        gallery.title = gallery_update.title
    if gallery_update.artists is not None:
        gallery.artists = json.dumps(gallery_update.artists)
    if gallery_update.images is not None:
        gallery.images = json.dumps(gallery_update.images)
    if gallery_update.gallery_type is not None:
        gallery.gallery_type = gallery_update.gallery_type
    
    gallery.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(gallery)
    
    return GalleryResponse(
        id=gallery.id,
        gallery_id=gallery.gallery_id,
        title=gallery.title,
        artists=json.loads(gallery.artists) if gallery.artists else [],
        images=json.loads(gallery.images) if gallery.images else [],
        gallery_type=gallery.gallery_type,
        created_at=gallery.created_at,
        updated_at=gallery.updated_at
    )

@router.delete("/galleries/{gallery_id}")
async def delete_gallery(gallery_id: str, db: Session = Depends(get_db)):
    """Delete a gallery"""
    
    gallery = db.query(Gallery).filter(Gallery.gallery_id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    db.delete(gallery)
    db.commit()
    
    return {"message": "Gallery deleted successfully"}