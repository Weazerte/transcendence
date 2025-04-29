# Getting Started

## Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Git

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/suiramdev/ft_transcendence.git
   cd ft_transcendence
   ```

2. Run the setup command:
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

## Development Commands

See the full list of available commands with:

```bash
make help
```