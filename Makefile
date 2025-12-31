.PHONY: help build up down restart logs ps clean version

API_VERSION := $(shell docker run --rm -v "$(CURDIR):/repo" gittools/gitversion:6.0.0 /repo /showvariable SemVer 2)
export API_VERSION

build: ## Build all services
	@echo "Building with API_VERSION=$(API_VERSION)"
	docker compose build

up: ## Build and start all services in detached mode
	@echo "Starting services with API_VERSION=$(API_VERSION)"
	docker compose up --build -d

down: ## Stop and remove all containers
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Show logs for all services
	docker compose logs -f

ps: ## List running containers
	docker compose ps

clean: ## Stop containers and remove volumes
	docker compose down -v

version: ## Show the current version
	@echo "$(API_VERSION)"
