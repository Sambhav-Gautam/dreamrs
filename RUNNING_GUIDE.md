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

## Running the Project Locally (Unified Server)

We have created an alternative unified single-server setup that exactly replicates the production Vercel deployment where the API and Website run concurrently on the exact same port.

Open a terminal in the root project folder (`.../dreamrs`) and run:

```bash
npm start
```

This will automatically serve both your frontend assets AND handle your `api/index.js` backend routes via a single server.

You should see:
```text
🚀 Unified Local Server is running at http://localhost:3000
Backend is accessible at http://localhost:3000/api/health
Frontend is accessible at http://localhost:3000
```
Then visit `http://localhost:3000`.

### Alternative (Legacy Approach): Separate Servers

If you still wish to run the backend and frontend separately (e.g., using Live Server):

1. **Start Backend**: `cd backend && npm run dev` (Runs on `http://localhost:5001/api/health`) 
2. **Start Frontend**: Open `index.html` with VS Code Live Server or run `python -m http.server 5500`.

## Health Check
To verify the backend is running, visit:
[http://localhost:5001/api/health](http://localhost:5001/api/health)
