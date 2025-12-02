# Yield Forecast Application

A full-stack application for agricultural yield forecasting using satellite imagery from Google Earth Engine. The system analyzes vegetation indices (NDVI, NDMI, RECI) to predict crop yields for user-defined geographic areas.

## Features

- **Interactive Map Interface**: Draw zones (circles, rectangles, polygons) to define forecast areas
- **Satellite Data Analysis**: Automated retrieval and processing of Sentinel-2 imagery
- **Data Availability Checker**: Verify satellite coverage before running forecasts
- **Multiple Vegetation Indices**: Support for NDVI, NDMI, and RECI
- **Real-time Forecasting**: Background processing with status polling
- **Historical Data Management**: View, update, and delete previous forecasts

## Tech Stack

### Backend
- **Java 17+** with Spring Boot 3.2
- **SQLite** database
- **Python 3.9+** for Google Earth Engine integration

### Frontend
- **Next.js 16** with React
- **TypeScript**
- **Leaflet** for interactive maps
- **Tailwind CSS** for styling

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+
- Python 3.9+ with virtual environment
- Google Earth Engine account

## Installation

### 1. Clone and Configure

```bash
git clone <repository-url>
cd code
./bin/configure.sh
```

The configuration script will:
- Install Python dependencies in a virtual environment
- Build the backend with Maven
- Install frontend dependencies

### 2. Environment Configuration

**Backend Configuration:**

Copy the example file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` and set your values:
```bash
PYTHON_VENV_PATH=/path/to/your/venv/bin/python3
GEE_PROJECT_ID=your-gee-project-id
```

**Frontend Configuration:**

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` if you need to change the API URL (default is `http://localhost:8080`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Google Earth Engine Setup

**Authenticate:**
```bash
earthengine authenticate
```

**Verify Configuration:**
After starting the backend, verify the GEE connection:
```bash
curl http://localhost:8080/api/health/gee
```

## Running the Application

### Start Backend
```bash
./bin/run_backend.sh
```
Backend runs on `http://localhost:8080`

### Start Frontend
```bash
./bin/run_frontend.sh
```
Frontend runs on `http://localhost:3000`

## Usage

1. **Navigate to Dashboard**: Open `http://localhost:3000/dashboard`

2. **Select Location**: 
   - Search for a location using the search bar
   - Or navigate the map manually

3. **Draw Forecast Zone**:
   - Use the drawing tools (circle, rectangle, polygon)
   - Circle tool allows precise radius control via scroll

4. **Check Data Availability**:
   - Automatically triggered after drawing
   - Shows satellite image count and quality

5. **Configure Forecast**:
   - Select vegetation index (NDVI, NDMI, RECI)
   - Choose date range
   - Click "Run Forecast"

6. **View Results**:
   - Results appear in the table below
   - Shows coordinates, index value, and yield prediction
   - Use "Refresh Data" button if needed

## API Endpoints

### Yield Records
- `GET /api/yields` - Get all records
- `GET /api/yields/{id}` - Get specific record
- `POST /api/yields` - Create record
- `PUT /api/yields/{id}` - Update record
- `DELETE /api/yields/{id}` - Delete record

### Forecasting
- `POST /api/forecast/run` - Start forecast process
- `GET /api/forecast/status` - Check forecast status
- `POST /api/forecast/check-availability` - Check satellite data availability

### Health
- `GET /api/health` - Application health
- `GET /api/health/gee` - Google Earth Engine status

## Configuration

### Environment Variables

**Backend (`.env`):**
```bash
PYTHON_VENV_PATH=/path/to/your/venv/bin/python3
GEE_PROJECT_ID=your-gee-project-id
```

**Frontend (`.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:sqlite:yield_forecast.db
python.executable=${PYTHON_VENV_PATH:/home/suros/Documents/Tools/Languages/venv/bin/python3}
server.port=8080
logging.level.com.yieldforecast=DEBUG
```

### Frontend API Configuration
The frontend uses `app/config/api.ts` to manage the API URL:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

## Troubleshooting

### Port Already in Use
```bash
fuser -k 8080/tcp  # Kill process on port 8080
fuser -k 3000/tcp  # Kill process on port 3000
```

### Python Script Timeout
- Increase timeout in `ForecastController.java` (currently 120s)
- Check GEE quota limits
- Reduce forecast area size

### No Satellite Data
- Verify date range (future dates use previous year's data)
- Check cloud coverage threshold (currently <20%)
- Try a different location or larger area

## Development

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Tests
```bash
mvn test
```

### Database Location
```
./yield_forecast.db
```

## License

[Your License Here]

## Contributors

[Your Name/Team]