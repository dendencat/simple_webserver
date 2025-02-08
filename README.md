# Simple Web Server

A simple blog web server with a backend API and a frontend built with Vite.

## Project Structure

- **backend/**  
  Contains the Express-based backend API. See:
  - [server.js](backend/server.js) - Main server and API endpoints.
  - [package.json](backend/package.json) - Backend dependencies and start script.
  - [Dockerfile](backend/Dockerfile) - Docker instructions for the backend.

- **frontend/**  
  Contains the frontend assets and Vite-based build. See:
  - [index.html](frontend/index.html) - Main HTML file.
  - [script.js](frontend/script.js) - Frontend JavaScript fetching blog articles.
  - [style.css](frontend/style.css) - Basic styles.
  - [package.json](frontend/package.json) - Frontend dependencies and scripts.
  - [Dockerfile](frontend/Dockerfile) - Docker build instructions for loading the static site via nginx.

- **docker-compose.yml**  
  Sets up the multi-container environment for:
  - A PostgreSQL database.
  - The backend service.
  - The frontend service.

- **.dockerignore**  
  Excludes node_modules from the Docker build context.

## Running the Application

### With Docker

Ensure you have Docker and Docker Compose installed. Then run:

```sh
docker-compose up --build
