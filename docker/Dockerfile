FROM postgres:15-alpine

# Install additional tools
RUN apk add --no-cache \
    postgresql-client \
    bash \
    curl

# Copy initialization scripts
COPY init-db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh

# Set environment variables
ENV POSTGRES_DB=portfolio_management
ENV POSTGRES_USER=portfolio_user
ENV POSTGRES_PASSWORD=portfolio_password

# Expose port
EXPOSE 5432

# Use the default postgres entrypoint
CMD ["postgres"]