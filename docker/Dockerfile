FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies and build tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Create necessary directories with correct permissions
RUN mkdir -p /app/staticfiles /app/media

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set entrypoint script
COPY docker/scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Run uvicorn (ASGI server) instead of gunicorn
CMD ["uvicorn", "transcendence.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--access-log"]

# Expose port
EXPOSE 8000