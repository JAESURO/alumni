import ee
import json
import sys
import os
import warnings

warnings.filterwarnings("ignore")

def main():
    try:
        if len(sys.argv) < 2:
            error_msg = "No geometry provided"
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        geometry_json = sys.argv[1]
        parameter = sys.argv[2] if len(sys.argv) > 2 else 'NDVI'
        start_date = sys.argv[3] if len(sys.argv) > 3 else '2024-01-01'
        end_date = sys.argv[4] if len(sys.argv) > 4 else '2024-12-31'

        project_id = os.getenv('GEE_PROJECT_ID')
        if not project_id:
            error_msg = "GEE_PROJECT_ID not set. Please set it in .env file or as environment variable."
            print(json.dumps({"error": error_msg}), file=sys.stderr)
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        try:
            ee.Initialize(project=project_id)
        except Exception as e:
            error_msg = f"Failed to initialize GEE: {str(e)}"
            print(json.dumps({"error": error_msg}), file=sys.stderr)
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

        from datetime import datetime, timedelta
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        if start_dt >= end_dt:
            end_dt = end_dt + timedelta(days=1)
            end_date = end_dt.strftime('%Y-%m-%d')

        def fetch_index_data(start_date_str, end_date_str, parameter_str):
            try:
                dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                          .filterBounds(ee_geom) \
                          .filterDate(ee.Date(start_date_str), ee.Date(end_date_str)) \
                          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                          .median() \
                          .clip(ee_geom)

                if parameter_str == 'NDVI':
                    index = dataset.normalizedDifference(['B8', 'B4']).rename(parameter_str)
                elif parameter_str == 'NDMI':
                    index = dataset.normalizedDifference(['B8', 'B11']).rename(parameter_str)
                elif parameter_str == 'RECI':
                    index = dataset.expression('(B8 / B5) - 1', {
                        'B8': dataset.select('B8'), 
                        'B5': dataset.select('B5')
                    }).rename(parameter_str)
                else:
                    index = dataset.normalizedDifference(['B8', 'B4']).rename('NDVI')
                
                stats = index.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=100,
                    maxPixels=1e10,
                    bestEffort=True
                )
                
                result = stats.getInfo()
                return result if result and parameter_str in result else None
            except Exception as e:
                return None
        
        result = fetch_index_data(start_date, end_date, parameter)
        
        if not result:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            start_dt = start_dt.replace(year=start_dt.year - 1)
            end_dt = end_dt.replace(year=end_dt.year - 1)
            start_date_prev = start_dt.strftime('%Y-%m-%d')
            end_date_prev = end_dt.strftime('%Y-%m-%d')
            result = fetch_index_data(start_date_prev, end_date_prev, parameter)

        if not result:
            result = {parameter: 0.0, "note": f"No data available for date range {start_date} to {end_date}. Used fallback value 0.0."}
        
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