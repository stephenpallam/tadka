import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from pytz import timezone
from sqlalchemy.orm import Session
from database import SessionLocal
import crud
import schemas
from models.database_models import SchedulerSettings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArticleSchedulerService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.job_id = "publish_scheduled_articles"
        self.ist = timezone('Asia/Kolkata')
        
    def check_and_publish_scheduled_articles(self):
        """Check for scheduled articles that need to be published"""
        db: Session = SessionLocal()
        try:
            # Get scheduler settings
            settings = crud.get_scheduler_settings(db)
            
            # If scheduler is disabled, return
            if not settings or not settings.is_enabled:
                logger.info("Scheduler is disabled, skipping scheduled article check")
                return
            
            # Get articles ready for publishing
            scheduled_articles = crud.get_scheduled_articles_for_publishing(db)
            
            if not scheduled_articles:
                logger.info("No scheduled articles ready for publishing")
                return
            
            # Publish each scheduled article
            published_count = 0
            for article in scheduled_articles:
                try:
                    crud.publish_scheduled_article(db, article.id)
                    published_count += 1
                    logger.info(f"Published scheduled article: {article.title} (ID: {article.id})")
                except Exception as e:
                    logger.error(f"Failed to publish scheduled article {article.id}: {str(e)}")
            
            logger.info(f"Published {published_count} scheduled articles")
            
        except Exception as e:
            logger.error(f"Error in scheduled article check: {str(e)}")
        finally:
            db.close()
    
    def start_scheduler(self):
        """Start the background scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Article scheduler started")
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Article scheduler stopped")
    
    def update_schedule(self, frequency_minutes: int):
        """Update the scheduler frequency"""
        try:
            # Remove existing job if it exists
            if self.scheduler.get_job(self.job_id):
                self.scheduler.remove_job(self.job_id)
            
            # Add new job with updated frequency
            self.scheduler.add_job(
                func=self.check_and_publish_scheduled_articles,
                trigger=IntervalTrigger(minutes=frequency_minutes),
                id=self.job_id,
                name="Check and publish scheduled articles",
                replace_existing=True
            )
            
            logger.info(f"Scheduler frequency updated to {frequency_minutes} minutes")
            
        except Exception as e:
            logger.error(f"Failed to update scheduler frequency: {str(e)}")
    
    def initialize_scheduler(self):
        """Initialize scheduler with settings from database"""
        db: Session = SessionLocal()
        try:
            settings = crud.get_scheduler_settings(db)
            
            if not settings:
                # Create default settings if none exist
                default_settings = crud.create_scheduler_settings(
                    db, 
                    schemas.SchedulerSettingsCreate(is_enabled=False, check_frequency_minutes=5)
                )
                settings = default_settings
            
            # Set up the scheduler job
            if settings.is_enabled:
                self.update_schedule(settings.check_frequency_minutes)
                logger.info(f"Scheduler initialized with {settings.check_frequency_minutes} minute frequency")
            else:
                logger.info("Scheduler initialized but disabled")
                
        except Exception as e:
            logger.error(f"Failed to initialize scheduler: {str(e)}")
        finally:
            db.close()

# Global scheduler instance
article_scheduler = ArticleSchedulerService()