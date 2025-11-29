import ee
import json
import sys
import os
import warnings

# Suppress warnings to ensure only JSON is output to stdout
warnings.filterwarnings("ignore")

def main():
    try:
        project_id = os.getenv('GEE_PROJECT_ID')
        ee.Initialize(project=project_id)

        chaglinka_point = ee.Geometry.Point([69.1160279, 53.1699733])
        aoi = chaglinka_point.buffer(5000)

        dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                  .filterBounds(aoi) \
                  .filterDate(ee.Date('2024-01-01'), ee.Date('2024-12-31')) \
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                  .median() \
                  .clip(aoi)

        ndvi = dataset.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        stats = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=10,
            maxPixels=1e9
        )

        result = stats.getInfo()
        
        if not result:
            result = {"NDVI": 0.0, "note": "No data found or GEE error"}
        
        print(json.dumps(result))

    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()