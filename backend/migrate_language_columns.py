#!/usr/bin/env python3
"""
Database migration script to add language columns to theater_releases and ott_releases tables.

This migration adds the missing 'language' column to both theater_releases and ott_releases tables
that was causing SQLAlchemy errors when trying to create new theater/OTT releases.
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime

# Database path
ROOT_DIR = Path(__file__).parent
DATABASE_PATH = ROOT_DIR / "blog_cms.db"

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]
    return column_name in column_names

def add_language_column_if_missing(cursor, table_name):
    """Add language column to table if it doesn't exist"""
    if not check_column_exists(cursor, table_name, 'language'):
        print(f"Adding 'language' column to {table_name} table...")
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN language TEXT DEFAULT 'Hindi'")
        print(f"✅ Successfully added 'language' column to {table_name}")
        return True
    else:
        print(f"ℹ️ Column 'language' already exists in {table_name}")
        return False

def check_table_exists(cursor, table_name):
    """Check if a table exists in the database"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    return cursor.fetchone() is not None

def main():
    """Main migration function"""
    print("=" * 60)
    print("DATABASE MIGRATION: Adding language columns")
    print("=" * 60)
    
    if not DATABASE_PATH.exists():
        print(f"❌ Database file not found at {DATABASE_PATH}")
        print("Please ensure the backend has been started at least once to create the database.")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check if tables exist
        tables_to_migrate = ['theater_releases', 'ott_releases']
        migrations_applied = []
        
        for table_name in tables_to_migrate:
            if check_table_exists(cursor, table_name):
                print(f"📋 Found table: {table_name}")
                if add_language_column_if_missing(cursor, table_name):
                    migrations_applied.append(table_name)
            else:
                print(f"⚠️ Table {table_name} does not exist. It will be created when the server starts.")
        
        # Commit changes
        conn.commit()
        
        # Verify the migration
        print("\n" + "=" * 40)
        print("MIGRATION VERIFICATION")
        print("=" * 40)
        
        for table_name in tables_to_migrate:
            if check_table_exists(cursor, table_name):
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                print(f"\n📊 {table_name} table structure:")
                for column in columns:
                    column_name = column[1]
                    column_type = column[2]
                    column_default = column[4] if column[4] else "None"
                    status = "✅" if column_name == 'language' else "  "
                    print(f"  {status} {column_name} ({column_type}) - Default: {column_default}")
        
        conn.close()
        
        print("\n" + "=" * 60)
        if migrations_applied:
            print(f"✅ MIGRATION COMPLETED SUCCESSFULLY!")
            print(f"📝 Applied migrations to: {', '.join(migrations_applied)}")
            print("🎯 Theater and OTT release creation should now work correctly.")
        else:
            print("ℹ️ NO MIGRATIONS NEEDED - All columns already exist.")
        print("=" * 60)
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)