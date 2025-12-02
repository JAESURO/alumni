import ee
import json
import sys
import os
import warnings
from datetime import datetime

warnings.filterwarnings("ignore")

def main():
    try:
        if len(sys.argv) < 2:
            error_msg = "No geometry provided"
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        geometry_json = sys.argv[1]
        start_date = sys.argv[2] if len(sys.argv) > 2 else '2024-01-01'
        end_date = sys.argv[3] if len(sys.argv) > 3 else '2024-12-31'

        from datetime import datetime, timedelta
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        if start_dt >= end_dt:
            end_dt = end_dt + timedelta(days=1)
            end_date = end_dt.strftime('%Y-%m-%d')

        project_id = os.getenv('GEE_PROJECT_ID')
        if not project_id:
            error_msg = "GEE_PROJECT_ID not set"
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        try:
            ee.Initialize(project=project_id)
        except Exception as e:
            error_msg = f"Failed to initialize GEE: {str(e)}"
            print(json.dumps({"error": error_msg}))
            sys.exit(1)

        geometry_dict = json.loads(geometry_json)
        
        geom_type = geometry_dict.get('type')
        if not geom_type:
            error_msg = "Geometry type not found"
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        if geom_type == 'Point':
            coords = geometry_dict['coordinates']
            radius = geometry_dict.get('radius', 5000)
            ee_geom = ee.Geometry.Point(coords).buffer(radius)
        elif geom_type == 'Polygon':
            coords = geometry_dict['coordinates']
            ee_geom = ee.Geometry.Polygon(coords)
        else:
            ee_geom = ee.Geometry(geometry_dict)

        collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                      .filterBounds(ee_geom) \
                      .filterDate(ee.Date(start_date), ee.Date(end_date)) \
                      .sort('system:time_start', False)
        limited = collection.limit(30)
        try:
            times = limited.aggregate_array('system:time_start').getInfo()
        except Exception:
            times = []

        try:
            clouds = limited.aggregate_array('CLOUDY_PIXEL_PERCENTAGE').getInfo()
        except Exception:
            clouds = []

        available_dates = []

        for i, t in enumerate(times):
            try:
                date_millis = t
                cloud_cover = clouds[i] if i < len(clouds) else 0
                if date_millis:
                    date_str = datetime.fromtimestamp(date_millis / 1000).strftime('%Y-%m-%d')
                    available_dates.append({
                        'date': date_str,
                        'cloudCoverage': round(float(cloud_cover), 2),
                        'quality': 'good' if cloud_cover < 20 else 'medium' if cloud_cover < 50 else 'poor'
                    })
            except Exception:
                continue
        
        seen = set()
        unique_dates = []
        for item in available_dates:
            if item['date'] not in seen:
                seen.add(item['date'])
                unique_dates.append(item)
        
        size = collection.size().getInfo()
        
        result = {
            'totalImages': size,
            'availableDates': unique_dates[:10],
            'dateRange': {
                'start': start_date,
                'end': end_date
            }
        }
        
        print(json.dumps(result))

    except json.JSONDecodeError as e:
        error_response = {"error": f"JSON decode error: {str(e)}"}
        print(json.dumps(error_response))
        sys.exit(1)
    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()