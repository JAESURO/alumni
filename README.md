# AgroTrack


A full-stack application for agricultural yield forecasting using satellite imagery from Google Earth Engine. The system analyzes vegetation indices (NDVI, NDMI, RECI) to predict crop yields for user-defined geographic areas.

## Features

- User authentication with session-based security
- Interactive map interface with zone drawing and editing
- Satellite data analysis using Sentinel-2 imagery
- Multiple vegetation indices (NDVI, NDMI, RECI)
- Concurrent forecast processing
- User-specific data isolation

## Tech Stack

**Backend**: Java 17+ with Spring Boot 3.2, Spring Security, SQLite, Python 3.9+  
**Frontend**: Next.js 16, React, TypeScript, Leaflet, Tailwind CSS

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- Python 3.9+ with virtual environment
- Google Earth Engine account

## Setup

### 1. Clone and Configure

```bash
git clone <repository-url>
cd code
./bin/configure.sh
```

### 2. Environment Configuration

**Backend:**
```bash
cp .env.example .env
```
Edit `.env`:
```bash
PYTHON_VENV_PATH=/path/to/your/venv/bin/python3
GEE_PROJECT_ID=your-gee-project-id
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```
Edit `.env.local` (optional):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Google Earth Engine

```bash
earthengine authenticate
```

## Running

**Backend:**
```bash
./bin/run_backend.sh
```
Runs on `http://localhost:8080`

**Frontend:**
```bash
./bin/run_frontend.sh
```
Runs on `http://localhost:3000`

## Usage

1. Register at `http://localhost:3000/register`
2. Login at `http://localhost:3000/login`
3. Navigate to dashboard
4. Search or select location on map
5. Draw forecast zone (circle, rectangle, or polygon)
6. Select vegetation index and date range
7. Click "Run Forecast"
8. View results in table below

## API Endpoints

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Yield Records:**
- `GET /api/yields`
- `GET /api/yields/{id}`
- `POST /api/yields`
- `PUT /api/yields/{id}`
- `DELETE /api/yields/{id}`

**Forecasting:**
- `POST /api/forecast/run`
- `POST /api/forecast/check-availability`

**Health:**
- `GET /api/health`
- `GET /api/health/gee`

## Troubleshooting

**Port in use:**
```bash
fuser -k 8080/tcp
fuser -k 3000/tcp
```

**No satellite data:**
- Verify date range
- Check cloud coverage threshold
- Try different location or larger area

## Development

**Build frontend:**
```bash
cd frontend
npm run build
```

**Run tests:**
```bash
mvn test
```