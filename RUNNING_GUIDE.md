# Running the Dreamrs Lab Project

This guide explains how to set up and run the Dreamrs Lab website and backend.

## Prerequisites

- **Node.js**: Ensure Node.js is installed. (v16+ recommended)
- **MongoDB**: Ensure a local MongoDB instance is running on `mongodb://localhost:27017`.

## Installation

1.  **Install Root Dependencies**
    Open a terminal in the project root (`.../dreamrs`) and run:
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**
    Navigate to the backend directory and run install:
    ```bash
    cd backend
    npm install
    ```

3.  **Configuration**
    The backend requires a `.env` file in the `backend/` directory. One has been created for you with the following default configuration:
    ```env
    MONGODB_URI=mongodb://localhost:27017/dreamrs
    PORT=5001
    NODE_ENV=development
    CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500,http://localhost:5500
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=password
    JWT_SECRET=dev-secret-key-change-in-production
    ```
    *Note: The backend runs on Port 5001 to avoid conflicts and match frontend config.*

## Running the Project

### 1. Start the Backend Server

Open a terminal in the `backend` directory and run:

```bash
npm run dev
```
You should see:
```text
DREAMRS Backend Server Started
Port: 5001
MongoDB: Connected
```

### 2. Run the Frontend

Since the frontend uses vanilla HTML/JS, you can serve it using any static file server.

**Option A: VS Code Live Server**
- Open `index.html` in VS Code.
- Click "Go Live" at the bottom right.

**Option B: Python Simple Server**
In the project root:
```bash
python -m http.server 5500
```
Then visit `http://localhost:5500`.

## Health Check
To verify the backend is running, visit:
[http://localhost:5001/api/health](http://localhost:5001/api/health)
