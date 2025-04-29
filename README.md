# ft_transcendence

A real-time multiplayer Pong game web application featuring user authentication, live chat, and social features. Built with Django and vanilla HTML/CSS/JavaScript, this project delivers a modern take on the classic arcade game with seamless multiplayer functionality and real-time communication.

This project is part of the 42 School curriculum. See the [subject](docs/subject.pdf) for more details.

## Prerequisites

- [Docker](https://www.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Python 3.10+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

## Quick Setup (Using Makefile)

1. Clone the repository:

   ```bash
   git clone https://github.com/suiramdev/42-ft_transcendence.git
   cd 42-ft_transcendence
   ```

2. Run setup (creates venv, installs dependencies, sets up Docker):

   ```bash
   make setup
   ```

3. Run migrations:

   ```bash
   make migrate
   ```

4. Start the development server:
   ```bash
   make run
   ```

The application will be available at `http://localhost:8000`.

## Available Commands

Type `make help` to see all available commands with descriptions.

## Project Structure

```
ft_transcendence/
├── transcendence/      # Django project settings and main URLs
├── apps/               # Django applications
│   ├── user/           # User management
│   ├── authentication/ # User authentication
│   ├── game/           # Game functionality
│   └── ...
├── docs-site/          # Documentation site
├── static/             # Static files
├── templates/          # Django templates
└── docker/             # Docker configuration files
```

## Tech Stack

- **Backend:** Django with Django REST Framework
- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Database:** PostgreSQL (via Docker)
- **Real-time:** Django Channels for WebSocket support
- **Authentication:** OAuth 2.0 integration
