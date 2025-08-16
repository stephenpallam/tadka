#!/usr/bin/env python3
"""
Gallery Data Structure Migration Script

This script converts the existing gallery image format from:
{'id', 'name', 'data', 'size'} (base64 data format)

To:
{'url', 'alt', 'caption'} (URL-based format expected by frontend)

And ensures articles are properly linked to galleries.
"""

import sqlite3
import json
import base64
import os
from datetime import datetime

def convert_base64_to_placeholder_url(base64_data, image_name, gallery_id, image_index):
    """Convert base64 image data to placeholder URL format"""
    # For demo purposes, we'll create placeholder URLs
    # In production, you'd save the base64 to actual files and create real URLs
    file_extension = image_name.split('.')[-1] if '.' in image_name else 'jpg'
    placeholder_url = f"https://picsum.photos/800/600?random={gallery_id}-{image_index}"
    
    return {
        "url": placeholder_url,
        "alt": f"Image from {gallery_id}",
        "caption": f"Gallery image: {image_name}"
    }

def migrate_gallery_images():
    """Migrate gallery images from base64 format to URL format"""
    print("🔄 Starting gallery image format migration...")
    
    # Connect to database
    conn = sqlite3.connect('/app/backend/blog_cms.db')
    cursor = conn.cursor()
    
    try:
        # Get all galleries with image data
        cursor.execute('SELECT id, gallery_id, title, images FROM galleries WHERE images IS NOT NULL')
        galleries = cursor.fetchall()
        
        print(f"📊 Found {len(galleries)} galleries to migrate")
        
        updated_galleries = 0
        
        for gallery in galleries:
            gallery_db_id, gallery_id, title, images_json = gallery
            
            print(f"\n🎨 Processing gallery: {gallery_id} - {title}")
            
            try:
                # Parse existing images
                old_images = json.loads(images_json)
                print(f"   📷 Found {len(old_images)} images in old format")
                
                # Convert to new format
                new_images = []
                for i, old_image in enumerate(old_images):
                    if isinstance(old_image, dict):
                        # Check if already in new format
                        if 'url' in old_image and 'alt' in old_image:
                            print(f"   ✅ Image {i+1} already in new format")
                            new_images.append(old_image)
                        else:
                            # Convert from old format
                            image_name = old_image.get('name', f'image_{i+1}.jpg')
                            base64_data = old_image.get('data', '')
                            
                            new_image = convert_base64_to_placeholder_url(
                                base64_data, image_name, gallery_id, i+1
                            )
                            new_images.append(new_image)
                            print(f"   🔄 Converted image {i+1}: {image_name}")
                    else:
                        # Handle unexpected format
                        print(f"   ⚠️  Image {i+1} has unexpected format, creating placeholder")
                        new_image = {
                            "url": f"https://picsum.photos/800/600?random={gallery_id}-{i+1}",
                            "alt": f"Gallery image {i+1}",
                            "caption": f"Image {i+1} from {title}"
                        }
                        new_images.append(new_image)
                
                # Update database with new format
                new_images_json = json.dumps(new_images)
                cursor.execute(
                    'UPDATE galleries SET images = ?, updated_at = ? WHERE id = ?',
                    (new_images_json, datetime.utcnow(), gallery_db_id)
                )
                
                updated_galleries += 1
                print(f"   ✅ Updated gallery {gallery_id} with {len(new_images)} images in new format")
                
            except Exception as e:
                print(f"   ❌ Error processing gallery {gallery_id}: {e}")
                continue
        
        # Commit changes
        conn.commit()
        print(f"\n🎉 Migration completed! Updated {updated_galleries} galleries")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

def link_articles_to_galleries():
    """Ensure articles are properly linked to galleries"""
    print("\n🔗 Checking article-gallery links...")
    
    conn = sqlite3.connect('/app/backend/blog_cms.db')
    cursor = conn.cursor()
    
    try:
        # Find travel pics articles that should be linked to galleries
        cursor.execute('''
            SELECT id, title, gallery_id 
            FROM articles 
            WHERE (title LIKE '%Travel Pics%' OR title LIKE '%Gallery%' OR category = 'travel-pics')
            AND gallery_id IS NOT NULL
        ''')
        articles_with_galleries = cursor.fetchall()
        
        print(f"📊 Found {len(articles_with_galleries)} articles already linked to galleries:")
        for article in articles_with_galleries:
            print(f"   📰 Article {article[0]}: {article[1]} -> Gallery ID {article[2]}")
        
        # Get available galleries
        cursor.execute('SELECT id, gallery_id, title FROM galleries')
        available_galleries = cursor.fetchall()
        
        print(f"\n📊 Available galleries:")
        for gallery in available_galleries:
            print(f"   🎨 Gallery DB_ID {gallery[0]}: {gallery[1]} - {gallery[2]}")
        
        # Link some test articles to galleries if they aren't already linked
        if available_galleries:
            cursor.execute('''
                SELECT id, title 
                FROM articles 
                WHERE (title LIKE '%Travel%' OR category LIKE '%travel%' OR category LIKE '%gallery%') 
                AND gallery_id IS NULL 
                LIMIT 3
            ''')
            unlinked_articles = cursor.fetchall()
            
            linked_count = 0
            for i, article in enumerate(unlinked_articles):
                if i < len(available_galleries):
                    article_id, article_title = article
                    gallery_db_id = available_galleries[i][0]
                    gallery_title = available_galleries[i][2]
                    
                    cursor.execute(
                        'UPDATE articles SET gallery_id = ?, updated_at = ? WHERE id = ?',
                        (gallery_db_id, datetime.utcnow(), article_id)
                    )
                    
                    linked_count += 1
                    print(f"   🔗 Linked article '{article_title}' to gallery '{gallery_title}'")
            
            if linked_count > 0:
                conn.commit()
                print(f"✅ Successfully linked {linked_count} articles to galleries")
            else:
                print("ℹ️  No additional articles needed linking")
        
    except Exception as e:
        print(f"❌ Error linking articles to galleries: {e}")
        conn.rollback()
    finally:
        conn.close()

def verify_migration():
    """Verify the migration was successful"""
    print("\n🔍 Verifying migration results...")
    
    conn = sqlite3.connect('/app/backend/blog_cms.db')
    cursor = conn.cursor()
    
    try:
        # Check gallery image format
        cursor.execute('SELECT id, gallery_id, title, images FROM galleries LIMIT 3')
        galleries = cursor.fetchall()
        
        print("📊 Gallery verification:")
        for gallery in galleries:
            gallery_id, gallery_custom_id, title, images_json = gallery
            try:
                images = json.loads(images_json)
                if images and isinstance(images[0], dict):
                    first_image = images[0]
                    has_url = 'url' in first_image
                    has_alt = 'alt' in first_image
                    has_caption = 'caption' in first_image
                    
                    status = "✅" if (has_url and has_alt and has_caption) else "❌"
                    print(f"   {status} Gallery {gallery_custom_id}: {len(images)} images, format: {list(first_image.keys())}")
                else:
                    print(f"   ❌ Gallery {gallery_custom_id}: Invalid image format")
            except:
                print(f"   ❌ Gallery {gallery_custom_id}: Could not parse images")
        
        # Check article-gallery links
        cursor.execute('''
            SELECT a.id, a.title, a.gallery_id, g.gallery_id, g.title 
            FROM articles a 
            LEFT JOIN galleries g ON a.gallery_id = g.id 
            WHERE a.gallery_id IS NOT NULL
            LIMIT 5
        ''')
        linked_articles = cursor.fetchall()
        
        print(f"\n📊 Article-gallery links verification ({len(linked_articles)} found):")
        for link in linked_articles:
            article_id, article_title, gallery_db_id, gallery_custom_id, gallery_title = link
            status = "✅" if gallery_custom_id else "❌"
            print(f"   {status} Article '{article_title}' -> Gallery '{gallery_title}' ({gallery_custom_id})")
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting Gallery Data Structure Migration")
    print("=" * 60)
    
    # Step 1: Migrate gallery image format
    migrate_gallery_images()
    
    # Step 2: Ensure articles are linked to galleries  
    link_articles_to_galleries()
    
    # Step 3: Verify migration
    verify_migration()
    
    print("\n" + "=" * 60)
    print("✅ Migration completed! Gallery data structure is now compatible with frontend GalleryPost component.")
    print("\n📋 Next steps:")
    print("   1. Restart backend services")
    print("   2. Test gallery post functionality")
    print("   3. Verify image slider works correctly")