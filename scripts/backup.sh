#!/bin/bash

# Portfolio Management Database Backup Script
# This script creates backups of the database and related data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="portfolio_backup_${DATE}.sql"
COMPRESSED_FILE="portfolio_backup_${DATE}.tar.gz"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if database container is running
check_database() {
    if ! docker ps | grep -q portfolio_db; then
        print_error "Portfolio database container is not running."
        print_status "Start the database with: docker-compose up -d"
        exit 1
    fi
}

# Function to create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_status "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    if docker exec portfolio_db pg_dump -U portfolio_user -d portfolio_management > "$backup_path"; then
        print_success "Database backup created: $backup_path"
        
        # Get file size
        local file_size=$(du -h "$backup_path" | cut -f1)
        print_status "Backup size: $file_size"
    else
        print_error "Failed to create database backup"
        exit 1
    fi
}

# Function to create compressed backup
compress_backup() {
    print_status "Compressing backup..."
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    local compressed_path="$BACKUP_DIR/$COMPRESSED_FILE"
    
    if tar -czf "$compressed_path" -C "$BACKUP_DIR" "$(basename "$backup_path")"; then
        print_success "Compressed backup created: $compressed_path"
        
        # Get compressed file size
        local compressed_size=$(du -h "$compressed_path" | cut -f1)
        print_status "Compressed size: $compressed_size"
        
        # Remove uncompressed file if compression was successful
        rm "$backup_path"
        print_status "Removed uncompressed backup file"
    else
        print_error "Failed to compress backup"
        exit 1
    fi
}

# Function to backup Docker volumes
backup_volumes() {
    print_status "Backing up Docker volumes..."
    
    local volume_backup_dir="$BACKUP_DIR/volumes_${DATE}"
    mkdir -p "$volume_backup_dir"
    
    # Backup PostgreSQL data volume
    if docker run --rm -v portfolio_portfolio_postgres_data:/data -v "$(pwd)/$volume_backup_dir":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .; then
        print_success "PostgreSQL data volume backed up"
    else
        print_warning "Failed to backup PostgreSQL data volume"
    fi
    
    # Backup PgAdmin data volume
    if docker run --rm -v portfolio_portfolio_pgadmin_data:/data -v "$(pwd)/$volume_backup_dir":/backup alpine tar czf /backup/pgadmin_data.tar.gz -C /data .; then
        print_success "PgAdmin data volume backed up"
    else
        print_warning "Failed to backup PgAdmin data volume"
    fi
    
    # Backup Redis data volume
    if docker run --rm -v portfolio_portfolio_redis_data:/data -v "$(pwd)/$volume_backup_dir":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .; then
        print_success "Redis data volume backed up"
    else
        print_warning "Failed to backup Redis data volume"
    fi
}

# Function to create backup metadata
create_metadata() {
    print_status "Creating backup metadata..."
    
    local metadata_file="$BACKUP_DIR/backup_metadata_${DATE}.txt"
    
    cat > "$metadata_file" << EOF
Portfolio Management Database Backup
====================================

Backup Date: $(date)
Backup Type: $1
Database: portfolio_management
User: portfolio_user

Files Created:
- $BACKUP_FILE (if not compressed)
- $COMPRESSED_FILE (if compressed)
- volumes_${DATE}/ (if volume backup enabled)

Docker Information:
- PostgreSQL Container: $(docker ps --format "table {{.Names}}\t{{.Status}}" | grep portfolio_db || echo "Not running")
- PgAdmin Container: $(docker ps --format "table {{.Names}}\t{{.Status}}" | grep portfolio_pgadmin || echo "Not running")
- Redis Container: $(docker ps --format "table {{.Names}}\t{{.Status}}" | grep portfolio_redis || echo "Not running")

System Information:
- Hostname: $(hostname)
- OS: $(uname -s)
- Docker Version: $(docker --version)
- PostgreSQL Version: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT version();" | head -1)

Database Statistics:
- Users: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
- Securities: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM securities;" | tr -d ' ')
- Security Holdings: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM user_security_holdings;" | tr -d ' ')
- Fixed Deposits: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM fixed_deposits;" | tr -d ' ')
- User Assets: $(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM user_assets;" | tr -d ' ')

EOF

    print_success "Backup metadata created: $metadata_file"
}

# Function to cleanup old backups
cleanup_old_backups() {
    local days_to_keep=${1:-7}
    
    print_status "Cleaning up backups older than $days_to_keep days..."
    
    if [ -d "$BACKUP_DIR" ]; then
        local deleted_count=$(find "$BACKUP_DIR" -name "portfolio_backup_*.sql" -mtime +$days_to_keep -delete -print | wc -l)
        local deleted_compressed=$(find "$BACKUP_DIR" -name "portfolio_backup_*.tar.gz" -mtime +$days_to_keep -delete -print | wc -l)
        local deleted_volumes=$(find "$BACKUP_DIR" -name "volumes_*" -mtime +$days_to_keep -exec rm -rf {} \; -print | wc -l)
        local deleted_metadata=$(find "$BACKUP_DIR" -name "backup_metadata_*.txt" -mtime +$days_to_keep -delete -print | wc -l)
        
        local total_deleted=$((deleted_count + deleted_compressed + deleted_volumes + deleted_metadata))
        
        if [ $total_deleted -gt 0 ]; then
            print_success "Cleaned up $total_deleted old backup files"
        else
            print_status "No old backup files to clean up"
        fi
    fi
}

# Function to list existing backups
list_backups() {
    print_status "Existing backups:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        ls -lah "$BACKUP_DIR" | grep -E "(portfolio_backup_|volumes_|backup_metadata_)" | while read -r line; do
            echo "  $line"
        done
    else
        print_warning "No backups found in $BACKUP_DIR"
    fi
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore"
        print_status "Usage: $0 --restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will replace the current database with the backup!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Restoring from backup: $backup_file"
    
    # Stop services
    print_status "Stopping services..."
    docker-compose down
    
    # Start only PostgreSQL
    print_status "Starting PostgreSQL..."
    docker-compose up -d postgres
    
    # Wait for database to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec portfolio_db pg_isready -U portfolio_user -d portfolio_management >/dev/null 2>&1; then
            break
        fi
        print_status "Waiting for database... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Database failed to start"
        exit 1
    fi
    
    # Restore database
    print_status "Restoring database..."
    if docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < "$backup_file"; then
        print_success "Database restored successfully"
    else
        print_error "Failed to restore database"
        exit 1
    fi
    
    # Start all services
    print_status "Starting all services..."
    docker-compose up -d
    
    print_success "Restore completed successfully"
}

# Function to show help
show_help() {
    echo "Portfolio Management Database Backup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --database-only     Backup only the database (default)"
    echo "  --with-volumes      Backup database and Docker volumes"
    echo "  --compress          Compress the backup file"
    echo "  --cleanup DAYS      Clean up backups older than DAYS (default: 7)"
    echo "  --list              List existing backups"
    echo "  --restore FILE      Restore from backup file"
    echo "  --help, -h          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Basic database backup"
    echo "  $0 --compress                # Compressed database backup"
    echo "  $0 --with-volumes --compress # Full backup with volumes"
    echo "  $0 --cleanup 14              # Clean up backups older than 14 days"
    echo "  $0 --list                    # List existing backups"
    echo "  $0 --restore backup.sql      # Restore from backup"
}

# Main function
main() {
    local backup_type="database-only"
    local compress=false
    local with_volumes=false
    local cleanup_days=7
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --database-only)
                backup_type="database-only"
                shift
                ;;
            --with-volumes)
                backup_type="with-volumes"
                with_volumes=true
                shift
                ;;
            --compress)
                compress=true
                shift
                ;;
            --cleanup)
                cleanup_days="$2"
                shift 2
                ;;
            --list)
                list_backups
                exit 0
                ;;
            --restore)
                restore_backup "$2"
                exit 0
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🗄️  Portfolio Management Database Backup"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_docker
    check_database
    
    # Create backup directory
    create_backup_dir
    
    # Create database backup
    backup_database
    
    # Compress if requested
    if [ "$compress" = true ]; then
        compress_backup
    fi
    
    # Backup volumes if requested
    if [ "$with_volumes" = true ]; then
        backup_volumes
    fi
    
    # Create metadata
    create_metadata "$backup_type"
    
    # Cleanup old backups
    cleanup_old_backups "$cleanup_days"
    
    # Show backup information
    echo ""
    echo "✅ Backup completed successfully!"
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo "Backup type: $backup_type"
    if [ "$compress" = true ]; then
        echo "Compressed: Yes"
    else
        echo "Compressed: No"
    fi
    echo ""
    
    # List current backups
    list_backups
}

# Run main function with all arguments
main "$@"