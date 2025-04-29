# Variables
PYTHON = python3
VENV = venv
PIP = $(VENV)/bin/pip
PYTHON_VENV = $(VENV)/bin/python
DOCKER_COMPOSE_PROD = docker compose -f docker/docker-compose.yml --env-file .env --profile prod
DOCKER_COMPOSE_DEV = docker compose -f docker/docker-compose.yml --env-file .env --profile dev
DB_NAME = $(shell grep DB_NAME .env | cut -d '=' -f2)
DB_USER = $(shell grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD = $(shell grep DB_PASSWORD .env | cut -d '=' -f2)
MAKE_RUN_HOST = $(shell grep MAKE_RUN_HOST .env | cut -d '=' -f2)
MAKE_RUN_PORT = $(shell grep MAKE_RUN_PORT .env | cut -d '=' -f2)

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color
RED = \033[0;31m

# Default target
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make setup         - Initial project setup (venv, dependencies, env file, docker)"
	@echo "  make run         	- Run the Django development server"
	@echo "  make install       - Install Python dependencies"
	@echo "  make prod          - Start all containers (production mode)"
	@echo "  make services      - Start essential services (postgres and redis)"
	@echo "  make down          - Stop all containers"
	@echo "  make clean         - Remove virtual environment and cached files"
	@echo "  make create        - Create migrations, new Django app, fake users, user token"
	@echo "  make migrate       - Run database migrations"
	@echo "  make docs          - Start documentation server"
	@echo "  make ssl [domain]  - Generate self-signed SSL certificates (default: localhost)"

# Setup and Installation Commands
setup: $(VENV) .env services 
	@echo "${GREEN}Setup completed!${NC}"

$(VENV):
	@echo "Creating virtual environment..."
	@$(PYTHON) -m venv $(VENV)
	@echo "Activating virtual environment..."
	@. $(VENV)/bin/activate
	@$(PIP) install --upgrade pip
	@make install

.env:
	@echo "Creating .env file..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${GREEN}.env file created from example${NC}"; \
	fi

install:
	@echo "Installing dependencies..."
	@$(PIP) install -r requirements.txt

# Development Commands
run: $(VENV) services
	@echo "Starting development server..."
	@$(PYTHON_VENV) manage.py runserver $(MAKE_RUN_HOST):$(MAKE_RUN_PORT)

docs:
	@echo "Starting documentation server..."
	@$(PYTHON_VENV) -m mkdocs serve -f docs-site/mkdocs.yml -a localhost:9000

# Docker Commands
build:
	@echo "Building Docker images..."
	@$(DOCKER_COMPOSE_PROD) build

prod:
	@echo "Starting production environment (all containers)..."
	@$(DOCKER_COMPOSE_PROD) up -d

restart:
	@echo "Restarting production environment..."
	@$(DOCKER_COMPOSE_PROD) down
	@$(DOCKER_COMPOSE_PROD) up -d

services:
	@echo "Starting essential services (PostgreSQL and Redis)..."
	@$(DOCKER_COMPOSE_DEV) up -d

down:
	@echo "Stopping all containers..."
	@$(DOCKER_COMPOSE_PROD) down

logs:
	@echo "Showing logs..."
	@$(DOCKER_COMPOSE_PROD) logs -f

# Database Commands
db:
	@echo "Ensuring database exists..."
	@$(DOCKER_COMPOSE_PROD) exec -T postgres psql -U $(DB_USER) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)'" | grep -q 1 || \
	$(DOCKER_COMPOSE_PROD) exec -T postgres psql -U $(DB_USER) -d postgres -c "CREATE DATABASE $(DB_NAME)"

migrate: db
	@echo "Running migrations..."
	@$(PYTHON_VENV) manage.py migrate

# Creation Commands
create:
	@if [ "$(filter migrations,$(MAKECMDGOALS))" = "migrations" ]; then \
		echo "Creating migrations..."; \
		$(PYTHON_VENV) manage.py makemigrations $(filter-out migrations,$(ARGS)) 2>/dev/null; \
		echo "${GREEN}Migrations created successfully!${NC}"; \
	elif [ "$(filter app,$(MAKECMDGOALS))" = "app" ]; then \
		echo "Creating new Django app..."; \
		cd apps && ../$(PYTHON_VENV) ../manage.py startapp $(word 3,$(MAKECMDGOALS)) 2>/dev/null && { \
			echo "Registering app in INSTALLED_APPS..."; \
			cd .. && $(PYTHON_VENV) scripts/register_app.py $(word 3,$(MAKECMDGOALS)) 2>/dev/null; \
			echo "${GREEN}App created and registered successfully!${NC}"; \
		} || { \
			echo "${RED}Failed to create app '$(word 3,$(MAKECMDGOALS))'. Make sure the app name is valid and doesn't already exist${NC}"; \
			exit 1; \
		} \
	elif [ "$(filter users,$(MAKECMDGOALS))" = "users" ]; then \
		echo "Creating fake users..."; \
		$(PYTHON_VENV) manage.py create_fake_users $(word 3,$(MAKECMDGOALS)); \
		echo "${GREEN}Fake users created successfully!${NC}"; \
	elif [ "$(filter token,$(MAKECMDGOALS))" = "token" ]; then \
		echo "Creating user token..."; \
		$(PYTHON_VENV) manage.py create_user_token $(word 3,$(MAKECMDGOALS)); \
		echo "${GREEN}User token created successfully!${NC}"; \
	else \
		echo "Usage:"; \
		echo "  make create migrations [app_name]  - Create migrations for all or specific app"; \
		echo "  make create app <app_name>        - Create new Django app"; \
		echo "  make create users <number>        - Create fake users for testing"; \
		echo "  make create token <user_id>       - Create user token for testing"; \
	fi

# Cleanup Commandus
clean:
	@echo "Cleaning up..."
	@rm -rf $(VENV) __pycache__ .pytest_cache
	@find . -type d -name "__pycache__" -exec rm -r {} +
	@find . -type f -name "*.pyc" -delete

# SSL Certificate Generation Command
ssl:
	@echo "Generating self-signed SSL certificates..."
	@./docker/scripts/generate_ssl_certs.sh $(filter-out ssl,$(MAKECMDGOALS))
	@echo "${GREEN}SSL certificates generated successfully!${NC}"

# Ignore all targets that don't match any of the above
%:
	@:

.PHONY: help setup install build prod services down clean migrate run docs create db ssl

