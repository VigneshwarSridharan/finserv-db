#!/bin/bash

# Portfolio Management Database Setup Script
# This script sets up the database environment and initializes data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker Compose is available"
}

# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_success ".env file created"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Function to make scripts executable
make_scripts_executable() {
    print_status "Making scripts executable..."
    chmod +x docker/init-db.sh
    chmod +x scripts/*.sh
    print_success "Scripts made executable"
}

# Function to start Docker services
start_services() {
    print_status "Starting Docker services..."
    
    if command_exists docker-compose; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "Docker services started"
}

# Function to wait for database to be ready
wait_for_database() {
    print_status "Waiting for database to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec portfolio_db pg_isready -U portfolio_user -d portfolio_management >/dev/null 2>&1; then
            print_success "Database is ready"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for database..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Database failed to start within expected time"
    return 1
}

# Function to verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if tables exist
    local table_count=$(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$table_count" -gt 20 ]; then
        print_success "Database tables created successfully ($table_count tables)"
    else
        print_error "Database setup incomplete ($table_count tables found)"
        return 1
    fi
    
    # Check if sample data exists
    local user_count=$(docker exec portfolio_db psql -U portfolio_user -d portfolio_management -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
    
    if [ "$user_count" -gt 0 ]; then
        print_success "Sample data loaded successfully ($user_count users)"
    else
        print_warning "No sample data found"
    fi
}

# Function to display connection information
display_connection_info() {
    echo ""
    echo "=========================================="
    echo "🎉 Portfolio Management Database Setup Complete!"
    echo "=========================================="
    echo ""
    echo "📊 Database Connection:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: portfolio_management"
    echo "   Username: portfolio_user"
    echo "   Password: portfolio_password"
    echo ""
    echo "🌐 Web Interfaces:"
    echo "   PgAdmin: http://localhost:8080"
    echo "   Email: admin@portfolio.com"
    echo "   Password: admin123"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Connect to DB: docker exec -it portfolio_db psql -U portfolio_user -d portfolio_management"
    echo ""
    echo "📚 Example Queries:"
    echo "   Run: docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/queries.sql"
    echo ""
    echo "=========================================="
}

# Function to run example queries
run_example_queries() {
    if [ "$1" = "--with-examples" ]; then
        print_status "Running example queries..."
        docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/queries.sql
        print_success "Example queries completed"
    fi
}

# Main setup function
main() {
    echo "🚀 Portfolio Management Database Setup"
    echo "======================================"
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    create_env_file
    make_scripts_executable
    
    # Start services
    start_services
    
    # Wait for database
    if ! wait_for_database; then
        print_error "Setup failed - database not ready"
        exit 1
    fi
    
    # Verify setup
    if ! verify_setup; then
        print_error "Setup verification failed"
        exit 1
    fi
    
    # Run example queries if requested
    run_example_queries "$1"
    
    # Display connection information
    display_connection_info
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Portfolio Management Database Setup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --with-examples    Run example queries after setup"
        echo "  --help, -h         Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                 Basic setup"
        echo "  $0 --with-examples Setup with example queries"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac