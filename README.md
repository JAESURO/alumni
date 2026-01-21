# AgroTrack

A full-stack application for agricultural yield forecasting using satellite imagery from Google Earth Engine. The system analyzes vegetation indices (NDVI, NDMI, RECI) to predict crop yields for user-defined geographic areas and provides notifications via Telegram.

## Features

- **Interactive Mapping**: Search and select locations, then draw customized forecast zones (circles, rectangles, or polygons).
- **Satellite Analysis**: Integration with Sentinel-2 imagery via Google Earth Engine for real-time data processing.
- **Vegetation Indices**: Support for multiple indices including NDVI, NDMI, and RECI.
- **Concurrent Processing**: Backend designed to handle multiple forecast requests simultaneously.
- **Telegram Notifications**: Real-time alerts and forecast results sent directly to your Telegram bot.
- **Secure Authentication**: Session-based security with user-specific data isolation and record management.

## Project Structure

```text
.
├── bin/                    # Automation and execution scripts
├── frontend/               # Next.js web application
├── src/
│   ├── main/
│   │   ├── java/           # Spring Boot backend source
│   │   ├── python/         # GEE processing and forecasting scripts
│   │   └── resources/      # Backend configuration (application.properties)
├── pom.xml                 # Maven configuration
└── yield_forecast.db       # SQLite database (auto-generated)
```

## Tech Stack

**Frontend**:
- Next.js 16.0.5
- React 19
- TypeScript
- Tailwind CSS 4
- Google Maps Platform (JavaScript API)

**Backend**:
- Java 17
- Spring Boot 3.2.0
- Spring Security
- SQLite
- Python 3.9+

**External APIs**:
- Google Earth Engine
- Telegram Bot API

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- Python 3.9+ with virtual environment
- Google Earth Engine account
- Telegram Bot

## Setup

### 1. Clone and Configure

```bash
git clone <repository-url>
cd code
./bin/configure.sh
```

### 2. Environment Configuration

**Backend:**
Copy `.env.example` to `.env` and configure:
```bash
PYTHON_VENV_PATH=/path/to/your/venv/bin/python3
GEE_PROJECT_ID=your-gee-project-id
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

### 3. Google Earth Engine Authentication

```bash
earthengine authenticate
```

## Running the Application

### Backend
Start the Spring Boot server:
```bash
./bin/run_backend.sh
```
Runs on `http://localhost:8080`

### Frontend
Start the Next.js development server:
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