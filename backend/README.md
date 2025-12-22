# DREAMRS Backend API

A separated backend API for the DREAMRS Lab website, using **Express.js** and **MongoDB** with **GridFS** for file storage.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB & GridFS configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── fileController.js
│   │   ├── openingController.js
│   │   ├── researchController.js
│   │   └── teamController.js
│   ├── models/
│   │   ├── Course.js
│   │   ├── Opening.js
│   │   ├── Research.js
│   │   └── Team.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── files.js
│   │   ├── openings.js
│   │   ├── research.js
│   │   └── team.js
│   ├── utils/
│   │   └── migrate.js       # Data migration script
│   └── server.js            # Main entry point
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** v6+ (local or MongoDB Atlas)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your settings:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dreamrs
   PORT=5000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔄 Data Migration

To migrate existing data from the old filesystem-based storage to MongoDB:

```bash
# From the backend directory
node src/utils/migrate.js --data-path ../

# Or with a custom path
node src/utils/migrate.js --data-path /path/to/old/dreamrs
```

This will:
- Import JSON data from `data/*.json` files
- Upload PDFs and images to MongoDB GridFS
- Create proper references between documents and files

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Admin login |
| POST | `/api/auth/login` | Admin login (alt) |
| GET | `/api/auth/verify` | Verify token |

### Research Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/research` | Get all research data |
| POST | `/api/data/research` | Update all research data |
| POST | `/api/data/research/publications` | Add publication |
| PUT | `/api/data/research/publications/:index` | Update publication |
| DELETE | `/api/data/research/publications/:index` | Delete publication |
| POST | `/api/data/research/collaborations` | Add collaboration |
| DELETE | `/api/data/research/collaborations/:index` | Delete collaboration |

### Team Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/team` | Get all team data |
| POST | `/api/data/team` | Update all team data |
| POST | `/api/data/team/members/:category` | Add member |
| PUT | `/api/data/team/members/:category/:index` | Update member |
| DELETE | `/api/data/team/members/:category/:index` | Delete member |

Categories: `phd_scholars`, `masters_students`, `btech_students`, `alumni`

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/courses` | Get all courses |
| POST | `/api/data/courses` | Update all courses |
| POST | `/api/data/courses/add` | Add course |
| PUT | `/api/data/courses/:id` | Update course |
| DELETE | `/api/data/courses/:id` | Delete course |

### Openings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/openings` | Get all openings |
| POST | `/api/data/openings` | Update all openings |
| POST | `/api/data/openings/:category` | Add opening |
| DELETE | `/api/data/openings/:category/:index` | Delete opening |

### File Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file |
| POST | `/api/files/upload` | Upload file (alt) |
| GET | `/api/files/list` | List files |
| GET | `/api/files/download/:filename` | Download by filename |
| GET | `/api/files/id/:id` | Download by ID |
| POST | `/api/delete-file` | Delete file |
| DELETE | `/api/files/id/:id` | Delete file by ID |

## 🔧 File Storage

Files are stored in MongoDB using **GridFS**, which is ideal for:
- Files larger than 16MB
- Streaming large files
- Keeping all data in one database
- Easier backup and replication

### File Types Supported
- **PDFs**: Job openings, publications
- **Images**: Team photos, publication images

## 🚢 Deployment

### Docker Deployment (Recommended)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dreamrs
PORT=5000
NODE_ENV=production
CORS_ORIGINS=https://dreamrs.iiitd.ac.in
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
```

### Platforms

- **Railway**: Connect GitHub repo, add environment variables
- **Render**: Create Web Service, add MongoDB connection
- **Heroku**: Use MongoDB Atlas add-on
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS/GCP/Azure**: Use container services

## 📝 Development Notes

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create model in `src/models/` (if needed)
3. Create route in `src/routes/`
4. Register route in `src/server.js`

### GridFS Bucket Name

The GridFS bucket is named `uploads`. Files are stored in:
- `uploads.files` - File metadata
- `uploads.chunks` - File binary data

## 🔐 Security Considerations

1. Change default admin credentials in production
2. Use HTTPS in production
3. Set appropriate CORS origins
4. Consider adding rate limiting
5. Add proper JWT authentication for production

## 📄 License

ISC
