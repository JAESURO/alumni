# Yield Forecast Application

A hybrid Java/Python application for crop yield forecasting using Google Earth Engine satellite data.

## Prerequisites

- **Java 17+** (JDK)
- **Maven 3.6+**
- **Python 3.7+**
- **Google Earth Engine Account** (free for non-commercial use)

## Project Structure

```
code/
├── .env                          # Environment configuration
├── .gitignore                    # Git ignore rules
├── pom.xml                       # Maven configuration
├── crop_forecasting.csv          # Historical crop data
├── src/
│   ├── main/
│   │   ├── java/com/yieldforecast/
│   │   │   └── YieldForecast.java
│   │   └── python/
│   │       └── yield_forecast.py
└── README.md
```

## Setup Instructions

### 1. Clone/Download the Project

```bash
cd /path/to/your/workspace
```

### 2. Set Up Python Virtual Environment

```bash
python3 -m venv /path/to/XXXXX/venv
source /path/to/XXXXX/venv/bin/activate
pip install earthengine-api
```

### 3. Authenticate with Google Earth Engine

```bash
source /path/to/XXXXX/venv/bin/activate
earthengine authenticate
```

Follow the browser prompt to authorize your account.

### 4. Configure Environment Variables

Edit the `.env` file in the project root:

```bash
PYTHON_VENV_PATH=/path/to/XXXXX/venv/bin/python
GEE_PROJECT_ID=XXXXX-XXXXX
```

Replace:
- `/path/to/XXXXX/venv/bin/python` with your actual Python venv path
- `XXXXX-XXXXX` with your GEE project ID from [Google Earth Engine](https://code.earthengine.google.com/)

## Running the Application

```bash
mvn clean compile exec:java -Dexec.mainClass="com.yieldforecast.YieldForecast"
```

Or for faster subsequent runs:

```bash
mvn compile exec:java -Dexec.mainClass="com.yieldforecast.YieldForecast"
```

## Expected Output

```
Starting Yield Forecast Application (Hybrid Java/Python)...
Fetching data from Google Earth Engine via Python...
GEE Data Received: {"NDVI": 0.4157061619769728}
Processing NDVI: 0.4157061619769728
Predicted Yield: 19.16 c/ha
```

## Configuration Files

### `.env`
Contains sensitive environment variables:
- `PYTHON_VENV_PATH`: Path to your Python virtual environment
- `GEE_PROJECT_ID`: Your Google Earth Engine project ID

### `src/main/python/yield_forecast.py`
Contains:
- Area of Interest coordinates (line 11)
- Date range for satellite data (lines 14-15)

## Troubleshooting

### Authentication Error
```
Please authorize access to your Earth Engine account
```
**Solution**: Run `earthengine authenticate` in your terminal.

### Project Permission Error
```
Caller does not have required permission to use project
```
**Solution**: Verify your GEE project ID in `yield_forecast.py` matches your actual project.

### Python Not Found
```
Python script failed with exit code
```
**Solution**: Check that `PYTHON_VENV_PATH` in `.env` points to the correct Python executable.

## Dependencies

**Java (Maven):**
- `org.json:json` - JSON parsing
- `io.github.cdimascio:dotenv-java` - Environment variables

**Python (pip):**
- `earthengine-api` - Google Earth Engine client

## License

This project is for educational/research purposes.