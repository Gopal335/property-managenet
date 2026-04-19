# Property Listing Management (MERN)

This is a full-stack MERN app to:

- Create and manage property listings
- Attach a Google Drive folder per property
- Import only images/videos from that folder
- Preview imported media in the web app
- Auto-generate a `README.md` report of all media files and metadata

## Project Structure

- `server/` - Express + MongoDB API
- `client/` - React (Vite) frontend

## Backend Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/property_listing_management
GOOGLE_API_KEY=your_google_api_key_here
```

> Important: the Drive folder and files must be shared publicly (or at least accessible by your API key context) so the app can read metadata and preview links.

## Run Locally

### 1) Start MongoDB

Run MongoDB locally (or use MongoDB Atlas and set `MONGO_URI` accordingly).

### 2) Start backend

```bash
cd server
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3) Start frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Endpoints

- `GET /api/health`
- `POST /api/properties` - Create property
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get one property
- `POST /api/properties/:id/import-drive` - Import media from Google Drive and generate README
- `GET /api/properties/:id/readme` - Get generated markdown README

## Usage Flow

1. Create a property from the UI (title + Drive folder URL required)
2. Click **Import Drive Media**
3. App extracts photos/videos and shows previews
4. Click **View README** to load markdown report
5. Click **Download README** to save the report file
