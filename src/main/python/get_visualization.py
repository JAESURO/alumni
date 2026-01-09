import ee
import sys
import json
import os

def get_visualization(geometry_json, start_date, end_date, parameter):
    try:
        project_id = os.environ.get('GEE_PROJECT_ID')
        if not project_id:
            raise ValueError("GEE_PROJECT_ID environment variable is not set")
        ee.Initialize(project=project_id)
        
        parsed_geo = json.loads(geometry_json)
        if parsed_geo['type'] == 'Point' and 'radius' in parsed_geo:
             geometry = ee.Geometry.Point(parsed_geo['coordinates']).buffer(parsed_geo['radius'])
        elif parsed_geo['type'] == 'Point' and 'properties' in parsed_geo and 'radius' in parsed_geo['properties']:
             geometry = ee.Geometry.Point(parsed_geo['coordinates']).buffer(parsed_geo['properties']['radius'])
        else:
             geometry = ee.Geometry(parsed_geo)
        
        if start_date == end_date:
            from datetime import datetime, timedelta
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            end_date = (end_dt + timedelta(days=1)).strftime('%Y-%m-%d')

        collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(geometry) \
            .filterDate(start_date, end_date) \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        
        def calculate_index(image):
            if parameter == 'NDVI':
                nir = image.select('B8')
                red = image.select('B4')
                index = nir.subtract(red).divide(nir.add(red)).rename('index')
            elif parameter == 'NDMI':
                nir = image.select('B8')
                swir = image.select('B11')
                index = nir.subtract(swir).divide(nir.add(swir)).rename('index')
            elif parameter == 'RECI':
                nir = image.select('B8')
                red = image.select('B4')
                red_edge = image.select('B5')
                index = nir.divide(red).subtract(1).multiply(red_edge.divide(red)).rename('index')
            else:
                raise ValueError(f"Unknown parameter: {parameter}")
            
            return image.addBands(index)
        
        collection_with_index = collection.map(calculate_index)
        median_index = collection_with_index.select('index').median().clip(geometry)
        
        vis_params = {
            'NDVI': {
                'min': -1,
                'max': 1,
                'palette': ['red', 'yellow', 'green']
            },
            'NDMI': {
                'min': -1,
                'max': 1,
                'palette': ['blue', 'cyan', 'green']
            },
            'RECI': {
                'min': 0,
                'max': 10,
                'palette': ['yellow', 'orange', 'red']
            }
        }
        
        vis = vis_params[parameter]
        
        map_id = median_index.getMapId(vis)
        
        result = {
            'tile_url': map_id['tile_fetcher'].url_format,
            'parameter': parameter,
            'vis_params': vis,
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        }
        
        print(json.dumps(result))
        return 0
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'parameter': parameter
        }
        print(json.dumps(error_result))
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print(json.dumps({'error': 'Usage: get_visualization.py <geometry_json> <start_date> <end_date> <parameter>'}))
        sys.exit(1)
    
    geometry_json = sys.argv[1]
    start_date = sys.argv[2]
    end_date = sys.argv[3]
    parameter = sys.argv[4]
    
    sys.exit(get_visualization(geometry_json, start_date, end_date, parameter))