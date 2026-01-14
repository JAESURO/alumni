'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    APIProvider,
    Map,
    useMap,
    useMapsLibrary,
    ControlPosition,
    MapControl
} from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface TileLayerData {
    url: string;
    opacity: number;
    visible: boolean;
}

interface MapComponentProps {
    onZoneDrawn?: (geometry: any) => void;
    onZoneEdited?: (geometry: any) => void;
    onZoneDeleted?: () => void;
    selectedGeometry?: any;
    mapCenter?: [number, number];
    tileLayers?: {
        NDVI?: TileLayerData;
        NDMI?: TileLayerData;
        RECI?: TileLayerData;
    };
}

function DrawingManager({
    onZoneDrawn,
    onZoneEdited,
    onZoneDeleted
}: {
    onZoneDrawn?: (geometry: any) => void;
    onZoneEdited?: (geometry: any) => void;
    onZoneDeleted?: () => void;
}) {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const overlayRef = useRef<any>(null);

    const clearOverlay = useCallback(() => {
        if (overlayRef.current) {
            overlayRef.current.setMap(null);
            overlayRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!map || !drawing) return;

        const manager = new drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.RECTANGLE,
                    google.maps.drawing.OverlayType.CIRCLE,
                ],
            },
            polygonOptions: {
                editable: true,
                draggable: true,
                fillColor: '#3b82f6',
                strokeColor: '#1e40af',
                fillOpacity: 0.2,
                strokeWeight: 2,
            },
            rectangleOptions: {
                editable: true,
                draggable: true,
                fillColor: '#3b82f6',
                strokeColor: '#1e40af',
                fillOpacity: 0.2,
                strokeWeight: 2,
            },
            circleOptions: {
                editable: true,
                draggable: true,
                fillColor: '#3b82f6',
                strokeColor: '#1e40af',
                fillOpacity: 0.2,
                strokeWeight: 2,
            }
        });

        manager.setMap(map);
        setDrawingManager(manager);

        return () => {
            manager.setMap(null);
        };
    }, [map, drawing]);

    useEffect(() => {
        if (!drawingManager) return;

        const convertOverlayToGeoJSON = (overlay: any, type: string) => {
            let geometry: any = null;

            if (type === 'polygon' || type === 'rectangle') {
                const path = type === 'rectangle' ? overlay.getBounds() : overlay.getPath();
                let coordinates = [];

                if (type === 'rectangle') {
                    const ne = path.getNorthEast();
                    const sw = path.getSouthWest();
                    coordinates = [[
                        [sw.lng(), sw.lat()],
                        [sw.lng(), ne.lat()],
                        [ne.lng(), ne.lat()],
                        [ne.lng(), sw.lat()],
                        [sw.lng(), sw.lat()]
                    ]];
                } else {
                    const latLngs = path.getArray();
                    const ring = latLngs.map((ll: any) => [ll.lng(), ll.lat()]);
                    if (ring.length > 0) {
                        ring.push(ring[0]);
                    }
                    coordinates = [ring];
                }

                geometry = {
                    type: 'Polygon',
                    coordinates: coordinates
                };
            } else if (type === 'circle') {
                const center = overlay.getCenter();
                const radius = overlay.getRadius();
                geometry = {
                    type: 'Point',
                    coordinates: [center.lng(), center.lat()],
                    radius: radius
                };
            }
            return geometry;
        };

        const handleOverlayComplete = (e: google.maps.drawing.OverlayCompleteEvent) => {
            clearOverlay();

            const overlay = e.overlay;
            overlayRef.current = overlay;
            drawingManager.setDrawingMode(null);

            if (onZoneDrawn) {
                const type = e.type;
                const geometry = convertOverlayToGeoJSON(overlay, type as string);
                if (geometry) onZoneDrawn(geometry);
            }

            const EVENTS = ['bounds_changed', 'radius_changed', 'center_changed', 'mouseup'];

            if (e.type === 'circle') {
                const circle = overlay as google.maps.Circle;
                google.maps.event.addListener(circle, 'radius_changed', () => {
                    const geometry = convertOverlayToGeoJSON(circle, 'circle');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
                google.maps.event.addListener(circle, 'center_changed', () => {
                    const geometry = convertOverlayToGeoJSON(circle, 'circle');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
            } else if (e.type === 'polygon') {
                const polygon = overlay as google.maps.Polygon;
                google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
                    const geometry = convertOverlayToGeoJSON(polygon, 'polygon');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
                google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
                    const geometry = convertOverlayToGeoJSON(polygon, 'polygon');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
                google.maps.event.addListener(polygon.getPath(), 'remove_at', () => {
                    const geometry = convertOverlayToGeoJSON(polygon, 'polygon');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
            } else if (e.type === 'rectangle') {
                const rectangle = overlay as google.maps.Rectangle;
                google.maps.event.addListener(rectangle, 'bounds_changed', () => {
                    const geometry = convertOverlayToGeoJSON(rectangle, 'rectangle');
                    if (onZoneEdited) onZoneEdited(geometry);
                });
            }
        };

        const listener = google.maps.event.addListener(drawingManager, 'overlaycomplete', handleOverlayComplete);

        return () => {
            google.maps.event.removeListener(listener);
        };

    }, [drawingManager, onZoneDrawn, onZoneEdited, clearOverlay]);

    return null;
}

function TileLayerOverlay({ tileLayers }: { tileLayers?: { [key: string]: TileLayerData } }) {
    const map = useMap();
    const layersRef = useRef<{ [key: string]: { instance: google.maps.ImageMapType, url: string } }>({});


    useEffect(() => {
        if (!map || !tileLayers) return;

        Object.entries(tileLayers).forEach(([key, data]) => {
            if (data && data.url && data.visible) {
                const existing = layersRef.current[key];

                if (!existing || existing.url !== data.url) {
                    if (existing) {
                        const index = map.overlayMapTypes.getArray().indexOf(existing.instance);
                        if (index > -1) {
                            map.overlayMapTypes.removeAt(index);
                        }
                    }

                    const imageMapType = new google.maps.ImageMapType({
                        getTileUrl: (coord, zoom) => {
                            let url = data.url;
                            url = url.replace('{z}', zoom.toString());
                            url = url.replace('{x}', coord.x.toString());
                            url = url.replace('{y}', coord.y.toString());
                            return url;
                        },
                        tileSize: new google.maps.Size(256, 256),
                        opacity: data.opacity,
                        name: key
                    });

                    map.overlayMapTypes.push(imageMapType);
                    layersRef.current[key] = { instance: imageMapType, url: data.url };
                } else {
                    existing.instance.setOpacity(data.opacity);
                }
            } else {

                if (layersRef.current[key]) {
                    const existing = layersRef.current[key];
                    const index = map.overlayMapTypes.getArray().indexOf(existing.instance);
                    if (index > -1) {
                        map.overlayMapTypes.removeAt(index);
                    }
                    delete layersRef.current[key];
                }
            }
        });

        const currentKeys = Object.keys(layersRef.current);
        const newKeys = Object.keys(tileLayers || {});

        currentKeys.forEach(key => {
            if (!newKeys.includes(key)) {
                const existing = layersRef.current[key];
                const index = map.overlayMapTypes.getArray().indexOf(existing.instance);
                if (index > -1) {
                    map.overlayMapTypes.removeAt(index);
                }
                delete layersRef.current[key];
            }
        });

    }, [map, tileLayers]);

    return null;
}

function SelectedGeometry({ geometry }: { geometry: any }) {
    const map = useMap();
    const overlayRef = useRef<any>(null);

    useEffect(() => {
        if (!map) return;

        if (overlayRef.current) {
            overlayRef.current.setMap(null);
            overlayRef.current = null;
        }

        if (geometry) {
            if (geometry.type === 'Point' && geometry.radius) {

                const circle = new google.maps.Circle({
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    map: map,
                    center: { lat: geometry.coordinates[1], lng: geometry.coordinates[0] },
                    radius: geometry.radius
                });
                overlayRef.current = circle;
                const bounds = circle.getBounds();
                if (bounds) map.fitBounds(bounds);

            } else if (geometry.type === 'Polygon') {
                const paths = geometry.coordinates[0].map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }));
                const polygon = new google.maps.Polygon({
                    paths: paths,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    map: map
                });
                overlayRef.current = polygon;

                const bounds = new google.maps.LatLngBounds();
                paths.forEach((p: any) => bounds.extend(p));
                map.fitBounds(bounds);
            }
        }

        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
        };

    }, [map, geometry]);

    return null;
}

export default function MapComponent({
    onZoneDrawn,
    onZoneEdited,
    onZoneDeleted,
    selectedGeometry,
    mapCenter,
    tileLayers
}: MapComponentProps) {
    if (!API_KEY) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-red-500">Missing Google Maps API Key</div>;
    }

    const defaultCenter = { lat: 51.505, lng: -0.09 };
    const center = mapCenter ? { lat: mapCenter[0], lng: mapCenter[1] } : defaultCenter;

    return (
        <APIProvider apiKey={API_KEY}>
            <div className="h-full w-full rounded-lg overflow-hidden relative">
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={6}
                    center={mapCenter ? center : undefined}
                    mapTypeId={'satellite'}
                    style={{ width: '100%', height: '100%' }}
                    disableDefaultUI={false}
                    zoomControl={true}
                    mapTypeControl={true}
                    streetViewControl={false}
                >
                    <DrawingManager
                        onZoneDrawn={onZoneDrawn}
                        onZoneEdited={onZoneEdited}
                        onZoneDeleted={onZoneDeleted}
                    />
                    <TileLayerOverlay tileLayers={tileLayers} />
                    <SelectedGeometry geometry={selectedGeometry} />
                </Map>
            </div>
        </APIProvider>
    );
}